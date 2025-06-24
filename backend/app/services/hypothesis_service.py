from typing import List
from fastapi import UploadFile
from .file_service import FileService
from ..helpers.db_helper import DbHelper
from ..helpers.config_helper import Core
from .answer_service import AnswerService
from ..models.db_models.tree import TreeType
from ..models.db_models.company import Company
from ..repositories.unit_of_work import UnitOfWork
from ..models.db_models.node_result import NodeResult
from .tree_decision_service import TreeDecisionService
from ..helpers.hypothesis_helper import HypothesisHelper
from ..helpers.connection_manager_helper import broadcast
from ..models.db_models.tree_analysis import TreeAnalysis


class HypothesisService:

    def __init__(self, hypo_tree_id: str, company: Company, llm_config=None):
        self.repos = UnitOfWork()
        self.core_engine = Core(llm_config)
        self.tree_id = hypo_tree_id
        self.company = company

        self.tree = None
        self.task = None
        self.tree_analysis = None
        self.root_node = None

        self.file_service = FileService(company, llm_config)

    async def start_hypothesis_test(self, files: List[UploadFile] = [], node_id: str = None, noti_id: str = None):
        self.noti_id = noti_id or self.tree_id

        await broadcast(self.noti_id, True, True)
        await broadcast(self.noti_id, "Starting the hypothesis testing...", True)

        self.tree, self.task, self.tree_analysis, self.root_node, _ = await DbHelper.get_objects(self.tree_id)

        if not self.tree_analysis:
            self.tree_analysis = TreeAnalysis(tree_id=self.tree.id, history=[])

        best_answer = await self.run_hypothesis_test(files, node_id)

        await broadcast(self.noti_id, "stop all", True)

        return best_answer

    async def run_hypothesis_test(self, files: List[UploadFile] = [], node_id: str = None):
        assert self.tree.type == TreeType.HYPOTHESIS
        await broadcast(self.noti_id, "Getting Required Data", True)
        node_results: List[NodeResult] = []

        if files:
            await broadcast(self.noti_id, "Processing Uploaded Files", True)
            await self.file_service.get_facts(files, tree_id=self.tree.id, task_id=self.task.id)
            await broadcast(self.noti_id, "refresh", True)

        test_node = await self.repos.nodes.get_node_with_children(node_id) if node_id else self.root_node

        answer_service = AnswerService(self.company, self.tree, self.task, self.core_engine.llm_config)

        await answer_service.process_node_answers(test_node, node_results, noti_id=self.noti_id)
        await broadcast(self.noti_id, "Completing Analysis", True)

        hypothesis_result = next((res for res in node_results if res.node_id == self.root_node.id), None)

        best_answer = None
        if hypothesis_result:
            best_answer = answer_service.select_best_answer(hypothesis_result.answers)
            
            if test_node.id == self.root_node.id:
                await TreeDecisionService().upsert(self.tree.id, best_answer)

        self.tree_analysis.history = HypothesisHelper.update_history(
            self.tree_analysis.history, node_results)

        await self.repos.tree_analyses.update(self.tree_analysis.id, self.tree_analysis, upsert=True)

        return best_answer
