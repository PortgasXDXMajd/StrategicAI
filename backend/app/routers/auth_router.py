from fastapi import APIRouter, Body
from app.services.auth_service import AuthService
from app.models.dtos.auth.auth_dto import AuthDto
from app.helpers.response_helper import ResponseHelper


router = APIRouter(prefix="/auth")
auth_service = AuthService()


@router.post("/login")
async def login(company_login: AuthDto = Body(...)):
    try:
        res = await auth_service.login(company_login)
        
        return ResponseHelper.success(res)
    except Exception as e:
        return ResponseHelper.error(msg=str(e))

@router.post("/register")
async def register(company_registration: AuthDto = Body(...)):
    try:
        res = await auth_service.register(company_registration)

        return ResponseHelper.success(res)
    except Exception as e:
        return ResponseHelper.error(msg=str(e))