from typing import Optional
from app.models.dtos.configs.llm_type_enum import DtoConfigs

class UpdateCompanyProfileDto(DtoConfigs):
    company_name: Optional[str] = None
    country: Optional[str] = None
    industry: Optional[str] = None

class EnrichCompanyProfileDto(DtoConfigs):
    text: str
