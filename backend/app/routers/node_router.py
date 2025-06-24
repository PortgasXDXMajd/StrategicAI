from app.helpers.auth_helper import get_caller
from app.models.db_models.company import Company
from app.services.node_service import NodeService
from app.helpers.response_helper import ResponseHelper
from app.models.dtos.node.edit_node_dto import EditNodeDto
from fastapi import APIRouter, Body, Depends, Query, Request
from app.models.dtos.node.create_node_dto import CreateNodeDto
from app.models.dtos.node.node_decompose_dto import DecomposeNodeDto
from app.agents.research_agent.research_agent import ResearchOption
from app.helpers.background_task_runner import BackgroundTaskRunner

router = APIRouter(prefix="/node")

@router.post("/")
async def create(create_node_dto: CreateNodeDto = Body(...), _: Company = Depends(get_caller)):
    try:
        node_service = NodeService()

        res = await node_service.create(create_node_dto)

        return ResponseHelper.success(res)
    except Exception as e:
        return ResponseHelper.error(msg=str(e))
    
@router.put("/")
async def edit(edit_node_dto: EditNodeDto = Body(...), _: Company = Depends(get_caller)):
    try:
        node_service = NodeService()
        
        res = await node_service.edit(edit_node_dto)
    
        return ResponseHelper.success(res)
    except Exception as e:
        return ResponseHelper.error(msg=str(e))
    
@router.delete("/{id}")
async def delete_node(
    id: str, 
    _: Company = Depends(get_caller), 
    only_children: bool = Query(False)
):
    try:
        node_service = NodeService()

        res = await node_service.delete(id, only_children)
    
        return ResponseHelper.success(res)
    except Exception as e:
        return ResponseHelper.error(msg=str(e))

@router.post("/{id}/decompose")
async def decompose_node(
    id:str,
    decompose_node_dto: DecomposeNodeDto = Body(...),
    _: Company = Depends(get_caller),
    request : Request = None):
    
    try:
        node_service = NodeService(request.state.llm_config)
        
        BackgroundTaskRunner.run_async_task(await node_service.decompose_using_agent(id, decompose_node_dto.tree_id))
        
        return ResponseHelper.success(True)
    except Exception as e:
        return ResponseHelper.error(msg=str(e))
    
@router.post("/{id}/verify")
async def verify_node(
    id:str,
    company: Company = Depends(get_caller),
    options: ResearchOption = Body(...),
    request : Request = None):
    
    try:
        node_service = NodeService(request.state.llm_config)
        await node_service.verify_node(id, options, company)
        # BackgroundTaskRunner.run_async_task()
    
        return ResponseHelper.success(True)
    except Exception as e:
        return ResponseHelper.error(msg=str(e))