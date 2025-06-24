import json
from app.helpers.config_helper import Core
from app.helpers.string_helper import StringHelper
from typing import Any, Tuple, Type, TypeVar, Optional, Union

T = TypeVar("T")

class LLMHelper:
    @staticmethod
    async def safe_generate_response(
        core_engine: Core,
        usr_prmt: str,
        sys_prmt: str = None,
        return_type: Optional[Type[T]] = None,
        is_history_required: bool = True,
        continuation_token: str = None,
        max_retries: int = 5,
        return_string: bool = False
    ) -> Tuple[Union[T, dict], float]:
        attempts = 0
        while attempts < max_retries:
            try:
                response_str, certainty = await core_engine.model.generate_simple_response_with_certainity(
                    usr_prmt,
                    sys_prmt,
                    is_history_required,
                    continuation_token
                )
                
                if return_string:
                    return response_str, certainty
                
                response_json = StringHelper.extract_json_from_string(response_str)

                if return_type is not None:
                    result = return_type(**response_json)
                else:
                    result = response_json

                return result, certainty

            except (json.JSONDecodeError, KeyError, TypeError) as e:
                attempts += 1

        raise ValueError(
            "Failed to generate a valid response after multiple retries.")
