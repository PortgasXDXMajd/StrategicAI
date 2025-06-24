import datetime
from typing import List
from app.repositories.database import Mongo
from app.models.db_models.tree import Tree, TreeType
from app.repositories.node_repo import NodeRepository

class TreeRepository:

    def __init__(self):
        db = Mongo.get_db()
        self.tree_collection = db["Trees"]
        self.node_repository = NodeRepository()

    async def get(self, related_node_id: str = None, type: TreeType = None) -> List[Tree]:
        query = {}
        if related_node_id is not None:
            query["related_node_id"] = related_node_id
        if type is not None:
            query["type"] = type

        cursor = self.tree_collection.find(query)
        tree_list = await cursor.to_list(None)
        return [Tree.model_validate(t) for t in tree_list]

    
    async def get_by_id(self, tree_id: str) -> Tree:
        tree = await self.tree_collection.find_one({"_id": tree_id})

        if tree is None:
            return None
        
        return Tree.model_validate(tree)
    
    async def get_by_root_id(self, root_node_id: str) -> Tree:
        tree = await self.tree_collection.find_one({"root_node_id": root_node_id})

        if tree is None:
            return None
        
        return Tree.model_validate(tree)
    async def get_all_tree(self, task_id: str) -> List[Tree]:
        
        cursor = self.tree_collection.find({"task_id": task_id})

        tree_list = await cursor.to_list(None)

        return [Tree.model_validate(t) for t in tree_list]
    
    async def get_tree_by_task_id_tree_type(self, task_id: str, tree_type: TreeType) -> List[Tree]:
        
        cursor = self.tree_collection.find({"task_id": task_id, "type": tree_type})

        tree_list = await cursor.to_list(None)

        return [Tree.model_validate(t) for t in tree_list]
    
    async def create(self, tree: Tree) -> bool:
        try:
            tree.created_at = datetime.datetime.now(datetime.timezone.utc)
            tree.modified_at = datetime.datetime.now(datetime.timezone.utc)

            tree_dict = tree.model_dump(by_alias=True)

            await self.tree_collection.insert_one(tree_dict)

            return True

        except Exception:
            return False

    async def update(self, tree_id: str, updated_tree: Tree) -> bool:
        try:
            updated_tree.modified_at = datetime.datetime.now(datetime.timezone.utc)

            updated_tree_dict = updated_tree.model_dump(by_alias=True)

            result = await self.tree_collection.replace_one({"_id": tree_id}, updated_tree_dict)

            return result.modified_count == 1

        except Exception:
            return False

    async def delete(self, tree_id: str) -> bool:
        try:
            tree = await self.get_by_id(tree_id)
            if not tree:
                return False
            
            if tree.related_node_id:
                node = await self.node_repository.get_by_id(tree.related_node_id)
                if node:
                    node.is_related_to_diff_tree=False
                    node.related_tree_id=None
                    await self.node_repository.update(node.id, node)
                
            await self.node_repository.delete(tree.root_node_id)
            
            result = await self.tree_collection.delete_one({"_id": tree_id})
            return result.deleted_count == 1
        except Exception as e:
            return False
        
    async def find_related_how_tree(self, hypothesis_tree_id: str):
        nodes = await self.node_repository.get_by_related_tree_id(hypothesis_tree_id)
        
        for node in nodes:
            how_tree = await self.get_by_id(node.tree_id)
            if how_tree and how_tree.type == TreeType.HOW:
                return how_tree, node
            
        return None, None
