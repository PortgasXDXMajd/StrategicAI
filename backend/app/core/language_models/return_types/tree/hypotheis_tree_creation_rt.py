from pydantic import Field
from typing import List, Optional
from app.models.db_models.node import Node, NodeType
from app.core.language_models.return_types.llm_response import BaseModelUtil


class HypothesisNodeRT(BaseModelUtil):
   question: str
   required_data: Optional[List[str]] = Field(description="list of required data needed to answer the question in the given node")
   children: Optional[List['HypothesisNodeRT']]

class HypothesisTreeRT(BaseModelUtil):
   branches: List[HypothesisNodeRT]


def create_nodes_recursively(node_data: HypothesisNodeRT, tree_id: str, parent_id: Optional[str] = None, is_root: bool = True, is_hypothesis_tree: bool = True) -> List[Node]:
   nodes = []
    
   current_node = Node(
      text=node_data.question,
      tree_id=tree_id,
      parent_id=parent_id,
      type=NodeType.RHYPO if is_root else (NodeType.NORMAL if not is_hypothesis_tree else NodeType.HYPO),
      explanation=str(),
      certainty=0,
      required_data=node_data.required_data,
   )
   nodes.append(current_node)
    
   if node_data.children:
      for child in node_data.children:
         child_nodes = create_nodes_recursively(
            node_data=child,
            tree_id=tree_id,
            parent_id=current_node.id,
            is_root=False
         )
         nodes.extend(child_nodes)
         
   return nodes