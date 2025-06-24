from typing import Union
from ..llm_response import BaseModelUtil
from .params import AdditionParam, EditParam, MessageParam, MethodName, NodeIdParam, OnlineSearchParam

EXECUTION_NEEDED = [
    MethodName.ADD_NODE,
    MethodName.EDIT_NODE,
    MethodName.DEL_NODE,
    MethodName.SEARCH_ONLINE,
]

class AgentRT(BaseModelUtil):
    method_name: MethodName
    params: Union[
        AdditionParam,
        EditParam,
        NodeIdParam,
        MessageParam,
        OnlineSearchParam,
    ]
