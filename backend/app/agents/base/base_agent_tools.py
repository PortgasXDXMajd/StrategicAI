from app.models.db_models.tree import Tree
from app.repositories.unit_of_work import UnitOfWork
from app.models.db_models.tree_analysis import TreeAnalysis


class BaseAgentTools:

    def __init__(self, tree_analysis: TreeAnalysis, tree: Tree):
        self.tree = tree
        self.tree_analysis = tree_analysis

        self.repos = UnitOfWork()
