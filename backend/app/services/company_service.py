from typing import List
from fastapi import Depends, UploadFile
from app.helpers.config_helper import Core
from app.services.file_service import FileService
from app.models.db_models.company import CompanyDto
from app.core.web_search.queries import SearchQuery
from app.repositories.unit_of_work import UnitOfWork
from app.models.dtos.company.question_answer_dto import QADto
from app.models.dynamic_models.company_profile import CompanyProfile
from app.models.dtos.company.company_profile_dto import UpdateCompanyProfileDto
from app.core.language_models.prompts.company.extractor_prompts import ExtractorPrompts


class CompanyService:
    def __init__(self, llm_config = None):
        self.repos = UnitOfWork()
        self.core_engine = Core(llm_config)
        pass

    async def get(self, id: str) -> CompanyDto:
        company = await self.repos.companies.get_by_id(id)
        if not company:
            raise Exception("Company was not found")

        return CompanyDto(company)

    async def update_profile(
        self,
        id: str, 
        update_company_profile_dto: UpdateCompanyProfileDto = None) -> CompanyDto:

        company = await self.repos.companies.get_by_id(id)
        if not company:
            raise Exception("Company was not found")

        if update_company_profile_dto is not None:
            company.profile = CompanyProfile.from_dto(update_company_profile_dto)

        # 1. search online about the company
        search_res = self.core_engine.search_engine.search(SearchQuery.get_about_company_search_query(company), topk=3)
        urls = [res[0] for res in search_res.results]

        # 2. scrap the top 3 search results
        scrap_res = self.core_engine.scraper.scrape(urls)

        # 3. use LLM to update/create a company profile from scraped data
        sys_prmt = ExtractorPrompts.get_system_prompt()
        usr_prmt = ExtractorPrompts.get_prompt_to_extract_company_information(company, search_res, scrap_res)

        company.profile, _  = await self.core_engine.model.generate(sys_prmt, usr_prmt, CompanyProfile)
        company.first_login = False
        
        await self.repos.companies.update(id, company)

        return CompanyDto(company)
        
    async def enrich_profile(
        self,
        id: str = Depends(),
        text: str = None,
        files: List[UploadFile] = None) -> CompanyDto:

        company = await self.repos.companies.get_by_id(id)
        if not company:
            raise Exception("Company was not found")
        
        user_input = dict()
        
        if text:
            user_input = {'text':text}

        if files and len(files) > 0:
            file_service = FileService(company, self.llm_config)

            files_facts = await file_service.get_facts(files)
            
            user_input = {'text':text, 'files':files_facts}

        sys_prmt = ExtractorPrompts.get_system_prompt()
        usr_prmt = ExtractorPrompts.get_prompt_to_update_company_profile(company, user_input)

        company.profile, _  = await self.core_engine.model.generate(sys_prmt, usr_prmt, CompanyProfile)
        
        await self.repos.companies.update(id, company)

        return CompanyDto(company)

    async def update_company_profile_with_answers(
        self,
        id: str,
        qa_dto: QADto = None,
        continuation_token: str = None) -> CompanyDto:

        company = await self.repos.companies.get_by_id(id)
        if not company:
            raise Exception("Company was not found")
        
        company.profile, continuation_token  = await self.core_engine.model.continue_convo(qa_dto.qa, CompanyProfile, continuation_token)

        company.first_login = False
        
        await self.repos.companies.update(id, company)

        return CompanyDto(company)

