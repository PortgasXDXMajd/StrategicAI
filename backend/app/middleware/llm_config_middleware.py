from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from app.models.dtos.configs.llm_type_enum import LLMConfigDto

class LLMConfigMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        
        llm_type = request.headers.get("X-LLM-Type", 'openai')  
        llm_model = request.headers.get("X-LLM-Model", "gpt-4o-mini")

        configs = LLMConfigDto(type=llm_type, model=llm_model)

        request.state.llm_config = configs

        response = await call_next(request)
        return response
