import datetime
from app.repositories.database import Mongo
from app.models.db_models.tree_decision import TreeDecision

class TreeDecisionRepository:

    def __init__(self):
        db = Mongo.get_db()
        self.tree_decision_collection = db["TreeDecisions"]

    async def get_by_id(self, id: str) -> TreeDecision:
        tree_decision = await self.tree_decision_collection.find_one({"_id": id})

        if tree_decision is None:
            return None

        return TreeDecision.model_validate(tree_decision)
    
    async def get_by_tree_id(self, tree_id: str) -> TreeDecision:
        tree_decision = await self.tree_decision_collection.find_one({"tree_id": tree_id})

        if tree_decision is None:
            return None

        return TreeDecision.model_validate(tree_decision)
    
    async def get_by_tree_analysis_id(self, tree_analysis_id: str) -> TreeDecision:
        tree_decision = await self.tree_decision_collection.find_one({"tree_analysis_id": tree_analysis_id})

        if tree_decision is None:
            return None

        return TreeDecision.model_validate(tree_decision)

    async def create(self, tree_decision: TreeDecision) -> bool:
        try:
            tree_decision.created_at = datetime.datetime.now(datetime.timezone.utc)
            tree_decision.modified_at = datetime.datetime.now(datetime.timezone.utc)
            
            tree_decision_dict = tree_decision.model_dump(by_alias=True)

            await self.tree_decision_collection.insert_one(tree_decision_dict)
            
            return True

        except Exception as e:
            return False

    async def update(self, id: str, updated_tree_decision: TreeDecision, upsert = False) -> bool:
        try:
            updated_tree_decision.modified_at = datetime.datetime.now(datetime.timezone.utc)

            updated_tree_decision_dict = updated_tree_decision.model_dump(by_alias=True)

            result = await self.tree_decision_collection.replace_one({"_id": id}, updated_tree_decision_dict, upsert=upsert)

            return result.modified_count == 1

        except Exception as e:
            return False
        
    async def delete(self, id: str) -> bool:
        try:
            await self.tree_decision_collection.delete_one({"_id": id})
            return True
        except Exception as e:
            return False