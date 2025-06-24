from app.models.db_models.company import Company


class SearchQuery:

    @classmethod
    def get_about_company_search_query(cls, company: Company):
        return f"{company.profile.company_name}, {company.profile.country}, {company.profile.industry}"
