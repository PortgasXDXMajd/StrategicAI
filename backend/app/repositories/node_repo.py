import datetime
from typing import List, Union
from app.models.db_models.node import Node
from app.repositories.database import Mongo


class NodeRepository:

    def __init__(self):
        db = Mongo.get_db()
        self.tree_collection = db["Trees"]
        self.node_collection = db["Nodes"]

    async def get_by_id(self, node_id: str) -> Node:
        node = await self.node_collection.find_one({"_id": node_id})

        if node is None:
            return None

        return Node.model_validate(node)

    async def get_by_ids(self, node_ids: List[str]) -> List[Node]:
        cursor = self.node_collection.find({"_id": {"$in": node_ids}})
        nodes = await cursor.to_list(None)
        return [Node.model_validate(node) for node in nodes]

    async def get_original_root_node_by_tree_id(self, tree_id: str) -> Node:
        root_node = await self.node_collection.find_one({"related_tree_id": tree_id})

        if root_node is None:
            return None

        return Node.model_validate(root_node)

    async def get_node_with_children(self, node_id: str) -> Node:
        async def fetch_node_and_children(node_id):
            node_data = await self.node_collection.find_one({"_id": node_id})
            if not node_data:
                return None

            node = Node.model_validate(node_data)

            children = await self.node_collection.find({"parent_id": node_id}).to_list(None)
            node.children = [await fetch_node_and_children(child["_id"]) for child in children]

            return node

        return await fetch_node_and_children(node_id)

    async def create(self, nodes: Union[Node, List[Node]]) -> bool:
        try:
            if isinstance(nodes, Node):
                nodes.created_at = datetime.datetime.now(datetime.timezone.utc)
                nodes.modified_at = datetime.datetime.now(
                    datetime.timezone.utc)
                node_dict = nodes.model_dump(by_alias=True)

                await self.node_collection.insert_one(node_dict)

            elif isinstance(nodes, list):
                node_dicts = []
                for node in nodes:
                    node.created_at = datetime.datetime.now(
                        datetime.timezone.utc)
                    node.modified_at = datetime.datetime.now(
                        datetime.timezone.utc)
                    node_dicts.append(node.model_dump(by_alias=True))

                await self.node_collection.insert_many(node_dicts)

            return True

        except Exception:
            return False

    async def update(self, node_id: str, updated_node: Node) -> bool:
        try:
            updated_node.modified_at = datetime.datetime.now(
                datetime.timezone.utc)

            updated_node_dict = updated_node.model_dump(by_alias=True)

            result = await self.node_collection.replace_one({"_id": node_id}, updated_node_dict)

            return result.modified_count == 1

        except Exception:
            return False

    async def delete(self, node_id: str) -> bool:
        try:
            await self._delete_node_with_children(node_id)
            return True
        except Exception:
            return False

    async def _delete_node_with_children(self, node_id: str, only_children: bool = False):
        children = await self.node_collection.find({"parent_id": node_id}).to_list(None)

        for child in children:
            await self._delete_node_with_children(child["_id"])

        if not only_children:
            await self.node_collection.delete_one({"_id": node_id})

        return True

    async def get_by_related_tree_id(self, related_tree_id: str) -> List[Node]:
        cursor = self.node_collection.find(
            {"related_tree_id": related_tree_id})
        node_list = await cursor.to_list(None)
        return [Node.model_validate(n) for n in node_list]

    async def get_node_var_with_children(self, node_id: str, var_name: str = 'text') -> List[str]:
        async def fetch_texts(node_id):
            node_data = await self.node_collection.find_one({"_id": node_id})
            if not node_data:
                return []

            texts = []

            if node_data["type"] != "root" and node_data["type"] != "rhypo":
                texts = [node_data[var_name]]

            children = await self.node_collection.find({"parent_id": node_id}).to_list(None)
            for child in children:
                texts.extend(await fetch_texts(child["_id"]))

            return texts

        return await fetch_texts(node_id)