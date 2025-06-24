import os
import math
import openai
from openai import OpenAI
from pydantic import BaseModel
from typing import Tuple, Type, TypeVar
from langchain_openai import ChatOpenAI
from app.services.chat_cache import ChatCache
from app.core.language_models.base_llm import LLMBase
from app.core.language_models.return_types.llm_response import StringRT

T = TypeVar("T", bound=BaseModel)


class OpenAILLM(LLMBase):
    def __init__(self, model_name: str):
        super().__init__(model_name=model_name)
        self.API_KEY = os.getenv("OPENAI_API_KEY")

        openai.api_key = self.API_KEY
        self.model = ChatOpenAI(model=self.model_name)
        self.client = OpenAI()

    async def generate(self, sys_prompt: str = "", usr_prompt: str = "", return_type: Type[T] = StringRT, continuation_token: str = None, role='user') -> Tuple[T, str]:
        try:
            chat_cache = await ChatCache().load()

            messages = [
                {"role": "system", "content": sys_prompt},
                {"role": role, "content": usr_prompt}
            ]

            if continuation_token == None:
                continuation_token = chat_cache.generate_token()
                await chat_cache.add(continuation_token, messages)

            structured_llm = self.model.with_structured_output(return_type)
            model_res = structured_llm.invoke(messages)

            await chat_cache.add(continuation_token, [{"role": "assistant", "content": str(model_res)}])

            return model_res, continuation_token
        except Exception as e:
            pass

    async def continue_convo(self, usr_prompt=None, return_type: Type[T] = StringRT, continuation_token: str = None, role='user') -> Tuple[T, str]:
        chat_cache = await ChatCache().load()

        if continuation_token == None:
            raise Exception("continuation_token is None")

        structured_llm = self.model.with_structured_output(return_type)

        user_msg = {"role": role, "content": f"{str(usr_prompt)}"}

        await chat_cache.add(continuation_token, user_msg)
        messages = chat_cache.get(continuation_token)

        retries = 0
        while retries < 3:
            try:
                model_res = structured_llm.invoke(messages)

                if isinstance(model_res, return_type):
                    await chat_cache.add(continuation_token, {"role": "assistant", "content": str(model_res)})
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

        user_msg = {"role": 'user', "content": str(usr_prompt)}

        if sys_prompt:
            messages = [
                {"role": "system", "content": sys_prompt},
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
            response = self.client.chat.completions.create(
                model=self.model_name,
                messages=messages,
                logprobs=True,
                temperature=0
            )

            answer = response.choices[0].message.content

            if is_history_required:
                await chat_cache.add(continuation_token, [{"role": "assistant", "content": str(answer)}])
            logprobs = [
                x.logprob for x in response.choices[0].logprobs.content]
            if logprobs:
                avg_logprob = sum(logprobs) / len(logprobs)
                certainty_percentage = round(math.exp(avg_logprob) * 100, 2)
            else:
                certainty_percentage = 100.0

            return answer, certainty_percentage

        except Exception as e:
            raise Exception(f"Failed to generate response: {e}")
