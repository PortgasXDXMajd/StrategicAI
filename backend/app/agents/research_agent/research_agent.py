from typing import List, Tuple
from pydantic import BaseModel
from app.helpers.config_helper import Core
from app.models.db_models.node import Node
from app.models.db_models.task import Task
from app.helpers.llm_helper import LLMHelper
from app.models.db_models.company import Company
from app.services.file_service import FileService
from app.repositories.unit_of_work import UnitOfWork
from app.models.db_models.tree import Tree, TreeType
from app.helpers.connection_manager_helper import broadcast
from app.core.language_models.return_types.file.file_facts_rt import FactsRT
from app.core.language_models.prompts.node.needed_models import AssistantNode

class ResearchOption(BaseModel):
    from_files: bool
    from_online: bool

class Researcher:    
    def __init__(
            self, 
            company: Company = None, 
            tree: Tree = None, 
            task: Task = None, 
            root_node: Node = None, 
            llm_config=None):

        self.company = company
        self.tree = tree
        self.task = task
        self.root_node = root_node
        self.repos = UnitOfWork()
        self.core_engine = Core(llm_config)
        self.node = None
        self.target_node = None
        self.file_service = FileService(company, self.core_engine.llm_config)

    async def run(self, research_option: ResearchOption, node_id: str = None) -> Tuple[str|None, str|None]:
        await broadcast(self.tree.id, True, True)
        await broadcast(self.tree.id, "Running Research Agent", True)

        if node_id:
            self.node = await self.repos.nodes.get_node_with_children(node_id)
            if not self.node:
                raise Exception("Node was not found")
        self.target_node = self.node if self.node else self.root_node
        
        tree_builder_command_files = (await self._research_files() if research_option.from_files else None)
        tree_builder_command_online = (await self._research_online() if research_option.from_online else None)

        return tree_builder_command_files, tree_builder_command_online

    async def _research_files(self) -> str|None:
        await broadcast(self.tree.id, f"Verifying node from files: {self.target_node.text}", True)
        
        user_files = await self.repos.files.get_by_task_id(self.task.id)
        if not user_files:
            return None

        node_text_queries = await self.repos.nodes.get_node_var_with_children(
            self.target_node.id, var_name='text'
        )
        _, user_files_context = self.file_service.get_context_from_files(
            user_files, node_text_queries
        )

        return await self._build_file_command(user_files_context)

    async def _research_online(self) -> str|None:
        queries = await self._generate_queries()
        return await self._search_online(queries)

    async def _generate_queries(self) -> List[str]:
        await broadcast(self.tree.id, True, True)
        await broadcast(self.tree.id, "Generating search queries", True)
        await broadcast(self.tree.id, self.node.id if self.node else self.root_node.id, True)

        target_node = self.node if self.node else self.root_node
        prompt_template = self._get_query_prompt_template()
        
        search_query_generator_prompt = (
            f"Company and Task Information:\n{self.tree.payload}\n\n"
            f"{'Diagnostic' if self.tree.type == TreeType.WHY else 'Solution'} Issue Tree Structure:\n"
            f"{AssistantNode(target_node).model_dump_json(indent=2)}\n\n"
            f"{prompt_template}"
        )

        queries, _ = await LLMHelper.safe_generate_response(
            core_engine=self.core_engine,
            sys_prmt=None,
            usr_prmt=search_query_generator_prompt,
            is_history_required=False
        )
        return queries

    async def _search_online(self, queries: List[str]) -> str:
        search_results = {}
        
        for query in queries:
            await broadcast(self.tree.id, f"Searching: {query}", True)
            search_res = self.core_engine.search_engine.search(query, topk=3)
            urls = [res[0] for res in search_res.results]
            scraped_data = self.core_engine.scraper.scrape(urls)
            await broadcast(self.tree.id, f"Extracting facts for: {query}", True)
            
            extracted_data = await self.file_service.extract_facts(scraped_data)
            if isinstance(extracted_data, FactsRT):
                search_results[query] = extracted_data.facts

        return await self._build_online_command(search_results)

    async def _build_file_command(self, context: str) -> str:
        if self.node:
            subtree = await self.repos.nodes.get_node_var_with_children(self.node.id, 'text')
        
            return (
                f"Given facts that were found in the user files, which are relevant to the subtree "
                f"rooted at node with id: {self.node.id} (titled '{self.node.text}'),\n"
                f"{context}\n"
                "Incorporate this information within that subtree.\n"
                "You are not allowed to update any other part of the tree even if it needs update"
                "These are the nodes in the subtree you are allowed to edit:\n"
                f"{subtree}\n"
                "You are not allowed to update any other part of the tree even if it needs update"
            )
        return (
            "Given facts that were found in the user files,\n"
            f"{context}\n"
            "Incorporate this information within the tree structure."
        )

    async def _build_online_command(self, search_results: dict) -> str:
        if self.node:
            subtree = await self.repos.nodes.get_node_var_with_children(self.node.id, 'text')

            return (
                f"Given facts that were found online, which are relevant to the subtree "
                f"rooted at node with id: {self.node.id} (titled '{self.node.text}'),\n"
                f"{search_results}\n"
                "Incorporate this information within that subtree. Only if the data found directly provide useful information to the nodes in the subtree\n"
                "You are not allowed to update any other part of the tree even if it needs update"
                "These are the nodes in the subtree you are allowed to edit:\n"
                f"{subtree}\n"
                "You are not allowed to update any other part of the tree even if it needs update"

            )
        return (
            "Given facts that were found online,\n"
            f"{search_results}\n"
            "Incorporate this information within the tree structure only if it directly provides useful information to the nodes in the tree.\n"
        )

    def _get_query_prompt_template(self) -> str:
        base_prompt = (
            "The company's objective is to {objective}.\n"
            "Your task is to generate a list of data requirements to gather more information "
            "relevant to the {focus} described in the tree structure.\n\n"
            "The generated data requirements must be formed as search queries to look for this "
            "data online.\nEnsure context is specified only when required for internal or "
            "external company data.\n"
            "Required data must be in the form of a clear, actionable search query and should include:\n"
            "    a. Context for internal company data (if applicable), specifying the company name "
            "and relevant details.\n"
            "    b. Context for external company data (if applicable), specifying the external "
            "company name and relevant details.\n"
            "    c. Generic data, which does not require any company context.\n"
            "Required data must be atomic, looking for one thing at a time (keyword search).\n\n"
            "Generate from 1 to 5 queries\n"
            "Respond in JSON format based on the following schema: [\"data_requirement_1\", "
            "\"data_requirement_2\", ...]"
        )
        
        if self.tree.type == TreeType.WHY:
            return base_prompt.format(
                objective="identify the root causes of the problem",
                focus="potential causes"
            )
        return base_prompt.format(
            objective="identify solutions to reach their goal or solve a problem",
            focus="potential solutions"
        )