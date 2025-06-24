from app.helpers.auth_helper import get_caller
from app.models.db_models.company import Company
from app.services.task_service import TaskService
from fastapi import APIRouter, Body, Depends, Request
from app.helpers.response_helper import ResponseHelper
from app.models.dtos.task.create_task_dto import CreateTaskDto
from app.models.dtos.task.get_task_remmendation_dto import GetTaskRecommendationDto


router = APIRouter(prefix="/task")

@router.get("/{id}")
async def get(id:str, _: Company = Depends(get_caller)):
    try:
        task_service = TaskService()

        res = await task_service.get(id)
    
        return ResponseHelper.success(res)
    except Exception as e:
        return ResponseHelper.error(msg=str(e))
    
@router.get("/")
async def get_all(caller: Company = Depends(get_caller)):
    try:
        task_service = TaskService()

        res = await task_service.get_by_company_id(caller.id)

        return ResponseHelper.success(res)
    except Exception as e:
        return ResponseHelper.error(msg=str(e))

@router.post("/")
async def create(create_task_dto: CreateTaskDto = Body(...),caller: Company = Depends(get_caller),request : Request = None):
    
    try:
        task_service = TaskService(request.state.llm_config)

        res = await task_service.create(create_task_dto, caller)
        
        return ResponseHelper.success(res)
    except Exception as e:
        return ResponseHelper.error(msg=str(e))

@router.delete("/{id}")
async def delete(id:str, _: Company = Depends(get_caller)):
    
    try:
        task_service = TaskService()

        res = await task_service.delete(id)
    
        return ResponseHelper.success(res)
    except Exception as e:
        return ResponseHelper.error(msg=str(e))
    
@router.post("/recommendation")
async def get_recommendations(
    get_task_recommendation_dto: GetTaskRecommendationDto = Body(...),
    caller: Company = Depends(get_caller), 
    request : Request = None):

    try:
        task_service = TaskService(request.state.llm_config)
        
        res = await task_service.get_recommendations(get_task_recommendation_dto, caller)
    
        return ResponseHelper.success(res)
    except Exception as e:
        return ResponseHelper.error(msg=str(e))
