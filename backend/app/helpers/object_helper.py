from pydantic import BaseModel
from typing import Any, Type, TypeVar


T = TypeVar("T", bound=BaseModel)


class ObjHelper:
    @staticmethod
    def cast(object: Any, klass: Type[T]) -> T:
        if isinstance(object, klass):
            return object
