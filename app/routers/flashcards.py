from fastapi import APIRouter, Depends, Header
from typing import Optional
from app.dependencies import get_current_user
from app.db.mongodb import get_database
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.models.user import UserInDB
from app.services.firebase_auth import get_user_by_token
from pydantic import BaseModel
from bson import ObjectId
import random

router = APIRouter()

class FlashcardProgressUpdate(BaseModel):
    current_index: int

async def get_optional_user(
    authorization: Optional[str] = Header(None),
    db: AsyncIOMotorDatabase = Depends(get_database)
) -> Optional[UserInDB]:
    """Get user if authenticated, otherwise return None for anonymous access."""
    if not authorization or not authorization.startswith("Bearer "):
        return None
    try:
        token = authorization.split(" ")[1]
        firebase_user = await get_user_by_token(token)
        user_id = firebase_user["localId"]
        user_doc = await db["user"].find_one({"_id": user_id})
        if not user_doc:
            return None
        return UserInDB(
            id=user_doc["_id"],
            email=user_doc["email"],
            role=user_doc.get("role", "student_free"),
            permissions=user_doc.get("permissions", []),
            created_at=user_doc.get("created_at")
        )
    except Exception:
        return None

@router.get("/{level}/session")
async def get_flashcard_session(
    level: str,
    user: Optional[UserInDB] = Depends(get_optional_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    # For anonymous users, just return random words without session tracking
    if not user:
        cursor = db["words"].find({"cerf_level": level})
        all_words = await cursor.to_list(length=None)

        if not all_words:
            return {
                "sessionId": None,
                "words": [],
                "currentIndex": 0,
                "totalWords": 0
            }

        selected_words = random.sample(all_words, min(len(all_words), 30))
        formatted_words = []
        for doc in selected_words:
            translation = ""
            translations = doc.get("translations", [])
            for t in translations:
                if t.get("language_code") == "en":
                    translation = t.get("content", "")
                    break
            if not translation and translations:
                translation = translations[0].get("content", "")

            def get_audio_filename(url: str) -> str:
                if not url:
                    return ""
                filename = url.split("/")[-1] if "/" in url else url
                return f"/audio/{filename}"

            audio = doc.get("audio", {})

            formatted_words.append({
                "id": str(doc["_id"]),
                "targetWord": doc.get("word", ""),
                "translation": translation,
                "phonetic": doc.get("ipa_transcription", "").replace("/", ""),
                "language": "de-DE",
                "audioMale": get_audio_filename(audio.get("male", "")),
                "audioFemale": get_audio_filename(audio.get("female", "")),
            })

        return {
            "sessionId": None,
            "words": formatted_words,
            "currentIndex": 0,
            "totalWords": len(formatted_words)
        }

    # 1. Check if an active session exists for this user and level
    session = await db["flashcard_sessions"].find_one({
        "user_id": user.id,
        "level": level,
        "is_active": True
    })

    if session:
        # Return existing session
        # We need to fetch the full word details for the word_ids in the session
        word_ids = session["word_ids"]
        # Convert string IDs back to ObjectId if necessary, though word_ids in session probably stored as strings or ObjectIds
        # Assuming stored as strings for simplicity in JSON
        object_ids = [ObjectId(wid) for wid in word_ids]
        
        cursor = db["words"].find({"_id": {"$in": object_ids}})
        words_data = []
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
            
            # Helper to format audio path
            def get_audio_filename(url: str) -> str:
                if not url:
                    return ""
                filename = url.split("/")[-1] if "/" in url else url
                return f"/audio/{filename}"

            audio = doc.get("audio", {})

            words_data.append({
                "id": str(doc["_id"]),
                "targetWord": doc.get("word", ""),
                "translation": translation,
                "phonetic": doc.get("ipa_transcription", "").replace("/", ""),
                "language": "fr-FR", # Hardcoded for now based on template, or derive from doc
                "audioMale": get_audio_filename(audio.get("male", "")),
                "audioFemale": get_audio_filename(audio.get("female", "")),
            })
        
        # Sort words_data to match the order in word_ids (optional but good for consistency if order matters)
        # For random flashcards, order in `word_ids` might be the specific random order
        words_map = {w["id"]: w for w in words_data}
        ordered_words = [words_map[wid] for wid in word_ids if wid in words_map]

        return {
            "sessionId": str(session["_id"]),
            "words": ordered_words,
            "currentIndex": session.get("current_index", 0),
            "totalWords": len(ordered_words)
        }

    # 2. If no session, create a new one
    # Fetch all words for the level
    cursor = db["words"].find({"cerf_level": level})
    all_words = await cursor.to_list(length=None)
    
    if not all_words:
        # If no words found for this level
         return {
            "sessionId": None,
            "words": [],
            "currentIndex": 0,
            "totalWords": 0
        }

    # Select random 30 words (or less if not enough words)
    selected_words = random.sample(all_words, min(len(all_words), 30))
    selected_word_ids = [str(w["_id"]) for w in selected_words]

    new_session = {
        "user_id": user.id,
        "level": level,
        "word_ids": selected_word_ids,
        "current_index": 0,
        "is_active": True,
        # created_at...
    }
    
    result = await db["flashcard_sessions"].insert_one(new_session)
    
    # Format words for frontend
    formatted_words = []
    for doc in selected_words:
        translation = ""
        translations = doc.get("translations", [])
        for t in translations:
            if t.get("language_code") == "en":
                translation = t.get("content", "")
                break
        if not translation and translations:
            translation = translations[0].get("content", "")

        def get_audio_filename(url: str) -> str:
            if not url:
                return ""
            filename = url.split("/")[-1] if "/" in url else url
            return f"/audio/{filename}"
        
        audio = doc.get("audio", {})

        formatted_words.append({
            "id": str(doc["_id"]),
            "targetWord": doc.get("word", ""),
            "translation": translation,
            "phonetic": doc.get("ipa_transcription", "").replace("/", ""),
            "language": "fr-FR", 
            "audioMale": get_audio_filename(audio.get("male", "")),
            "audioFemale": get_audio_filename(audio.get("female", "")),
        })

    return {
        "sessionId": str(result.inserted_id),
        "words": formatted_words,
        "currentIndex": 0,
        "totalWords": len(formatted_words)
    }

@router.post("/{level}/progress")
async def update_flashcard_progress(
    level: str,
    progress: FlashcardProgressUpdate,
    user: Optional[UserInDB] = Depends(get_optional_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    # Anonymous users can't save progress
    if not user:
        return {"status": "success", "note": "anonymous"}

    # Update the active session for this user and level
    await db["flashcard_sessions"].update_one(
        {
            "user_id": user.id,
            "level": level,
            "is_active": True
        },
        {"$set": {"current_index": progress.current_index}}
    )
    return {"status": "success"}

@router.post("/{level}/reset")
async def reset_flashcard_session(
    level: str,
    user: Optional[UserInDB] = Depends(get_optional_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    # Anonymous users don't have sessions to reset
    if not user:
        return {"status": "success", "note": "anonymous"}

    # Deactivate current session so next fetch creates a new one
    await db["flashcard_sessions"].update_many(
        {
            "user_id": user.id,
            "level": level,
            "is_active": True
        },
        {"$set": {"is_active": False}}
    )
    return {"status": "success"}
