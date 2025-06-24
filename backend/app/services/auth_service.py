from fastapi import Depends
from datetime import timedelta
from app.models.dtos.auth.auth_dto import AuthDto
from app.repositories.unit_of_work import UnitOfWork
from app.helpers.auth_helper import create_access_token
from app.models.db_models.company import Company, CompanyDto
from app.helpers.password_helper import get_password_hash, verify_password


class AuthService:
    def __init__(self):
        self.repos = UnitOfWork()

    async def login(self, login_dto: AuthDto = Depends()):
        company = await self.repos.companies.get_by_email(login_dto.email.lower())
        if not company:
            raise Exception("Incorrect email or password")

        if not verify_password(login_dto.password, company.password):
            raise Exception("Incorrect email or password")

        access_token = create_access_token(
            data={"sub": company.id, "email": company.login_email, "first_login": company.first_login},
            expires_delta=timedelta(minutes=float(1440)),
        )

        return {"access_token": access_token, "company": CompanyDto(company)}

    async def register(self, registration_dto: AuthDto = Depends()):
        check_company = await self.repos.companies.get_by_email(registration_dto.email.lower())
        if check_company:
            raise Exception("email is taken")

        new_comapny = Company(
            login_email=registration_dto.email.lower(),
            password=get_password_hash(registration_dto.password),
        )

        created = await self.repos.companies.create(new_comapny)

        if created:
            return "Company created successfully"
        else:
            raise Exception("Company creation failed")
