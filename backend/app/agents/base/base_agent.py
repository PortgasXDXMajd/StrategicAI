from typing import List
from fastapi import UploadFile
from app.models.db_models.task import Task
from app.models.db_models.node import Node
from app.helpers.config_helper import Core
from app.models.db_models.tree import Tree
from app.models.db_models.company import Company
from app.services.file_service import FileService
from app.repositories.unit_of_work import UnitOfWork
from app.helpers.connection_manager_helper import broadcast
from app.models.db_models.enums import AnalysisActors, UserChatInputType
from app.models.db_models.tree_analysis import TreeAnalysis, TreeAnalysisHistory, UserChatInput


class BaseAgent:

    def __init__(self, company: Company, task: Task, tree_analysis: TreeAnalysis, tree: Tree, root_node: Node, llm_config=None):
        self.tree = tree
        self.task = task
        self.company = company
        self.tree_analysis = tree_analysis
        self.root_node = root_node

        self.repos = UnitOfWork()
        self.core_engine = Core(llm_config)
        self.doc_agent = FileService(company, llm_config)

    async def process_uploaded_files(self, files: List[UploadFile]):
        if files:
            await broadcast(self.tree_analysis.id, "Processing uploaded files", True)
            await broadcast(self.tree.id, "Processing uploaded files", True)

            files_facts = await self.doc_agent.get_facts(files, tree_id=self.tree.id, task_id=self.task.id)
            for file in files:
                self.tree_analysis.history.append(
                    TreeAnalysisHistory(
                        actor=AnalysisActors.USER,
                        payload=UserChatInput(
                            text=file.filename, file=files_facts[file.filename], type=UserChatInputType.FILE)
                    )
                )

        return self.tree_analysis, files_facts
