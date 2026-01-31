
import os
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

OUTPUT_FILE = "mongo_verification.txt"

async def verify_databases():
    client = AsyncIOMotorClient(MONGO_URI)
    
    results = []
    
    try:
        # List databases
        dbs = await client.list_database_names()
        results.append(f"Available Databases: {dbs}")
        
        # Check 'words' collection in each DB
        for db_name in dbs:
            db = client[db_name]
            collections = await db.list_collection_names()
            if "words" in collections:
                count = await db["words"].count_documents({})
                results.append(f"Database: '{db_name}' -> Collection: 'words' -> Count: {count}")
            else:
                results.append(f"Database: '{db_name}' -> No 'words' collection found.")
                
        # Also check 'hackathon' specifically if it wasn't in the list (though it should be)
        if "hackathon" not in dbs:
             results.append("Database 'hackathon' not found in list.")

    except Exception as e:
        results.append(f"Error: {e}")
    
    client.close()
    
    with open(OUTPUT_FILE, "w") as f:
        f.write("\n".join(results))
    
    print("Verification complete. Check mongo_verification.txt")

if __name__ == "__main__":
    asyncio.run(verify_databases())
