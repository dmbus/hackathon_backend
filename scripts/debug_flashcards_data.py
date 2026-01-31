import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings

async def check_words():
    uri = f"mongodb+srv://{settings.MONGO_USER}:{settings.MONGO_PASSWORD}@{settings.MONGO_ADDRESS}/?appName={settings.MONGO_CLUSTER}"
    print(f"Connecting to: {uri.split('@')[1]}") # Log safe part of URI
    client = AsyncIOMotorClient(uri)
    db = client.get_database("hackathon")
    
    count = await db["words"].count_documents({"cerf_level": "A1"})
    print(f"Words in A1: {count}")
    
    if count > 0:
        sample = await db["words"].find_one({"cerf_level": "A1"})
        print("Sample word ID:", sample["_id"])
        print("Sample word:", sample.get("word"))

if __name__ == "__main__":
    asyncio.run(check_words())
