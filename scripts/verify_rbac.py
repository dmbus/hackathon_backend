import httpx
import asyncio
import os
import random
import string
from dotenv import load_dotenv
from pymongo import MongoClient

# Load env to get mongo URI
load_dotenv()

BASE_URL = "http://127.0.0.1:8000"

# Direct DB connection to manipulate roles for testing
mongo_uri = f"mongodb+srv://{os.getenv('MONGO_USER')}:{os.getenv('MONGO_PASSWORD')}@{os.getenv('MONGO_ADDRESS')}/?appName={os.getenv('MONGO_CLUSTER')}"
client = MongoClient(mongo_uri)
db = client.get_database("hackaton")
users_collection = db["users"]

def generate_random_email():
    domain = "example.com"
    username = ''.join(random.choice(string.ascii_lowercase) for _ in range(10))
    return f"{username}@{domain}"

async def verify_rbac():
    async with httpx.AsyncClient() as client:
        # 1. Register a new user (default: student_free)
        email = generate_random_email()
        password = "Password123!"
        print(f"Registering user: {email}")
        
        resp = await client.post(f"{BASE_URL}/auth/register", json={
            "email": email, 
            "password": password
        })
        
        if resp.status_code != 201:
            print(f"Registration failed: {resp.text}")
            return
            
        data = resp.json()
        id_token = data.get("idToken")
        local_id = data.get("localId")
        print(f"Registered. ID: {local_id}")

        auth_headers = {"Authorization": f"Bearer {id_token}"}

        # 2. Test Default Role (student_free)
        print("\n--- Testing STUDENT_FREE Role ---")
        
        # Try accessing restricted Word endpoint (Admin/Teacher only)
        resp = await client.post(f"{BASE_URL}/words/", headers=auth_headers)
        if resp.status_code == 403:
            print(f"SUCCESS: POST /words/ denied for student_free ({resp.status_code})")
        else:
            print(f"FAILURE: POST /words/ status {resp.status_code} (expected 403)")

        # Try accessing restricted Podcast endpoint (Premium/Admin only)
        resp = await client.get(f"{BASE_URL}/podcasts/123", headers=auth_headers)
        if resp.status_code == 403:
            print(f"SUCCESS: GET /podcasts/ denied for student_free ({resp.status_code})")
        else:
            print(f"FAILURE: GET /podcasts/ status {resp.status_code} (expected 403)")

        # 3. Elevate to TEACHER
        print("\n--- Elevating to TEACHER ---")
        users_collection.update_one({"_id": local_id}, {"$set": {"role": "teacher"}})
        
        # Try accessing restricted Word endpoint (Admin/Teacher only)
        resp = await client.post(f"{BASE_URL}/words/", headers=auth_headers)
        if resp.status_code == 200:
            print(f"SUCCESS: POST /words/ allowed for teacher ({resp.status_code})")
        else:
            print(f"FAILURE: POST /words/ status {resp.status_code} (expected 200)")
            
        # Try accessing restricted Podcast endpoint (Premium/Admin only)
        resp = await client.get(f"{BASE_URL}/podcasts/123", headers=auth_headers)
        if resp.status_code == 403:
            print(f"SUCCESS: GET /podcasts/ denied for teacher ({resp.status_code})")
        else:
            print(f"FAILURE: GET /podcasts/ status {resp.status_code} (expected 403)")

        # 4. Elevate to STUDENT_PREMIUM
        print("\n--- Elevating to STUDENT_PREMIUM ---")
        users_collection.update_one({"_id": local_id}, {"$set": {"role": "student_premium"}})
        
        # Try accessing restricted Podcast endpoint (Premium/Admin only)
        resp = await client.get(f"{BASE_URL}/podcasts/123", headers=auth_headers)
        if resp.status_code == 200:
            print(f"SUCCESS: GET /podcasts/ allowed for student_premium ({resp.status_code})")
        else:
            print(f"FAILURE: GET /podcasts/ status {resp.status_code} (expected 200)")

        # 5. Elevate to ADMIN
        print("\n--- Elevating to ADMIN ---")
        users_collection.update_one({"_id": local_id}, {"$set": {"role": "admin"}})
        
        # Try accessing restricted Podcast endpoint (Premium/Admin only)
        resp = await client.get(f"{BASE_URL}/podcasts/123", headers=auth_headers)
        if resp.status_code == 200:
            print(f"SUCCESS: GET /podcasts/ allowed for admin ({resp.status_code})")
        else:
            print(f"FAILURE: GET /podcasts/ status {resp.status_code} (expected 200)")

if __name__ == "__main__":
    asyncio.run(verify_rbac())
