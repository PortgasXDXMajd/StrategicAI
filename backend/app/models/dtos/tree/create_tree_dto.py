from typing import Optional
from app.models.db_models.tree import TreeType
from app.models.dtos.configs.llm_type_enum import DtoConfigs

class CreateTreeDto(DtoConfigs):
    task_id: str
    type: TreeType
    node_id: Optional[str] = None