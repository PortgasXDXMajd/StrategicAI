import datetime
from app.repositories.database import Mongo
from app.models.db_models.tree_analysis import TreeAnalysis

class TreeAnalysisRepository:

    def __init__(self):
        db = Mongo.get_db()
        self.tree_analysis_collection = db["TreeAnalysis"]

    async def get_by_id(self, id: str) -> TreeAnalysis:
        tree_analysis = await self.tree_analysis_collection.find_one({"_id": id})

        if tree_analysis is None:
            return None

        return TreeAnalysis.model_validate(tree_analysis)
    
    async def get_by_tree_id(self, tree_id: str) -> TreeAnalysis:
        tree_analysis = await self.tree_analysis_collection.find_one({"tree_id": tree_id})

        if tree_analysis is None:
            return None

        return TreeAnalysis.model_validate(tree_analysis)

    async def create(self, tree_analysis: TreeAnalysis) -> bool:
        try:
            tree_analysis.created_at = datetime.datetime.now(datetime.timezone.utc)
            tree_analysis.modified_at = datetime.datetime.now(datetime.timezone.utc)
            
            tree_analysis_dict = tree_analysis.model_dump(by_alias=True)

            await self.tree_analysis_collection.insert_one(tree_analysis_dict)
            
            return True

        except Exception as e:
            return False

    async def update(self, id: str, updated_tree_analysis: TreeAnalysis, upsert = False) -> bool:
        try:
            updated_tree_analysis.modified_at = datetime.datetime.now(datetime.timezone.utc)

            updated_tree_decision_dict = updated_tree_analysis.model_dump(by_alias=True)

            result = await self.tree_analysis_collection.replace_one({"_id": id}, updated_tree_decision_dict, upsert=upsert)

            return result.modified_count == 1

        except Exception as e:
            return False
        
    async def delete(self, id: str) -> bool:
        try:
            await self.tree_analysis_collection.delete_one({"_id": id})
            return True
        except Exception as e:
            return False