import os
import math
from pydantic import BaseModel
from typing import Tuple, Type, TypeVar
from app.services.chat_cache import ChatCache
from langchain_fireworks import ChatFireworks
from app.core.language_models.base_llm import LLMBase
from app.core.language_models.return_types.llm_response import StringRT

T = TypeVar("T", bound=BaseModel)


class FireworkAILLM(LLMBase):
    def __init__(self, model_name: str):
        super().__init__(model_name=model_name)
        self.API_KEY = os.getenv("FIREWORKS_API_KEY")

        if not self.API_KEY:
            raise Exception(
                "FIREWORKS_API_KEY key not found in environment variables.")

        self.model = ChatFireworks(
            model=self.model_name,
            logprobs=1,
            temperature=0
        )

    async def generate(self, sys_prompt: str = "", usr_prompt: str = "", return_type: Type[T] = StringRT, continuation_token: str = None, role='user') -> Tuple[Type[T], str]:
        if role == 'user':
            role = 'human'

        chat_cache = await ChatCache().load()

        messages = [
            ("system", sys_prompt),
            (role, usr_prompt)
        ]

        if continuation_token == None:
            continuation_token = chat_cache.generate_token()
            await chat_cache.add(continuation_token, messages)

        structured_llm = self.model.with_structured_output(return_type)

        model_res = structured_llm.invoke(messages)

        await chat_cache.add(continuation_token, [("assistant", str(model_res))])

        return model_res, continuation_token

    async def continue_convo(self, usr_prompt=None, return_type: Type[T] = StringRT, continuation_token: str = None, role='user') -> Tuple[Type[T], str]:
        if role == 'user':
            role = 'human'

        chat_cache = await ChatCache().load()

        if continuation_token == None:
            raise Exception("continuation_token is None")

        structured_llm = self.model.with_structured_output(return_type)

        user_msg = (role, str(usr_prompt))

        await chat_cache.add(continuation_token, user_msg)
        messages = chat_cache.get(continuation_token)

        retries = 0
        while retries < 3:
            try:
                model_res = structured_llm.invoke(messages)

                if isinstance(model_res, return_type):
                    await chat_cache.add(continuation_token, [("system", str(model_res))])
                    return model_res, continuation_token
                else:
                    raise TypeError(
                        f"Output is not of type {return_type.__name__}")

            except Exception as e:
                retries += 1

        raise Exception(
            f"Model failed to return output of type {return_type.__name__} after 3 retries")

    async def generate_simple_response_with_certainity(
            self,
            usr_prompt: str,
            sys_prompt: str = None,
            is_history_required=False,
            continuation_token: str = None) -> Tuple[str, float]:

        chat_cache = await ChatCache().load()

        user_msg = ('human', str(usr_prompt))

        if sys_prompt:
            messages = [
                ("system", sys_prompt),
                user_msg
            ]
            if is_history_required:
                await chat_cache.add(continuation_token, messages)
        elif is_history_required:
            await chat_cache.add(continuation_token, user_msg)
            messages = chat_cache.get(continuation_token)
        else:
            messages = [user_msg]

        try:
            response = self.model.invoke(messages)

            answer = response.content

            if is_history_required:
                await chat_cache.add(continuation_token, [("assistant", str(answer))])

            logprobs = response.response_metadata['logprobs']['token_logprobs']
            if logprobs:
                avg_logprob = sum(logprobs) / len(logprobs)
                certainty_percentage = round(math.exp(avg_logprob) * 100, 2)
            else:
                certainty_percentage = 100.0

            return answer, certainty_percentage

        except Exception as e:
            raise Exception(f"Failed to generate response: {e}")
