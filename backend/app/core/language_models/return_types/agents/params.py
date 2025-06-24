from enum import Enum
from typing import Optional
from app.core.language_models.return_types.llm_response import BaseModelUtil


class MethodName(str, Enum):
    ADD_NODE = 'add_node'
    EDIT_NODE = 'edit_node'
    DEL_NODE = 'delete_node'
    SEARCH_ONLINE = 'search_online'
    OUTPUT = 'communicate_with_user'
    STOP_EXECUTION = 'stop_execution'

class NodeIdParam(BaseModelUtil):
    node_id: Optional[str]

class NodeParam(BaseModelUtil):
    text: str
    explanation: str
    certainity: float

class AdditionParam(NodeParam):
    parent_node_id: str

class EditParam(NodeIdParam, NodeParam):
    pass

class MessageParam(BaseModelUtil):
    message: str

class OnlineSearchParam(BaseModelUtil):
    query: str