from typing import List
from app.helpers.auth_helper import get_caller
from app.models.db_models.company import Company
from app.helpers.response_helper import ResponseHelper
from app.services.company_service import CompanyService
from app.models.dtos.company.question_answer_dto import QADto
from app.models.dtos.company.company_profile_dto import UpdateCompanyProfileDto
from fastapi import APIRouter, Body, Depends, File, Form, Query, Request, UploadFile


router = APIRouter(prefix="/company")

@router.get("/")
async def get(caller: Company = Depends(get_caller)):
    try:
        
        company_service = CompanyService()
        
        res = await company_service.get(caller.id)

        return ResponseHelper.success(res)
    except Exception as e:
        return ResponseHelper.error(msg=str(e))

@router.put("/")
async def update_company_profile(
    company_profile: UpdateCompanyProfileDto = Body(...),
    caller: Company = Depends(get_caller),
    request : Request = None):
    try:
        company_service = CompanyService(request.state.llm_config)
        
        res = await company_service.update_profile(caller.id, company_profile)
        
        return ResponseHelper.success(res)
    except Exception as e:
        return ResponseHelper.error(msg=str(e))
    
@router.put("/enrich")
async def enrich_company_profile(
    text: str = Form(None),
    files: List[UploadFile] = File(None),
    caller: Company = Depends(get_caller),
    request : Request = None):
    try:
        company_service = CompanyService(request.state.llm_config)
        
        res = await company_service.enrich_profile(caller.id, text, files)
        
        return ResponseHelper.success(res)
    except Exception as e:
        return ResponseHelper.error(msg=str(e))
    
@router.put("/question-answer")
async def update_company_profile(
    qa_dto: QADto = Body(...),
    caller: Company = Depends(get_caller),
    continuation_token: str = Query(None),
    request : Request = None):
    try:
        company_service = CompanyService(request.state.llm_config)

        res = await company_service.update_company_profile_with_answers(caller.id, qa_dto, continuation_token)
    
        return ResponseHelper.success(res)
    except Exception as e:
        return ResponseHelper.error(msg=str(e))
    
@router.delete("/profile")
async def delete_company_profile(
    caller: Company = Depends(get_caller),
    request : Request = None):
    try:
        company_service = CompanyService(request.state.llm_config)
        
        res = await company_service.delete_conpany_profile(caller.id)
        
        return ResponseHelper.success(res)
    except Exception as e:
        return ResponseHelper.error(msg=str(e))