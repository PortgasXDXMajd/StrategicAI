from enum import Enum
from typing import List, Optional
from app.models.db_models.tree import Tree
from app.models.db_models.file import File
from app.models.db_models.base_entity import BaseEntity
from app.models.db_models.tree_decision import TreeDecision


class TaskType(str, Enum):
    PROBLEM = "problem",
    GOAL = "goal",
    HYPOTHESIS = "hypothesis"


class Task(BaseEntity):
    title: str
    user_description: str
    type: TaskType
    company_id: str
    include_company_context: bool = False
    trees: Optional[List[Tree]] = []
    files: Optional[List[File]] = []
    root_cause_analysis: Optional[TreeDecision] = None
    how_trees_decisions: Optional[List[TreeDecision]] = None
    hypotheses_tested: Optional[List[TreeDecision]] = None
