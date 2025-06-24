from app.helpers.decoraters import tool
from app.models.db_models.tree import Tree
from app.models.db_models.node import Node, NodeType
from app.agents.base.base_agent_tools import BaseAgentTools
from app.models.db_models.tree_analysis import TreeAnalysis
from app.helpers.connection_manager_helper import broadcast
from app.services.tree_decision_service import TreeDecisionService
from app.core.language_models.return_types.agents.params import MethodName


class TreeBuilderAgentTools(BaseAgentTools):

    def __init__(self, tree_analysis: TreeAnalysis, tree: Tree):
        super().__init__(tree=tree, tree_analysis=tree_analysis)

        self.tree_decision_service = TreeDecisionService()

    async def execute(self, method, certainity: float) -> bool:
        assert method, "method must not be None"

        self.action_certainity = certainity

        action_methods = {
            MethodName.ADD_NODE: self.add_node,
            MethodName.EDIT_NODE: self.edit_node,
            MethodName.DEL_NODE: self.delete_node,
        }
        
        return await action_methods[method['method_name']](**method['params'])

    def get_tools(self):
        return [self.edit_node, self.add_node, self.delete_node, self.stop_execution]

    @tool
    def stop_execution(self):
        pass

    @tool
    async def add_node(self, parent_node_id: str, text: str, explanation: str):
        assert parent_node_id, "parent_node_id must not be None"
        assert text, "text must not be None"
        assert explanation, "explanation must not be None"

        await broadcast(self.tree.id, parent_node_id, True)
        await broadcast(self.tree.id, f"Adding node: {text}", True)

        new_node = Node(
            text=text,
            tree_id=self.tree.id,
            parent_id=parent_node_id,
            type=NodeType.NORMAL,
            certainty=self.action_certainity,
            explanation=explanation
        )

        await self.repos.nodes.create(new_node)

        update_log = f"New Node Added: {new_node.get_node_info()}"
        new_tree_structure = await self.repos.nodes.get_node_with_children(self.tree.root_node_id)

        return new_tree_structure, update_log

    @tool
    async def edit_node(self, node_id: str, text: str, explanation: str):
        assert node_id, "node_id must not be None"
        assert text, "text must not be None"
        assert explanation, "explanation must not be None"
        await broadcast(self.tree.id, node_id, True)
        await broadcast(self.tree.id, f"Editing node: {text}", True)

        node = await self.repos.nodes.get_by_id(node_id)
        node.text = text
        node.certainty = self.action_certainity
        node.explanation = explanation

        await self.repos.nodes.update(node_id, node)

        await self.tree_decision_service.update_node_in_decision(node_id)

        update_log = f"Node Modified: {node.get_node_info()}"
        new_tree_structure = await self.repos.nodes.get_node_with_children(self.tree.root_node_id)

        return new_tree_structure, update_log

    @tool
    async def delete_node(self, node_id: str):
        assert node_id, "node_id must not be None"

        await broadcast(self.tree.id, node_id, True)
        await broadcast(self.tree.id, f"Deleting a node...", True)

        node = await self.repos.nodes.get_by_id(node_id)

        await self.tree_decision_service.remove_node_from_decision(node_id)

        await self.repos.nodes.delete(node_id)

        update_log = f"Node Deleted: {node.get_node_info()}"

        new_tree_structure = await self.repos.nodes.get_node_with_children(self.tree.root_node_id)

        return new_tree_structure, update_log
