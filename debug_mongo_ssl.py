
import os
import pymongo
import certifi
from dotenv import load_dotenv
import urllib.parse
import sys

# Load environment variables
load_dotenv()

MONGO_USER = os.getenv("MONGO_USER")
MONGO_PASSWORD = os.getenv("MONGO_PASSWORD")
MONGO_ADDRESS = os.getenv("MONGO_ADDRESS")
MONGO_CLUSTER = os.getenv("MONGO_CLUSTER")

if not MONGO_USER or not MONGO_PASSWORD or not MONGO_ADDRESS:
    print("Error: Missing environment variables.")
    sys.exit(1)

# Escape username and password
escaped_username = urllib.parse.quote_plus(MONGO_USER)
escaped_password = urllib.parse.quote_plus(MONGO_PASSWORD)

# Construct connection string
MONGO_URI = f"mongodb+srv://{escaped_username}:{escaped_password}@{MONGO_ADDRESS}/?appName={MONGO_CLUSTER}"

OUTPUT_FILE = "mongo_debug_ssl.txt"

def test_connection():
    results = []
    results.append(f"Testing connection to: {MONGO_ADDRESS}")
    
    # Try with certifi
    try:
        results.append("Attempting connection WITH certifi...")
        client = pymongo.MongoClient(MONGO_URI, tlsCAFile=certifi.where(), serverSelectionTimeoutMS=5000)
        client.admin.command('ping')
        results.append("SUCCESS: Connected with certifi!")
        dbs = client.list_database_names()
        results.append(f"Databases: {dbs}")
        client.close()
    except Exception as e:
        results.append(f"FAILURE with certifi: {e}")

    results.append("-" * 20)

    # Try WITHOUT certifi (default)
    try:
        results.append("Attempting connection WITHOUT certifi (default)...")
        client = pymongo.MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
        client.admin.command('ping')
        results.append("SUCCESS: Connected without certifi!")
        client.close()
    except Exception as e:
        results.append(f"FAILURE without certifi: {e}")
        
    results.append("-" * 20)
    
    # Try with tlsAllowInvalidCertificates (insecure fallback check)
    try:
        results.append("Attempting connection with tlsAllowInvalidCertificates=True...")
        client = pymongo.MongoClient(MONGO_URI, tlsAllowInvalidCertificates=True, serverSelectionTimeoutMS=5000)
        client.admin.command('ping')
        results.append("SUCCESS: Connected with invalid certs allowed!")
        client.close()
    except Exception as e:
        results.append(f"FAILURE with invalid certs allowed: {e}")

    with open(OUTPUT_FILE, "w") as f:
        f.write("\n".join(results))
    
    print("Debug complete. Check mongo_debug_ssl.txt")

if __name__ == "__main__":
    test_connection()
