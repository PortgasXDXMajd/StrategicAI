from typing import List
from app.helpers.auth_helper import get_caller
from app.models.db_models.company import Company
from app.services.file_service import FileService
from app.helpers.response_helper import ResponseHelper
from fastapi import APIRouter, Depends, File, Form, HTTPException, Request, UploadFile

router = APIRouter(prefix="/file")

@router.get("/{id}")
async def get(id:str, company: Company = Depends(get_caller), request : Request = None):
    try:
        file_service = FileService(company, request.state.llm_config)

        res = await file_service.get(id)

        return ResponseHelper.success(res)
    
    except HTTPException as e:
        return ResponseHelper.error(status=e.status_code, msg=str(e.detail))
    except Exception as e:
        return ResponseHelper.error(msg=str(e))

@router.post("/")
async def create(
    task_id: str = Form(...),
    files: List[UploadFile] = File(None),
    company: Company = Depends(get_caller),
    request : Request = None):
    try:
        file_service = FileService(company, request.state.llm_config)

        res = await file_service.create(task_id, files)

        return ResponseHelper.success(res)
    
    except HTTPException as e:
        return ResponseHelper.error(e.status_code, msg=str(e.detail))
    except Exception as e:
        return ResponseHelper.error(msg=str(e))

@router.delete("/{id}")
async def delete(id:str, company: Company = Depends(get_caller), request : Request = None):
    try:
        file_service = FileService(company, request.state.llm_config)

        res = await file_service.delete(id)

        return ResponseHelper.success(res)
    
    except HTTPException as e:
        return ResponseHelper.error(status=e.status_code, msg=str(e.detail))
    except Exception as e:
        return ResponseHelper.error(msg=str(e))