from enum import Enum
from pydantic import BaseModel
from typing import List, Optional

class AnswerTechnique(str, Enum):
    UI = "user input"
    CB = "closed book"
    OB = "open book"
    CA = "children aggregation"
    UF = "user files"

class NodeAnswer(BaseModel):
    answer_technique: AnswerTechnique
    question:Optional[str] = None
    answer:str
    certainty:float

class NodeResult(BaseModel):
    node_id:str
    answers:List[NodeAnswer]
    is_leaf:bool