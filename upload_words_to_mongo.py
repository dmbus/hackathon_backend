
import os
import json
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import urllib.parse

# Load environment variables
load_dotenv()

MONGO_USER = os.getenv("MONGO_USER")
MONGO_PASSWORD = os.getenv("MONGO_PASSWORD")
MONGO_ADDRESS = os.getenv("MONGO_ADDRESS")
MONGO_CLUSTER = os.getenv("MONGO_CLUSTER")

# Escape username and password
escaped_username = urllib.parse.quote_plus(MONGO_USER)
escaped_password = urllib.parse.quote_plus(MONGO_PASSWORD)

# Construct connection string
MONGO_URI = f"mongodb+srv://{escaped_username}:{escaped_password}@{MONGO_ADDRESS}/?appName={MONGO_CLUSTER}"

UPLOAD_DIR = "upload_words"
DB_NAME = "hackathon" # Using a generic name, or could be 'sprache' based on project
COLLECTION_NAME = "words"

async def upload_files():
    client = AsyncIOMotorClient(MONGO_URI)
    db = client[DB_NAME]
    collection = db[COLLECTION_NAME]
    
    # Check connection
    try:
        await client.admin.command('ping')
        print("Pinged your deployment. You successfully connected to MongoDB!")
    except Exception as e:
        print(f"Error connecting to MongoDB: {e}")
        return

    files = [f for f in os.listdir(UPLOAD_DIR) if f.endswith('.json')]
    print(f"Found {len(files)} JSON files to upload.")
    
    count = 0
    batch_size = 100
    batch = []

    for filename in files:
        filepath = os.path.join(UPLOAD_DIR, filename)
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                data = json.load(f)
                # Ensure data is a dictionary (document)
                if isinstance(data, dict):
                   # Add filename as source metadata if needed, or just upload as is
                   # data['source_file'] = filename 
                   batch.append(data)
                elif isinstance(data, list):
                   batch.extend(data)
                
                if len(batch) >= batch_size:
                    await collection.insert_many(batch)
                    count += len(batch)
                    print(f"Uploaded {count} documents...")
                    batch = []

        except Exception as e:
            print(f"Error processing {filename}: {e}")

    if batch:
        await collection.insert_many(batch)
        count += len(batch)

    print(f"Finished. Total documents uploaded: {count}")
    client.close()

if __name__ == "__main__":
    asyncio.run(upload_files())
