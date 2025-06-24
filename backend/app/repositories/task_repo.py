import datetime
from pymongo import DESCENDING
from typing import List, Optional
from app.models.db_models.task import Task
from app.models.db_models.file import File
from app.repositories.database import Mongo
from app.models.db_models.tree import Tree, TreeType
from app.models.db_models.tree_decision import TreeDecision


class TaskRepository:
    def __init__(self):
        db = Mongo.get_db()
        self.task_collection = db["Tasks"]
        self.tree_decision_collection = db["TreeDecisions"]

    async def _get_task_related_data(self, task_data):
        task_data["trees"] = [Tree.model_validate(tree) for tree in task_data.get("trees", [])]
        task_data["files"] = [File.model_validate(file) for file in task_data.get("files", [])]

        why_tree = next((tree for tree in task_data["trees"] if tree.type == TreeType.WHY), None)
        how_trees = [tree for tree in task_data["trees"] if tree.type == TreeType.HOW]
        hypothesis_trees = [tree for tree in task_data["trees"] if tree.type == TreeType.HYPOTHESIS]

        root_cause_analysis = None
        if why_tree:
            tree_decision = await self.tree_decision_collection.find_one({"tree_id": why_tree.id})
            if tree_decision:
                root_cause_analysis = TreeDecision.model_validate(tree_decision)

        task_data["root_cause_analysis"] = root_cause_analysis

        if how_trees:
            how_tree_decisions = []
            for t in how_trees:
                tree_decision = await self.tree_decision_collection.find_one({"tree_id": t.id})
                if tree_decision:
                    how_descision = TreeDecision.model_validate(tree_decision)
                    how_tree_decisions.append(how_descision)

            task_data["how_trees_decisions"] = how_tree_decisions 

        if hypothesis_trees:
            hypotheses_tested = []
            for hypo in hypothesis_trees:
                tree_decision = await self.tree_decision_collection.find_one({"tree_id": hypo.id})
                if tree_decision:
                    hypo_descision = TreeDecision.model_validate(tree_decision)
                    hypotheses_tested.append(hypo_descision)

            task_data["hypotheses_tested"] = hypotheses_tested      

        return Task.model_validate(task_data)
        
    async def get_by_id(self, task_id: str) -> Optional[Task]:
        pipeline = [
            {"$match": {"_id": task_id}},
            {
                "$lookup": {
                    "from": "Trees",
                    "localField": "_id",
                    "foreignField": "task_id",
                    "as": "trees"
                }
            },
            {
                "$lookup": {
                    "from": "Files",
                    "localField": "_id",
                    "foreignField": "task_id",
                    "as": "files"
                }
            }
        ]

        cursor = self.task_collection.aggregate(pipeline)
        task_data = await cursor.to_list(length=1)

        if not task_data:
            return None

        task_data = task_data[0]

        return await self._get_task_related_data(task_data)

    async def get_all(self, company_id: str) -> List[Task]:
        pipeline = [
            {"$match": {"company_id": company_id}},
            {"$sort": {"created_at": DESCENDING}},
            {
                "$lookup": {
                    "from": "Trees",
                    "localField": "_id",
                    "foreignField": "task_id",
                    "as": "trees"
                }
            },
            {
                "$lookup": {
                    "from": "Files",
                    "localField": "_id",
                    "foreignField": "task_id",
                    "as": "files"
                }
            }
        ]

        cursor = self.task_collection.aggregate(pipeline)
        task_list = await cursor.to_list(None)

        tasks_with_trees_and_files = []
        for task_data in task_list:
            task = await self._get_task_related_data(task_data)
            tasks_with_trees_and_files.append(task)

        return tasks_with_trees_and_files

    async def create(self, task: Task) -> bool:
        try:
            task.created_at = datetime.datetime.now(datetime.timezone.utc)
            task.modified_at = datetime.datetime.now(datetime.timezone.utc)
            task_dict = task.model_dump(by_alias=True)
            await self.task_collection.insert_one(task_dict)
            return True
        except Exception:
            return False

    async def update(self, task_id: str, updated_task: Task) -> bool:
        try:
            updated_task.modified_at = datetime.datetime.now(datetime.timezone.utc)
            updated_task_dict = updated_task.model_dump(by_alias=True)
            result = await self.task_collection.replace_one({"_id": task_id}, updated_task_dict)
            return result.modified_count == 1
        except Exception:
            return False

    async def delete(self, task_id: str) -> bool:
        try:
            result = await self.task_collection.delete_one({"_id": task_id})
            return result.deleted_count == 1
        except Exception:
            return False
