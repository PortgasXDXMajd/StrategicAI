from typing import List, Optional
from app.models.db_models.node import Node
from app.core.language_models.return_types.llm_response import BaseModelUtil

class AssistantNode(BaseModelUtil):
    id: str = ''
    text:str = ''
    explanation: str = ''
    children: List['AssistantNode'] = []

    def __init__(self, node: Node):
        super().__init__()
        self.id = node.id
        self.text = node.text
        self.explanation = node.explanation
        for c in node.children:
            self.children.append(AssistantNode(c))
    
    def get_string(self):
        return self.model_dump_json(indent=2)
    
    def get_children_from_layer_as_list(self, layer: int) -> List[dict]:
        if layer < 0:
            return []
        
        queue = [(self, 0)]  # (node, depth)
        result = []
        
        while queue:
            current_node, depth = queue.pop(0)
            
            if depth == layer:
                result.append({"node_id": current_node.id, "text":current_node.text, "explanation":current_node.explanation})
            elif depth < layer:
                queue.extend((child, depth + 1) for child in current_node.children)
        
        return result

class DecompositionHelperNode(BaseModelUtil):
    text:str = ''
    explanation: str = ''
    sub_nodes: List['DecompositionHelperNode'] = []

    def __init__(self, node: Node):
        super().__init__()
        self.text = node.text
        self.explanation = node.explanation
        for c in node.children:
            self.sub_nodes.append(AssistantNode(c))
    
    def get_string(self):
        return self.model_dump_json(indent=2)
    
class EvalNode(BaseModelUtil):
    text:str = ''
    explanation: str = ''
    children: List['EvalNode'] = []

    def __init__(self, node: Node):
        super().__init__()
        self.text = node.text
        self.explanation = node.explanation
        for c in node.children:
            self.children.append(AssistantNode(c))

class CandidateNode(BaseModelUtil):
    id: str = ''
    text:str = ''
    explanation: str = ''
    is_part_decision: bool = False
    is_related_to_diff_tree: bool = False
    related_tree_id: Optional[str] = None
    children: List['CandidateNode'] = []

    def __init__(self, node: Node):
        super().__init__()
        self.id = node.id
        self.text = node.text
        self.explanation = node.explanation
        self.is_part_decision = node.is_part_decision
        self.related_tree_id = node.related_tree_id
        self.is_related_to_diff_tree = node.is_related_to_diff_tree
        for c in node.children:
            self.children.append(CandidateNode(c))
