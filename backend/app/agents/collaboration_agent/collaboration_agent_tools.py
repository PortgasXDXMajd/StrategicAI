from app.helpers.decoraters import tool
from app.helpers.config_helper import Core
from app.models.db_models.task import Task
from app.models.db_models.tree import Tree
from app.helpers.llm_helper import LLMHelper
from app.models.db_models.company import Company
from app.services.file_service import FileService
from app.models.db_models.node import Node, NodeType
from app.repositories.unit_of_work import UnitOfWork
from app.helpers.connection_manager_helper import broadcast
from app.models.db_models.tree_analysis import TreeAnalysis
from app.services.tree_decision_service import TreeDecisionService
from app.core.language_models.return_types.agents.params import MethodName
from app.core.language_models.return_types.file.file_facts_rt import FactsRT


class CollaborationAgentTools:

    def __init__(self, tree_analysis: TreeAnalysis, tree: Tree, task: Task, company: Company, llm_config=None):
        self.repos = UnitOfWork()
        self.core_engine = Core(llm_config)
        self.tree_analysis = tree_analysis
        self.tree = tree
        self.task = task

        self.file_service = FileService(company=company, llm_config=llm_config)
        self.tree_decision_service = TreeDecisionService()

    async def execute(self, method, certainity: float) -> bool:
        assert method, "method must not be None"
        self.action_certainity = certainity

        action_methods = {
            MethodName.ADD_NODE: self.add_node,
            MethodName.EDIT_NODE: self.edit_node,
            MethodName.DEL_NODE: self.delete_node,
            MethodName.SEARCH_ONLINE: self.search_online
        }

        return await action_methods[method['method_name']](**method['params'])

    async def get_next_method(self, updates: str):
        assert updates, "updates must not be None"
        await broadcast(self.tree.id, True, True)
        await broadcast(self.tree_analysis.id, "Checking next action...", True)

        root_node = await self.repos.nodes.get_node_with_children(self.tree.root_node_id)
        await broadcast(self.tree.id, root_node)

        await broadcast(self.tree.id, root_node.id, True)

        await self.repos.tree_analyses.update(self.tree_analysis.id, self.tree_analysis)

        return await LLMHelper.safe_generate_response(
            core_engine=self.core_engine,
            sys_prmt=None,
            usr_prmt=updates,
            is_history_required=True,
            continuation_token=self.tree_analysis.id
        )

    @tool
    async def add_node(self, parent_node_id: str, text: str, explanation: str):
        assert parent_node_id, "parent_node_id must not be None"
        assert text, "text must not be None"
        assert explanation, "explanation must not be None"

        await broadcast(self.tree.id, parent_node_id, True)
        await broadcast(self.tree.id, f"Adding node: {text}", True)
        await broadcast(self.tree_analysis.id, f"Adding node: {text}", True)

        new_node = Node(
            text=text,
            tree_id=self.tree.id,
            parent_id=parent_node_id,
            type=NodeType.NORMAL,
            certainty=self.action_certainity,
            explanation=explanation
        )

        await self.repos.nodes.create(new_node)

        return await self.get_next_method(updates=f"New Node Addition Completed: {new_node.get_node_info()}")

    @tool
    async def edit_node(self, node_id: str, text: str, explanation: str):
        assert node_id, "node_id must not be None"
        assert text, "text must not be None"
        assert explanation, "explanation must not be None"

        await broadcast(self.tree.id, node_id, True)
        await broadcast(self.tree.id, f"Editing node: {text}", True)
        await broadcast(self.tree_analysis.id, f"Editing node: {text}", True)

        node = await self.repos.nodes.get_by_id(node_id)
        node.certainty = self.action_certainity if node.explanation != explanation else node.certainty
        node.text = text
        node.explanation = explanation

        await self.repos.nodes.update(node_id, node)

        await self.tree_decision_service.update_node_in_decision(node_id)

        return await self.get_next_method(updates=f"Node Moditidication Completed:\n{node.get_node_info()}")

    @tool
    async def delete_node(self, node_id: str):
        assert node_id, "node_id must not be None"

        await broadcast(self.tree.id, node_id, True)
        await broadcast(self.tree.id, f"Deleting a node...", True)
        await broadcast(self.tree_analysis.id, f"Deleting a node...", True)

        await self.tree_decision_service.remove_node_from_decision(node_id)

        await self.repos.nodes.delete(node_id)

        return await self.get_next_method(updates=f"Node Deletion Completed")

    @tool
    async def search_online(self, query: str):
        assert query, "query must not be None"

        await broadcast(self.tree.id, True, True)
        await broadcast(self.tree.id, self.tree.root_node_id, True)
        await broadcast(self.tree.id, f"Online searching: {query}", True)
        await broadcast(self.tree_analysis.id, f"Online searching: {query}", True)

        try:
            search_results = {}

            await broadcast(self.tree.id, f"Searching: {query}", True)

            search_res = self.core_engine.search_engine.search(query, topk=3)
            
            urls = [res[0] for res in search_res.results]
            
            scraped_data = self.core_engine.scraper.scrape(urls)

            await broadcast(self.tree.id, f"Extracting facts for: {query}", True)

            extracted_data = await self.file_service.extract_facts(scraped_data)

            if isinstance(extracted_data, FactsRT):
                search_results[query] = extracted_data.facts

            updates = (
                f"Search Query: {query}\n"
                f"{search_results}\n"
            )

        except Exception:
            updates = (
                f"Search failed"
            )

        return await self.get_next_method(updates=updates)