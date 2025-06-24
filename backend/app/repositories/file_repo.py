import datetime
from typing import List, Union
from app.models.db_models.file import File
from app.repositories.database import Mongo

class FileRepository:

    def __init__(self):
        db = Mongo.get_db()
        self.file_collection = db["Files"]

    async def get_by_id(self, file_id: str) -> File:
        file = await self.file_collection.find_one({"_id": file_id})

        if file is None:
            return None

        return File.model_validate(file)

    async def get_by_tree_id(self, tree_id: str) -> List[File]:
        files = await self.file_collection.find({"tree_id": tree_id}).to_list(length=None)
        return [File.model_validate(file) for file in files]

    async def get_by_node_id(self, node_id: str) -> List[File]:
        files = await self.file_collection.find({"node_id": node_id}).to_list(length=None)
        return [File.model_validate(file) for file in files]

    async def get_by_task_id(self, task_id: str) -> List[File]:
        files = await self.file_collection.find({"task_id": task_id}).to_list(length=None)
        return [File.model_validate(file) for file in files]

    async def get_by_company_id(self, company_id: str) -> List[File]:
        files = await self.file_collection.find({"company_id": company_id}).to_list(length=None)
        return [File.model_validate(file) for file in files]

    async def create(self, files: Union[File, List[File]]) -> bool:
        try:
            if isinstance(files, File):
                files.created_at = datetime.datetime.now(datetime.timezone.utc)
                files.modified_at = datetime.datetime.now(datetime.timezone.utc)
                file_dict = files.model_dump(by_alias=True)
                
                await self.file_collection.insert_one(file_dict)
                
            elif isinstance(files, list):
                file_dicts = []
                for file in files:
                    file.created_at = datetime.datetime.now(datetime.timezone.utc)
                    file.modified_at = datetime.datetime.now(datetime.timezone.utc)
                    file_dicts.append(file.model_dump(by_alias=True))
                
                await self.file_collection.insert_many(file_dicts)
            
            return True

        except Exception:
            return False

    async def update(self, file_id: str, updated_file: File) -> bool:
        try:
            updated_file.modified_at = datetime.datetime.now(datetime.timezone.utc)

            updated_file_dict = updated_file.model_dump(by_alias=True)

            result = await self.file_collection.replace_one({"_id": file_id}, updated_file_dict)

            return result.modified_count == 1

        except Exception:
            return False
        
    async def delete(self, file_id: str) -> bool:
        try:
            result = await self.file_collection.delete_one({"_id": file_id})
            return result.deleted_count == 1
        except Exception:
            return False
