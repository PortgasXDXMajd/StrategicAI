from typing import Dict
from pydantic import Field
from app.models.dtos.configs.llm_type_enum import DtoConfigs

class QADto(DtoConfigs):
    qa: Dict[str,str] = Field(...)