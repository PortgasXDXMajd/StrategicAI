from enum import Enum
from app.models.db_models.node import Node
from typing import Any, List, Optional, Set
from app.models.db_models.base_entity import BaseEntity

class TreeType(str, Enum):
    WHY = "why"
    HOW = "how"
    HYPOTHESIS = "hypothesis"

class Tree(BaseEntity):
    title: str
    type: TreeType
    task_id: str
    root_node_id: Optional[str] = None
    payload: Optional[Any] = None
    related_node_id: Optional[str] = None

    def get_deepest_unrelated_nodes(self, root: Node, node_ids: List[str]) -> List[Node]:
        # Extract all nodes into a dictionary for easy lookup
        all_nodes = root.extract_nodes_as_dict()

        # Filter only the nodes that match the given node IDs
        id_to_node = {node_id: all_nodes[node_id] for node_id in node_ids if node_id in all_nodes}

        # Determine depth levels for each node
        def get_depth(node: Node) -> int:
            depth = 0
            current = node
            while current.parent_id and current.parent_id in all_nodes:
                depth += 1
                current = all_nodes[current.parent_id]
            return depth

        # Sort nodes by depth (deepest first)
        sorted_nodes = sorted(id_to_node.values(), key=get_depth, reverse=True)

        # Select deepest non-related nodes
        selected_nodes = []
        seen_ancestors: Set[str] = set()

        for node in sorted_nodes:
            if node.id not in seen_ancestors:
                selected_nodes.append(node)
                current = node
                while current.parent_id and current.parent_id in all_nodes:
                    seen_ancestors.add(current.parent_id)
                    current = all_nodes[current.parent_id]

        return selected_nodes