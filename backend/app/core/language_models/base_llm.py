import torch
from pydantic import BaseModel
from typing import Tuple, Type, TypeVar
from app.core.language_models.return_types.llm_response import StringRT

T = TypeVar("T", bound=BaseModel)


class LLMBase:
    def __init__(self, model_name: str):
        self.model_name = model_name
        self.device = "cuda" if torch.cuda.is_available() else "cpu"

    async def generate(self, sys_prompt: str = "", usr_prompt: str = "", return_type: Type[T] = StringRT, continuation_token: str = None, role='user') -> Tuple[T, str]:
        raise NotImplementedError(
            "This method should be implemented by subclasses")

    async def continue_convo(self, usr_prompt=None, return_type: Type[T] = StringRT, continuation_token: str = None, role='user') -> Tuple[T, str]:
        raise NotImplementedError(
            "This method should be implemented by subclasses")

    async def generate_simple_response_with_certainity(
            self,
            usr_prompt: str,
            sys_prompt: str = None,
            is_history_required=False,
            continuation_token: str = None) -> Tuple[str, float]:
        raise NotImplementedError(
            "This method should be implemented by subclasses")
