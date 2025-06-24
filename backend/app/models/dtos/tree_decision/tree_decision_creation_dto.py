from typing import Union
from app.models.db_models.node_result import NodeAnswer
from app.models.dtos.configs.llm_type_enum import DtoConfigs
from app.core.language_models.return_types.analysis.tree_analysis_rt import Decision

class TreeDecisionCreationDto(DtoConfigs):
    tree_id: str
    payload: Union[Decision, NodeAnswer]

class ToggleNodeAsDecisionDto(DtoConfigs):
    node_id: str