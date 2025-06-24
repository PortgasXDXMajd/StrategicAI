from enum import Enum
from typing import Dict, List, Optional
from app.models.db_models.base_entity import BaseEntity


class NodeType(str, Enum):
    ROOT = "root"
    NORMAL = "normal"
    HYPO = "hypo"
    RHYPO = 'rhypo'


class Node(BaseEntity):
    tree_id: str
    text: str
    type: NodeType = NodeType.NORMAL
    explanation: str
    certainty: float
    children: List['Node'] = []
    is_part_decision: bool = False
    parent_id: Optional[str] = None
    is_related_to_diff_tree: bool = False
    related_tree_id: Optional[str] = None
    required_data: Optional[List[str]] = None
    
    def get_node_info(self):
        return f"Node Text: {self.text}\nExplanation:{self.explanation}\nCertainity:{self.certainty}"

    def get_node_info_json(self):
        return {
            'node_id': self.id,
            'text': self.text,
            'explanation': self.explanation,
            'certainity': self.certainty
        }
    
    def extract_nodes_as_dict(self) -> Dict[str, 'Node']:
        node_dict = {}

        def dfs(node: Node):
            node_dict[node.id] = node
            for child in node.children:
                dfs(child)

        dfs(self)

        return node_dict
    
    
