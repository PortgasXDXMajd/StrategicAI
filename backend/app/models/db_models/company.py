from typing import Optional
from pydantic import EmailStr, Field
from app.models.db_models.base_entity import BaseEntity
from app.models.dynamic_models.company_profile import CompanyProfile

class Company(BaseEntity):
    login_email: EmailStr = Field()
    password: str = Field()
    first_login: bool = False
    profile: Optional[CompanyProfile] = Field(default=None)

class CompanyDto:
    def __init__(self, company: Company):
        self.id = company.id
        self.login_email = company.login_email
        self.first_login = company.first_login
        self.profile = company.profile
    
