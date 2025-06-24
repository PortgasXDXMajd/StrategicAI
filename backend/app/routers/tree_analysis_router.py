from typing import List
from app.helpers.auth_helper import get_caller
from app.models.db_models.company import Company
from app.helpers.response_helper import ResponseHelper
from app.services.hypothesis_service import HypothesisService
from app.services.tree_analysis_service import TreeAnalysisService
from fastapi import APIRouter, Body, Depends, File, Form, Request, UploadFile
from app.models.dtos.tree_analysis.create_tree_analysis_dto import CreateTreeAnalysisDto
from app.helpers.background_task_runner import BackgroundTaskRunner

router = APIRouter(prefix="/tree-analysis")


@router.get("/{id}")
async def get(id: str, _: Company = Depends(get_caller)):

    try:
        tree_analysis_service = TreeAnalysisService()

        res = await tree_analysis_service.get(id)

        return ResponseHelper.success(res)
    except Exception as e:
        return ResponseHelper.error(msg=str(e))


@router.post("/auto")
async def create_auto_agent(
        tree_id: str = Form(...),
        files: List[UploadFile] = File(None),
        caller: Company = Depends(get_caller), request: Request = None):

    try:
        tree_analysis_service = TreeAnalysisService(request.state.llm_config)

        BackgroundTaskRunner.run_async_task(await tree_analysis_service.create_auto_agent(tree_id, caller, files))

        return ResponseHelper.success(True)
    except Exception as e:
        return ResponseHelper.error(msg=str(e))


@router.post("/hypothesis-testing")
async def start_hypothesis_test(
        tree_id: str = Form(...),
        node_id: str = Form(None),
        files: List[UploadFile] = File(None),
        caller: Company = Depends(get_caller), request: Request = None):

    try:
        hypothesis_service = HypothesisService(tree_id, caller, request.state.llm_config)

        BackgroundTaskRunner.run_async_task(await hypothesis_service.start_hypothesis_test(files, node_id))

        return ResponseHelper.success(True)
    except Exception as e:
        return ResponseHelper.error(msg=str(e))


@router.post("/")
async def create(
        create_tree_analysis_dto: CreateTreeAnalysisDto = Body(...),
        caller: Company = Depends(get_caller), request: Request = None):

    try:
        tree_analysis_service = TreeAnalysisService(request.state.llm_config)

        res = await tree_analysis_service.get_or_create_collaboration_agent(create_tree_analysis_dto, caller)

        return ResponseHelper.success(res)
    except Exception as e:
        return ResponseHelper.error(msg=str(e))


@router.post("/{tree_id}/send")
async def handle_user_input(
        tree_id: str,
        text: str = Form(None),
        files: List[UploadFile] = File(None),
        caller: Company = Depends(get_caller),
        request: Request = None):

    try:
        tree_analysis_service = TreeAnalysisService(request.state.llm_config)

        res = await tree_analysis_service.handle_user_input(tree_id, caller, text, files)

        return ResponseHelper.success(res)

    except Exception as e:
        return ResponseHelper.error(msg=str(e))
