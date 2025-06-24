from app.helpers.auth_helper import get_caller
from app.models.db_models.tree import TreeType
from app.models.db_models.company import Company
from app.services.tree_service import TreeService
from app.helpers.response_helper import ResponseHelper
from app.models.dtos.tree.create_tree_dto import CreateTreeDto
from app.services.tree_analysis_service import TreeAnalysisService
from app.services.tree_decision_service import TreeDecisionService
from fastapi import APIRouter, Body, Depends, HTTPException, Query, Request


router = APIRouter(prefix="/tree")

@router.get("/")
async def get(related_node_id:str = Query(None), type:TreeType = Query(None), _: Company = Depends(get_caller)):
    try:
        tree_service = TreeService()

        res =  await tree_service.get_all(related_node_id, type)

        return ResponseHelper.success(res)
    
    except HTTPException as e:
        return ResponseHelper.error(status=e.status_code, msg=str(e.detail))
    except Exception as e:
        return ResponseHelper.error(msg=str(e))
    
@router.get("/{id}")
async def get(id:str, _: Company = Depends(get_caller)):
    try:
        tree_service = TreeService()

        res =  await tree_service.get_by_id(id)

        return ResponseHelper.success(res)
    
    except HTTPException as e:
        return ResponseHelper.error(status=e.status_code, msg=str(e.detail))
    except Exception as e:
        return ResponseHelper.error(msg=str(e))

@router.get("/{id}/structure")
async def get_root_node(id: str, _: Company = Depends(get_caller)):
    try:
        tree_service = TreeService()

        res = await tree_service.get_root_node(id)

        return ResponseHelper.success(res)
    
    except HTTPException as e:
        return ResponseHelper.error(status=e.status_code, msg=str(e.detail))
    except Exception as e:
        return ResponseHelper.error(msg=str(e))

@router.get("/{id}/tree-analysis")
async def get(id:str, _: Company = Depends(get_caller)):
    try:
        tree_analysis_service = TreeAnalysisService()

        res = await tree_analysis_service.get_by_tree_id(id)

        return ResponseHelper.success(res)
    
    except HTTPException as e:
        return ResponseHelper.error(status=e.status_code, msg=str(e.detail))
    except Exception as e:
        return ResponseHelper.error(msg=str(e))

@router.get("/{id}/potential-candidates")
async def get_potential_candidates(id:str, company: Company = Depends(get_caller), request : Request = None):
    try:
        tree_analysis_service = TreeAnalysisService(request.state.llm_config)

        res = await tree_analysis_service.get_potential_candidates(id, company)

        return ResponseHelper.success(res)
    
    except HTTPException as e:
        return ResponseHelper.error(status=e.status_code, msg=str(e.detail))
    except Exception as e:
        return ResponseHelper.error(msg=str(e))
    
@router.get("/{id}/tree-decision")
async def get_by_tree_id(id:str, _: Company = Depends(get_caller)):
    try:
        tree_decision_service = TreeDecisionService()

        res = await tree_decision_service.get_by_tree_id(id)

        return ResponseHelper.success(res)
    
    except HTTPException as e:
        return ResponseHelper.error(status=e.status_code, msg=str(e.detail))
    except Exception as e:
        return ResponseHelper.error(msg=str(e))
    
@router.post("/")
async def create_tree(create_tree_dto: CreateTreeDto = Body(...),caller: Company = Depends(get_caller), request : Request = None):
    try:
        tree_service = TreeService(request.state.llm_config)

        res = await tree_service.create_tree(create_tree_dto, caller)
        
        return ResponseHelper.success(res)
    except HTTPException as e:
        return ResponseHelper.error(status=e.status_code, msg=str(e.detail))
    except Exception as e:
        return ResponseHelper.error(msg=str(e))
    
@router.delete("/{id}")
async def delete(id:str, _: Company = Depends(get_caller)):
    try:
        tree_service = TreeService()

        res = await tree_service.delete_by_id(id)

        return ResponseHelper.success(res)
    
    except HTTPException as e:
        return ResponseHelper.error(status=e.status_code, msg=str(e.detail))
    except Exception as e:
        return ResponseHelper.error(msg=str(e))