from app.helpers.auth_helper import get_caller
from app.models.db_models.company import Company
from fastapi import APIRouter, Depends, HTTPException
from app.helpers.response_helper import ResponseHelper
from app.services.tree_decision_service import TreeDecisionService
from app.models.dtos.tree_decision.tree_decision_creation_dto import ToggleNodeAsDecisionDto, TreeDecisionCreationDto

router = APIRouter(prefix="/tree-decision")

@router.get("/{id}")
async def get(id:str, _: Company = Depends(get_caller)):
    try:
        tree_decision_service = TreeDecisionService()

        res = await tree_decision_service.get(id)

        return ResponseHelper.success(res)
    
    except HTTPException as e:
        return ResponseHelper.error(status=e.status_code, msg=str(e.detail))
    except Exception as e:
        return ResponseHelper.error(msg=str(e))

@router.post("/")
async def create(tree_decision_creation_dto: TreeDecisionCreationDto, _: Company = Depends(get_caller)):
    try:
        tree_decision_service = TreeDecisionService()

        res = await tree_decision_service.upsert(tree_decision_creation_dto.tree_id, tree_decision_creation_dto.payload)

        return ResponseHelper.success(res)
    
    except HTTPException as e:
        return ResponseHelper.error(e.status_code, msg=str(e.detail))
    except Exception as e:
        return ResponseHelper.error(msg=str(e))
    
@router.post("/toggle-decision")
async def toggle_node_as_decision(toggle_node_decision_dto: ToggleNodeAsDecisionDto, _: Company = Depends(get_caller)):
    try:
        tree_decision_service = TreeDecisionService()

        res = await tree_decision_service.toggle_node_as_decision(toggle_node_decision_dto.node_id)

        return ResponseHelper.success(res)
    
    except HTTPException as e:
        return ResponseHelper.error(e.status_code, msg=str(e.detail))
    except Exception as e:
        return ResponseHelper.error(msg=str(e))

@router.delete("/tree/{tree_id}")
async def delete(tree_id:str, _: Company = Depends(get_caller)):
    try:
        tree_decision_service = TreeDecisionService()

        res = await tree_decision_service.delete_by_tree_id(tree_id)

        return ResponseHelper.success(res)
    
    except HTTPException as e:
        return ResponseHelper.error(status=e.status_code, msg=str(e.detail))
    except Exception as e:
        return ResponseHelper.error(msg=str(e))