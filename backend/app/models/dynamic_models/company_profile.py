from pydantic import Field
from typing import Any, Dict, Optional
from app.core.language_models.return_types.llm_response import WithQuestionsRT
from app.models.dtos.company.company_profile_dto import UpdateCompanyProfileDto


class CompanyProfile(WithQuestionsRT):
    company_name: str = Field(
        description="The official name of the company, which will be used for identification purposes.",
    )

    country: str = Field(
        description="The country where the company is legally registered and primarily operates.",
    )

    industry: str = Field(
        description="The industry sector in which the company operates",
    )
    
    description: Optional[str] = Field(
        default=None,
        description="text based long description about the company in general that is suitable for end users to read summarizing all the information known about the company",
    )

    dynamic_fields: Optional[Dict[str, Any]] = Field(
        default=None,
        description="A JSON object containing additional, dynamic data about the company, such as revenue, headquarters, or any other relevant business metrics or even complex objects like SWOT analysis.",
    )

    @classmethod
    def from_dto(cls, dto: UpdateCompanyProfileDto):
        return cls(company_name=dto.company_name, country=dto.country, industry=dto.industry)

    def get_company_context(self) -> str:
        context = f"Company Name: {self.company_name} -- Industry: {self.industry}\n"
        context += f"Company Brief: {self.description}\n" if self.description else ''

        if self.dynamic_fields:
            for field, value in self.dynamic_fields.items():
                if value is not None:
                    context += f"{self.format_label(field)}: {value}\n"

        return context

    def format_label(self, field: str) -> str:
        result = ''.join([' ' + i.lower() if i.isupper() else i for i in field]).strip()
        return result.capitalize()