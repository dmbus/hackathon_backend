from fastapi import APIRouter, Depends
from app.dependencies import RoleChecker
from app.core.security import UserRole
from app.db.mongodb import get_database
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List

router = APIRouter()

@router.get("/")
async def get_word_decks(db: AsyncIOMotorDatabase = Depends(get_database)):
    # Aggregate words by cerf_level to create "decks"
    pipeline = [
        {
            "$group": {
                "_id": "$cerf_level",
                "wordCount": {"$sum": 1}
            }
        },
        {"$sort": {"_id": 1}}
    ]

    cursor = db["words"].aggregate(pipeline)
    decks = []
    async for doc in cursor:
        level = doc["_id"]
        # Skip if level is null or empty
        if not level:
            continue
            
        # Determine theme mapping based on level
        theme = "slate"
        if level.startswith("A"):
            theme = "indigo"
        elif level.startswith("B"):
            theme = "blue"
        elif level.startswith("C"):
            theme = "rose"

        decks.append({
            "id": level,  # Use level as ID
            "title": f"Level {level}",
            "description": f"Common words for CEFR level {level}.",
            "level": level,
            "category": "General", 
            "wordCount": doc["wordCount"],
            "progress": 0, 
            "theme": theme,
            "isCustom": False,
            "icon": "Coffee" # Default icon, handled in frontend if string
        })
    
    return decks

@router.get("/{level}")
async def get_words_by_level(level: str, db: AsyncIOMotorDatabase = Depends(get_database)):
    cursor = db["words"].find({"cerf_level": level})
    words = []
    async for doc in cursor:
        # Try to find English translation first
        translation = ""
        translations = doc.get("translations", [])
        for t in translations:
            if t.get("language_code") == "en":
                translation = t.get("content", "")
                break
        if not translation and translations:
            translation = translations[0].get("content", "")

        words.append({
            "id": str(doc["_id"]),
            "original": doc.get("word", ""),
            "translation": translation,
            "pronunciation": doc.get("ipa_transcription", "").replace("/", ""), 
            "level": 0 
        })
    return words

@router.post("/", dependencies=[Depends(RoleChecker([UserRole.ADMIN, UserRole.TEACHER]))])
async def create_word_entry():
    return {"message": "Word created successfully"}
