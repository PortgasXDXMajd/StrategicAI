from fastapi import UploadFile
from app.helpers.config_helper import Core
from app.models.db_models.file import File
from typing import Dict, List, Tuple, Union
from app.helpers.file_helper import FileHelper
from app.models.db_models.company import Company
from app.repositories.unit_of_work import UnitOfWork
from app.core.cohere_retriever import CohereRetriever
from app.core.language_models.return_types.file.file_facts_rt import FactsRT
from app.core.language_models.prompts.file.file_facts_extractor import FileFactExtractorPrompts


class FileService:

    def __init__(self, company: Company, llm_config=None):
        self.company = company
        self.core_engine = Core(llm_config)
        self.repos = UnitOfWork()
        self.cohere_retriver = CohereRetriever()

    async def get(self, file_id: str):
        return await self.repos.files.get_by_id(file_id)

    async def delete(self, file_id: str):
        return await self.repos.files.delete(file_id)

    async def create(self, task_id: str, files: List[UploadFile]):
        return await self.get_facts(files=files, task_id=task_id, return_files=True)

    async def get_facts(self, files: List[UploadFile], task_id: str = None, tree_id: str = None, node_id: str = None, return_files: bool = False) -> Union[Dict[str, List[str]], List[File]]:
        facts_by_file = {}

        files_to_add_db = []
        for file in files:
            try:
                content = FileHelper.extract_full_content(file)
            except Exception as e:
                continue

            file_facts = await self.extract_facts(content)
            facts_by_file[file.filename] = file_facts.facts

            new_file = File(
                file_name=file.filename,
                facts=file_facts.facts,
                company_id=self.company.id,
                task_id=task_id,
                tree_id=tree_id,
                node_id=node_id
            )
            files_to_add_db.append(new_file)

        await self.repos.files.create(files=files_to_add_db)

        if return_files:
            return files_to_add_db

        return facts_by_file

    async def extract_facts(self, content: str) -> FactsRT:
        sys_prmt, usr_prmt = FileFactExtractorPrompts.get(
            content, self.company.profile)

        response, _ = await self.core_engine.model.generate(sys_prmt, usr_prmt, FactsRT)

        return response

    def get_context_from_files(self, files: List[File], queries) -> Tuple[bool, str]:

        if isinstance(queries, str):
            queries = [queries]

        context = 'No facts were found related to this query'

        if files and len(files) > 0:
            fact_to_file_map = {
                fact: file.file_name
                for file in files
                for fact in file.facts
            }

            facts = []
            facts = [fact for file in files for fact in file.facts]

            if len(facts) < 100 or queries is None:
                context = "\n".join([f"- File name: {fact_to_file_map[fact]} - Fact: {fact}" for fact in facts])
                return True, context

            context_list = []
            
            query_facts_dict = self.cohere_retriver.retrieve(queries, facts)

            for q, facts in query_facts_dict.items():
                for fact in facts:
                    context_list.append(f"- Query: {q} - File Name: {fact_to_file_map[fact]} - Fact: {fact}")

            context = "\n".join(context_list)

            return True, context

        return False, context
