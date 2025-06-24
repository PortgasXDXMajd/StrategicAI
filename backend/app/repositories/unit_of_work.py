from app.repositories.file_repo import FileRepository
from app.repositories.node_repo import NodeRepository
from app.repositories.task_repo import TaskRepository
from app.repositories.tree_repo import TreeRepository
from app.repositories.company_repo import CompanyRepository
from app.repositories.tree_analysis_repo import TreeAnalysisRepository
from app.repositories.tree_decision_repo import TreeDecisionRepository

class UnitOfWork:
    def __init__(self):
        self.companies = CompanyRepository()
        self.tasks = TaskRepository()
        self.trees = TreeRepository()
        self.tree_analyses = TreeAnalysisRepository()
        self.nodes = NodeRepository()
        self.files = FileRepository()
        self.tree_decisions = TreeDecisionRepository()