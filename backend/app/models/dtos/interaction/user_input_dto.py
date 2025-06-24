from typing import Optional
from app.models.dtos.configs.llm_type_enum import DtoConfigs

class UserTextInputDto(DtoConfigs):
    tree_id: str
    node_id: str
    text: Optional[str] = ''