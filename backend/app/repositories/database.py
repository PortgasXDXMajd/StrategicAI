import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os

MONGO_CONNECTION = os.getenv("MONGO_CONNECTION")

class Mongo:
    client: AsyncIOMotorClient = None

    @classmethod
    async def connect_db(cls):
        if cls.client is None:
            cls.client = AsyncIOMotorClient(
                MONGO_CONNECTION,
                maxPoolSize=10,
                minPoolSize=1,
                serverSelectionTimeoutMS=5000
            )
            cls.client.get_io_loop = asyncio.get_event_loop

    @classmethod
    def get_db(cls):
        if cls.client is None:
            cls.client = AsyncIOMotorClient(
                MONGO_CONNECTION,
                maxPoolSize=10,
                minPoolSize=1,
                serverSelectionTimeoutMS=5000
            )
            cls.client.get_io_loop = asyncio.get_event_loop
        
        return cls.client["strategic-ai-db"]
