from app.helpers.db_helper import DbHelper
from app.helpers.config_helper import Core
from app.models.db_models.node import Node, NodeType
from app.repositories.unit_of_work import UnitOfWork
from app.models.dtos.node.edit_node_dto import EditNodeDto
from app.helpers.connection_manager_helper import broadcast
from app.models.dtos.node.create_node_dto import CreateNodeDto
from app.services.tree_decision_service import TreeDecisionService
from app.agents.decomposition_agent.decomposition_agent import DecompositionAgent
from app.agents.tree_builder.tree_builder_agent import TreeBuilderAgent
from app.core.language_models.prompts.node.needed_models import AssistantNode
from app.models.db_models.company import Company
from app.services.file_service import FileService
from app.agents.research_agent.research_agent import ResearchOption, Researcher

class NodeService:
    def __init__(self, llm_config=None):
        self.repos = UnitOfWork()
        self.core_engine = Core(llm_config)
        self.tree_decision_service = TreeDecisionService()

    async def get(self, id: str):
        node = await self.repos.nodes.get_by_id(id)
        if not node:
            raise Exception("Node was not found")

        return node

    async def create(self, create_node_dto: CreateNodeDto):
        parent_node = await self.repos.nodes.get_by_id(create_node_dto.parent_node_id)
        if not parent_node:
            raise Exception("Parent node was not found")

        new_node = Node(
            text=create_node_dto.text,
            tree_id=parent_node.tree_id,
            parent_id=parent_node.id,
            type=NodeType.NORMAL,
            certainty=create_node_dto.certainty,
            explanation=create_node_dto.explanation,
        )

        return await self.repos.nodes.create(new_node)

    async def edit(self, edit_node_dto: EditNodeDto):
        node = await self.repos.nodes.get_by_id(edit_node_dto.node_id)
        if not node:
            raise Exception("Node was not found")

        node.text = edit_node_dto.text
        node.certainty = edit_node_dto.certainty
        node.explanation = edit_node_dto.explanation

        is_node_edited = await self.repos.nodes.update(node.id, node)
        await self.tree_decision_service.update_node_in_decision(node.id)

        return is_node_edited

    async def delete(self, id: str, only_children: bool = False):
        node = await self.repos.nodes.get_by_id(id)

        await self.tree_decision_service.remove_node_from_decision(node.id)

        is_node_deleted = await self.repos.nodes._delete_node_with_children(id, only_children)

        if not only_children:
            tree = await self.repos.trees.get_by_root_id(node.id)
            if tree:
                await self.repos.trees.delete(tree.id)

        return is_node_deleted
    
    async def decompose_using_agent(self, id: str, tree_id: str):
        tree, _, _, root, node = await DbHelper.get_objects(tree_id, id)

        await broadcast(tree.id, True, True)
        await broadcast(tree.id, node.id, True)
        await broadcast(tree.id, f"Decomposing node: {node.text}", True)

        decomposition_agent = DecompositionAgent(
            tree=tree,
            root_node=root,
            llm_config=self.core_engine.llm_config
        )

        nodes_to_add = await decomposition_agent.decompose(node_id=id)

        await broadcast(tree.id, "stop all", True)

        return nodes_to_add
    
    async def verify_node(self, id: str, options: ResearchOption, company: Company):
        node = await self.repos.nodes.get_node_with_children(id)
        tree, task, tree_analysis, root, _ = await DbHelper.get_objects(node.tree_id)
        
        await broadcast(tree.id, True, True)
        await broadcast(tree.id, node.id, True)

        tree_builder = TreeBuilderAgent(
            company=company, 
            tree_analysis=tree_analysis, 
            tree=tree, 
            task=task, 
            root_node=root, 
            llm_config=self.core_engine.llm_config
        )

        researcher = Researcher(
            company=company, 
            tree=tree, 
            task=task, 
            root_node=root, 
            llm_config=self.core_engine.llm_config
        )

        files_update_command, online_update_command = await researcher.run(options, id)

        if files_update_command:
            await tree_builder.run(files_update_command)
        
        if online_update_command:
            await tree_builder.run(online_update_command)
        
        await broadcast(tree.id, "stop all", True)

        return True
