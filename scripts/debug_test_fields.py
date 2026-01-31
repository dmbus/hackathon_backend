#!/usr/bin/env python3
"""Debug script to check the test fields in the words collection."""

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

DB_NAME = "hackathon"
COLLECTION_NAME = "words"


async def check_test_fields():
    print("Connecting to MongoDB...")
    client = AsyncIOMotorClient(MONGO_URI)
    db = client[DB_NAME]
    collection = db[COLLECTION_NAME]
    
    try:
        await client.admin.command('ping')
        print("Successfully connected to MongoDB!\n")
    except Exception as e:
        print(f"Error connecting: {e}")
        return
    
    # Get total count
    total_count = await collection.count_documents({})
    print(f"Total documents in '{COLLECTION_NAME}' collection: {total_count}\n")
    
    # Get a sample document
    sample = await collection.find_one()
    if sample:
        print("Sample document fields:")
        for key in sample.keys():
            value = sample[key]
            value_type = type(value).__name__
            if isinstance(value, list):
                print(f"  - {key}: {value_type} (length: {len(value)})")
            elif isinstance(value, dict):
                print(f"  - {key}: {value_type} (keys: {list(value.keys())})")
            else:
                print(f"  - {key}: {value_type}")
        print()
    
    # Check for test-related fields
    print("Checking for test-related fields...")
    
    # Check 'tests' field
    count_tests = await collection.count_documents({"tests": {"$exists": True}})
    count_tests_array = await collection.count_documents({"tests": {"$type": "array"}})
    count_tests_nonempty = await collection.count_documents({"tests": {"$exists": True, "$ne": [], "$type": "array"}})
    print(f"  'tests' field exists: {count_tests} documents")
    print(f"  'tests' is array: {count_tests_array} documents")
    print(f"  'tests' is non-empty array: {count_tests_nonempty} documents")
    
    # Check 'test' field
    count_test = await collection.count_documents({"test": {"$exists": True}})
    count_test_array = await collection.count_documents({"test": {"$type": "array"}})
    count_test_nonempty = await collection.count_documents({"test": {"$exists": True, "$ne": [], "$type": "array"}})
    print(f"  'test' field exists: {count_test} documents")
    print(f"  'test' is array: {count_test_array} documents")
    print(f"  'test' is non-empty array: {count_test_nonempty} documents")
    
    print()
    
    # If tests field exists, show sample
    if count_tests_nonempty > 0:
        doc_with_tests = await collection.find_one({"tests": {"$exists": True, "$ne": [], "$type": "array"}})
        if doc_with_tests:
            print("Sample document with 'tests' field:")
            print(f"  Word: {doc_with_tests.get('word')}")
            print(f"  CEFR Level: {doc_with_tests.get('cerf_level')}")
            tests = doc_with_tests.get('tests', [])
            print(f"  Number of tests: {len(tests)}")
            if tests:
                print(f"  First test structure: {list(tests[0].keys()) if isinstance(tests[0], dict) else type(tests[0])}")
                print(f"  First test content: {tests[0]}")
    
    # If test field exists, show sample
    if count_test_nonempty > 0:
        doc_with_test = await collection.find_one({"test": {"$exists": True, "$ne": [], "$type": "array"}})
        if doc_with_test:
            print("Sample document with 'test' field:")
            print(f"  Word: {doc_with_test.get('word')}")
            print(f"  CEFR Level: {doc_with_test.get('cerf_level')}")
            tests = doc_with_test.get('test', [])
            print(f"  Number of tests: {len(tests)}")
            if tests:
                print(f"  First test structure: {list(tests[0].keys()) if isinstance(tests[0], dict) else type(tests[0])}")
                print(f"  First test content: {tests[0]}")
    
    # Check by CEFR level
    print("\nDocuments by CEFR level:")
    pipeline = [
        {"$group": {"_id": "$cerf_level", "count": {"$sum": 1}}},
        {"$sort": {"_id": 1}}
    ]
    async for doc in collection.aggregate(pipeline):
        print(f"  {doc['_id']}: {doc['count']} words")
    
    client.close()
    print("\nDone!")


if __name__ == "__main__":
    asyncio.run(check_test_fields())
