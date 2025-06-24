from typing import Optional, Union
from app.models.db_models.base_entity import BaseEntity
from app.models.db_models.node_result import NodeAnswer
from app.core.language_models.return_types.analysis.tree_analysis_rt import Decision

class TreeDecision(BaseEntity):
    tree_id: str
    payload: Optional[Union[Decision, NodeAnswer]]