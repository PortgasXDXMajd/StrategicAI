import datetime
from app.models.db_models.company import Company
from app.repositories.database import Mongo

class CompanyRepository:

    def __init__(self):
        db = Mongo.get_db()
        self.company_collection = db["Companies"]

    async def get_by_id(self, company_id: str) -> Company:
        company = await self.company_collection.find_one({"_id": company_id})

        if company is None:
            return None

        return Company.model_validate(company)

    async def get_by_email(self, email: str) -> Company:
        company = await self.company_collection.find_one({"login_email": email})

        if company is None:
            return None

        return Company.model_validate(company)

    async def create(self, company: Company) -> bool:
        try:
            company.created_at = datetime.datetime.now(datetime.timezone.utc)
            company.modified_at = datetime.datetime.now(datetime.timezone.utc)

            company_dict = company.model_dump(by_alias=True)

            await self.company_collection.insert_one(company_dict)

            return True

        except Exception:
            return False

    async def update(self, company_id: str, updated_company: Company) -> bool:
        try:
            updated_company.modified_at = datetime.datetime.now(datetime.timezone.utc)

            updated_company_dict = updated_company.model_dump(by_alias=True)

            result = await self.company_collection.replace_one({"_id": company_id}, updated_company_dict)

            return result.modified_count == 1

        except Exception:
            return False

    async def delete(self, company_id: str) -> bool:
        try:
            result = await self.company_collection.delete_one({"_id": company_id})
            return result.deleted_count == 1
        except Exception:
            return False
