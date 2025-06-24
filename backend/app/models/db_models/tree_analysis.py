from pydantic import BaseModel
from typing import Any, Dict, List, Optional, Union
from app.models.db_models.base_entity import BaseEntity
from app.models.db_models.node_result import NodeResult
from app.models.db_models.enums import AnalysisActors, UserChatInputType
from app.core.language_models.return_types.agents.agent_rt import AgentRT
from app.core.language_models.return_types.analysis.tree_analysis_rt import TreeActionResponseRT


class UserChatInput(BaseModel):
    text: Optional[str] = None
    file: Optional[List[str]] = None
    type: UserChatInputType = UserChatInputType.TEXT


class TreeAnalysisHistory(BaseModel):
    actor: AnalysisActors
    payload: Union[UserChatInput, TreeActionResponseRT, AgentRT, Any]


class TreeAnalysis(BaseEntity):
    tree_id: str
    history: List[TreeAnalysisHistory | NodeResult] = []
    log: Optional[List[str]] = []
