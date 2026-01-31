from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings

class MongoDB:
    client: AsyncIOMotorClient = None

db = MongoDB()

async def get_database():
    if db.client is None:
        uri = f"mongodb+srv://{settings.MONGO_USER}:{settings.MONGO_PASSWORD}@{settings.MONGO_ADDRESS}/?appName={settings.MONGO_CLUSTER}"
        db.client = AsyncIOMotorClient(uri)
    return db.client.get_database("hackathon")

async def close_mongo_connection():
    if db.client:
        db.client.close()
