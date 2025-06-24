from typing import Tuple
from app.models.db_models.node import Node
from app.models.db_models.task import Task
from app.models.db_models.tree import Tree
from app.repositories.unit_of_work import UnitOfWork
from app.models.db_models.tree_analysis import TreeAnalysis


class DbHelper:

    @staticmethod
    async def get_objects(tree_id: str, node_id: str = None) -> Tuple[Tree, Task, TreeAnalysis, Node, Node]:
        repos = UnitOfWork()

        tree = await repos.trees.get_by_id(tree_id)
        if not tree:
            raise Exception("Tree was not found")

        task = await repos.tasks.get_by_id(tree.task_id)
        if not task:
            raise Exception("Task was not found")

        tree_analysis = await repos.tree_analyses.get_by_tree_id(tree_id)

        root_node = await repos.nodes.get_node_with_children(tree.root_node_id)

        node = None
        if node_id != None:
            node = await repos.nodes.get_node_with_children(node_id)
            if not node:
                raise Exception("Node was not found")

        return tree, task, tree_analysis, root_node, node

    @staticmethod
    async def get_analysis_objects(tree_analysis_id: str) -> Tuple[TreeAnalysis, Tree, Task, Node]:
        repos = UnitOfWork()

        tree_analysis = await repos.tree_analyses.get_by_id(tree_analysis_id)
        if not tree_analysis:
            raise Exception("Tree Analysis was not found")

        tree = await repos.trees.get_by_id(tree_analysis.tree_id)
        if not tree:
            raise Exception("Treeeee was not found")

        task = await repos.tasks.get_by_id(tree.task_id)
        if not task:
            raise Exception("Task was not found")

        root_node = await repos.nodes.get_node_with_children(tree.root_node_id)

        return tree_analysis, tree, task, root_node
