from typing import List
from app.models.db_models.node_result import NodeResult


class HypothesisHelper:

    @staticmethod
    def update_history(existing_history: List[NodeResult], node_results: List[NodeResult]):
        node_results_dict = {
            node_res.node_id: node_res for node_res in node_results}

        updated_history = []
        existing_node_ids = {node.node_id for node in existing_history}

        for node in existing_history:
            if node.node_id in node_results_dict:
                updated_node = node_results_dict[node.node_id]
                updated_history.append(updated_node)
            else:
                updated_history.append(node)

        for node_res in node_results:
            if node_res.node_id not in existing_node_ids:
                updated_history.append(node_res)

        return updated_history
