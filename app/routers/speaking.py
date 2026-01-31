"""Speaking practice endpoints for language learning."""

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime
from typing import List
import json
import logging

from app.db.mongodb import get_database
from app.dependencies import get_current_user
from app.models.user import UserInDB
from app.models.speaking import (
    TargetWord,
    SpeakingQuestion,
    AudioMetadata,
    PracticeSessionResponse,
    SpeakingSessionResponse,
    SpeakingHistoryItem,
    SpeakingHistoryResponse,
    SpeakingQuestionResponse,
)
from app.services.speaking_service import speaking_service

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/questions/random", response_model=SpeakingQuestionResponse)
async def get_random_question(
    user: UserInDB = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
    theme: str = None,
    level: str = None
):
    """
    Get a random speaking question from the database.
    
    Optionally filter by theme (e.g., 'Introduction', 'Hobbies') and/or level (A1, A2, B1, etc.).
    """
    try:
        pipeline = []
        match_conditions = {}
        
        # Add filters if provided
        if theme:
            match_conditions["theme"] = theme
        if level:
            match_conditions["level"] = level.upper()
        
        if match_conditions:
            pipeline.append({"$match": match_conditions})
        
        # Get random question
        pipeline.append({"$sample": {"size": 1}})
        
        cursor = db["speaking_questions"].aggregate(pipeline)
        question = None
        
        async for doc in cursor:
            question = doc
            break
        
        if not question:
            raise HTTPException(
                status_code=404,
                detail="No speaking questions found in database"
            )
        
        return SpeakingQuestionResponse(
            id=question["id"],
            level=question.get("level", "A1"),
            theme=question["theme"],
            question=question["question"],
            question_en=question["question_en"],
            target_words=question["target_words"]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to fetch random question: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch random question")


@router.get("/questions/themes", response_model=List[str])
async def get_available_themes(
    user: UserInDB = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
    level: str = None
):
    """
    Get a list of all available question themes.
    Optionally filter by level (A1, A2, B1, etc.).
    """
    try:
        if level:
            # Get themes for a specific level
            pipeline = [
                {"$match": {"level": level.upper()}},
                {"$group": {"_id": "$theme"}},
                {"$sort": {"_id": 1}}
            ]
            cursor = db["speaking_questions"].aggregate(pipeline)
            themes = [doc["_id"] async for doc in cursor]
        else:
            themes = await db["speaking_questions"].distinct("theme")
        return sorted(themes)
    except Exception as e:
        logger.error(f"Failed to fetch themes: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch themes")


@router.get("/questions/levels", response_model=List[str])
async def get_available_levels(
    user: UserInDB = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Get a list of all available CEFR levels.
    """
    try:
        levels = await db["speaking_questions"].distinct("level")
        # Sort by CEFR order
        cefr_order = ["A1", "A2", "B1", "B2", "C1", "C2"]
        return [l for l in cefr_order if l in levels]
    except Exception as e:
        logger.error(f"Failed to fetch levels: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch levels")


@router.get("/practice", response_model=PracticeSessionResponse)
async def get_practice_session(
    user: UserInDB = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
    theme: str = None,
    level: str = None
):
    """
    Initialize a speaking practice session.
    
    Uses a random question from the database with predefined target words.
    Optionally filter questions by theme and/or level.
    """
    try:
        # First, try to get a question from the database
        pipeline = []
        match_conditions = {}
        if theme:
            match_conditions["theme"] = theme
        if level:
            match_conditions["level"] = level.upper()
        if match_conditions:
            pipeline.append({"$match": match_conditions})
        pipeline.append({"$sample": {"size": 1}})
        
        cursor = db["speaking_questions"].aggregate(pipeline)
        db_question = None
        
        async for doc in cursor:
            db_question = doc
            break
        
        if db_question:
            # Use the question from the database
            question_text = db_question["question"]
            question_text_en = db_question.get("question_en", "")
            question_theme = db_question.get("theme", "")
            question_level = db_question.get("level", "A1")
            target_words_data = db_question.get("target_words", [])
            
            # Create target words from the question data
            # Target words are stored as objects with "word" and "translation"
            words = []
            for tw in target_words_data:
                if isinstance(tw, dict):
                    # New format: {"word": "Name", "translation": "name"}
                    words.append(TargetWord(
                        wordId="",  # No wordId needed since words come from question
                        word=tw.get("word", ""),
                        translation=tw.get("translation", "")
                    ))
                else:
                    # Old format: just a string - fallback for backwards compatibility
                    words.append(TargetWord(
                        wordId="",
                        word=str(tw),
                        translation=""
                    ))
            
            return PracticeSessionResponse(
                question=SpeakingQuestion(
                    text=question_text,
                    text_en=question_text_en,
                    theme=question_theme,
                    level=question_level
                ),
                targetWords=words,
                maxDuration=60
            )
        
        # Fallback: Fetch random words and generate a question if no questions in DB
        logger.warning("No questions in database, falling back to word-based generation")
        
        word_pipeline = [
            {"$sample": {"size": 5}},
            {"$limit": 5}
        ]
        
        cursor = db["words"].aggregate(word_pipeline)
        words = []
        word_dicts = []
        
        async for doc in cursor:
            translation = ""
            translations = doc.get("translations", [])
            for t in translations:
                if t.get("language_code") == "en":
                    translation = t.get("content", "")
                    break
            if not translation and translations:
                translation = translations[0].get("content", "")
            
            word_text = doc.get("word", "")
            words.append(TargetWord(
                wordId=str(doc["_id"]),
                word=word_text,
                translation=translation
            ))
            word_dicts.append({
                "word": word_text,
                "translation": translation
            })
        
        if len(words) < 3:
            raise HTTPException(
                status_code=500,
                detail="Not enough words in database for practice session"
            )
        
        # Generate a contextual question based on the words
        try:
            question_text = speaking_service.generate_question(word_dicts)
        except Exception as e:
            logger.error(f"Failed to generate question: {e}")
            question_text = "Beschreiben Sie einen typischen Tag in Ihrem Leben und verwenden Sie dabei die angegebenen Wörter."
        
        return PracticeSessionResponse(
            question=SpeakingQuestion(text=question_text),
            targetWords=words,
            maxDuration=60
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to create practice session: {e}")
        raise HTTPException(status_code=500, detail="Failed to create practice session")


@router.post("/analyze", response_model=SpeakingSessionResponse)
async def analyze_speaking(
    audio: UploadFile = File(..., description="Audio file (MP3, WAV, or WebM)"),
    questionText: str = Form(..., description="The question that was asked"),
    targetWords: str = Form(..., description="JSON array of target words"),
    user: UserInDB = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Process and analyze a speaking practice submission.
    
    1. Validates audio duration (max 60 seconds)
    2. Uploads audio to Hetzner S3
    3. Transcribes audio using ElevenLabs
    4. Analyzes response using OpenAI
    5. Saves session to MongoDB
    """
    try:
        # Parse target words from JSON
        try:
            target_words_data = json.loads(targetWords)
            target_words = [
                TargetWord(
                    wordId=w.get("wordId", ""),
                    word=w.get("word", ""),
                    translation=w.get("translation", "")
                )
                for w in target_words_data
            ]
        except json.JSONDecodeError:
            raise HTTPException(status_code=400, detail="Invalid targetWords JSON format")
        
        # Read audio file
        audio_bytes = await audio.read()
        if not audio_bytes:
            raise HTTPException(status_code=400, detail="Empty audio file")
        
        # Validate audio duration (max 60 seconds)
        try:
            duration_seconds = speaking_service.validate_audio_duration(audio_bytes)
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))
        
        # Upload audio to S3
        try:
            hetzner_path, bucket_url = speaking_service.upload_audio_to_s3(audio_bytes)
        except ValueError as e:
            raise HTTPException(status_code=500, detail=str(e))
        
        # Transcribe audio
        try:
            transcription = speaking_service.transcribe_audio(audio_bytes)
        except ValueError as e:
            raise HTTPException(status_code=500, detail=str(e))
        
        # Analyze speaking
        try:
            analysis = speaking_service.analyze_speaking(
                transcription=transcription,
                question=questionText,
                target_words=target_words
            )
        except Exception as e:
            logger.error(f"Analysis failed: {e}")
            raise HTTPException(status_code=500, detail="Failed to analyze speaking response")
        
        # Create audio metadata
        audio_metadata = AudioMetadata(
            hetznerPath=hetzner_path,
            bucketUrl=bucket_url,
            durationSeconds=duration_seconds,
            sizeBytes=len(audio_bytes)
        )
        
        # Save to MongoDB
        session_doc = {
            "userId": user.id,
            "createdAt": datetime.utcnow(),
            "question": {
                "text": questionText,
                "audioUrl": None
            },
            "targetWords": [w.model_dump() for w in target_words],
            "audio": audio_metadata.model_dump(),
            "analysis": analysis.model_dump()
        }
        
        result = await db["speaking_sessions"].insert_one(session_doc)
        session_id = str(result.inserted_id)
        
        logger.info(f"Speaking session created: {session_id} for user {user.id}")
        
        return SpeakingSessionResponse(
            id=session_id,
            createdAt=session_doc["createdAt"],
            question=SpeakingQuestion(text=questionText),
            targetWords=target_words,
            audio=audio_metadata,
            analysis=analysis
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to process speaking submission: {e}")
        raise HTTPException(status_code=500, detail="Failed to process speaking submission")


@router.get("/history", response_model=SpeakingHistoryResponse)
async def get_speaking_history(
    user: UserInDB = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
    skip: int = 0,
    limit: int = 20
):
    """
    Get the user's speaking practice history.
    
    Returns a paginated list of past sessions sorted by date (newest first).
    """
    try:
        # Count total sessions for this user
        total = await db["speaking_sessions"].count_documents({"userId": user.id})
        
        # Fetch sessions sorted by createdAt descending
        cursor = db["speaking_sessions"].find(
            {"userId": user.id}
        ).sort("createdAt", -1).skip(skip).limit(limit)
        
        sessions = []
        async for doc in cursor:
            # Count words used correctly
            word_usage = doc.get("analysis", {}).get("wordUsage", [])
            words_used_correctly = sum(1 for w in word_usage if w.get("isUsedCorrectly", False))
            
            sessions.append(SpeakingHistoryItem(
                id=str(doc["_id"]),
                createdAt=doc.get("createdAt", datetime.utcnow()),
                questionText=doc.get("question", {}).get("text", ""),
                score=doc.get("analysis", {}).get("score", 0),
                cefrLevel=doc.get("analysis", {}).get("cefrLevel", "A1"),
                targetWordsCount=len(doc.get("targetWords", [])),
                wordsUsedCorrectly=words_used_correctly
            ))
        
        return SpeakingHistoryResponse(
            sessions=sessions,
            total=total
        )
        
    except Exception as e:
        logger.error(f"Failed to fetch speaking history: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch speaking history")


@router.get("/session/{session_id}", response_model=SpeakingSessionResponse)
async def get_speaking_session(
    session_id: str,
    user: UserInDB = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Get details of a specific speaking session.
    """
    from bson import ObjectId
    
    try:
        doc = await db["speaking_sessions"].find_one({
            "_id": ObjectId(session_id),
            "userId": user.id
        })
        
        if not doc:
            raise HTTPException(status_code=404, detail="Session not found")
        
        return SpeakingSessionResponse(
            id=str(doc["_id"]),
            createdAt=doc.get("createdAt", datetime.utcnow()),
            question=SpeakingQuestion(
                text=doc.get("question", {}).get("text", ""),
                audioUrl=doc.get("question", {}).get("audioUrl")
            ),
            targetWords=[
                TargetWord(**w) for w in doc.get("targetWords", [])
            ],
            audio=AudioMetadata(**doc.get("audio", {})),
            analysis=doc.get("analysis", {})
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to fetch session {session_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch session")
