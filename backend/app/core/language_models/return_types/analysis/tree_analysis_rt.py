from enum import Enum
from typing import List, Union
from app.core.language_models.return_types.llm_response import BaseModelUtil

class TreeActionType(str, Enum):
    REQUEST_USER_FILES = 'request_user_files'
    SEARCH_ONLINE = 'online_search'
    DECOMPOSE_NODE = 'decompose_node'
    EDIT_NODE = 'edit_node'
    ADD_NODE = 'add_node'
    DEL_NODE = 'delete_node'
    MESSAGE = 'message'
    DECISION = 'decision'

ACTION_NEEDED = [
    TreeActionType.SEARCH_ONLINE,
    TreeActionType.REQUEST_USER_FILES,
    TreeActionType.DECOMPOSE_NODE,
    TreeActionType.ADD_NODE,
    TreeActionType.EDIT_NODE,
    TreeActionType.DEL_NODE,
]

class DecisionItem(BaseModelUtil):
    item: str
    explanation: str
    node_id: str
    certainty: float

class Decision(BaseModelUtil):
    items: List[DecisionItem]

class TreeMessage(BaseModelUtil):
    message: str

class TreeSearch(BaseModelUtil):
    query: str

class NodeId(BaseModelUtil):
    node_id: str

class TreeNode(BaseModelUtil):
    text: str
    explanation: str

class TreeNodeEdit(TreeNode, NodeId):
    pass

class TreeNodeAddition(TreeNode):
    parent_node_id: str

class TreeActionResponseRT(BaseModelUtil):
    is_action_needed: bool
    action_type: TreeActionType
    payload: Union[
        NodeId,
        TreeNodeEdit,
        TreeNodeAddition,
        TreeMessage,
        TreeSearch,
        Decision
    ]
    