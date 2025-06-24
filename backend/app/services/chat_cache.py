import uuid
from typing import List, Union
from app.repositories.database import Mongo

class ChatCache:
    def __init__(self):
        db = Mongo.get_db()
        self.chat_cache = db["ChatCache"]
        self.cache = {}

    def generate_token(self) -> str:
        return str(uuid.uuid4())

    async def load(self):
        stored_cache = await self.chat_cache.find_one({"_id": "cache"})
        self.cache = stored_cache["data"] if stored_cache else {}

        return self

    async def _save_to_mongo(self):
        await self.chat_cache.update_one(
            {"_id": "cache"},
            {"$set": {"data": self.cache}},
            upsert=True
        )

    async def add(self, token: str, msg: Union[List[dict], dict]):
        if token not in self.cache:
            self.cache[token] = []
        if isinstance(msg, list):
            self.cache[token].extend(msg)
        else:
            self.cache[token].append(msg)
        
        await self._save_to_mongo()

    def get(self, token: str) -> List[dict]:
        return self.cache.get(token, [])

    async def delete(self, token: str):
        if token in self.cache:
            self.cache.pop(token)
            await self._save_to_mongo()

    async def delete_all(self):
        self.cache = {}
        await self.chat_cache.update_one(
            {"_id": "cache"},
            {"$set": {"data": {}}}
        )
