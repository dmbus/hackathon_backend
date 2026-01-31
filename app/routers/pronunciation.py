"""Pronunciation practice endpoints for German language learning."""

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime
from typing import List, Optional
from bson import ObjectId
import logging

from app.db.mongodb import get_database
from app.dependencies import get_current_user, get_optional_user
from app.models.user import UserInDB
from app.models.pronunciation import (
    PronunciationModule,
    PronunciationModuleSummary,
    PronunciationExercise,
    ExerciseDetail,
    PronunciationSessionResponse,
    PronunciationHistoryItem,
    PronunciationStats,
    UserProgress,
    MasteryLevel,
    DifficultyLevel,
)
from app.services.pronunciation_service import pronunciation_service

logger = logging.getLogger(__name__)

router = APIRouter()


async def _get_user_progress(
    db: AsyncIOMotorDatabase,
    user_id: str,
    sound_id: str
) -> Optional[UserProgress]:
    """Fetch user progress for a specific sound module."""
    doc = await db["user_pronunciation_progress"].find_one({
        "userId": user_id,
        "sound_id": sound_id
    })

    if not doc:
        return None

    return UserProgress(
        total_attempts=doc.get("total_attempts", 0),
        average_score=doc.get("average_score", 0.0),
        best_score=doc.get("best_score", 0.0),
        last_practiced=doc.get("last_practiced"),
        mastery_level=MasteryLevel(doc.get("mastery_level", "new"))
    )


async def _update_user_progress(
    db: AsyncIOMotorDatabase,
    user_id: str,
    sound_id: str,
    score: float
):
    """Update user progress after a practice session."""
    existing = await db["user_pronunciation_progress"].find_one({
        "userId": user_id,
        "sound_id": sound_id
    })

    if existing:
        # Update existing progress
        new_total = existing.get("total_attempts", 0) + 1
        old_avg = existing.get("average_score", 0.0)
        new_avg = ((old_avg * (new_total - 1)) + score) / new_total
        new_best = max(existing.get("best_score", 0.0), score)

        # Determine mastery level
        if new_avg >= 85 and new_total >= 5:
            mastery = MasteryLevel.MASTERED.value
        elif new_total >= 1:
            mastery = MasteryLevel.PRACTICING.value
        else:
            mastery = MasteryLevel.NEW.value

        await db["user_pronunciation_progress"].update_one(
            {"_id": existing["_id"]},
            {"$set": {
                "total_attempts": new_total,
                "average_score": round(new_avg, 1),
                "best_score": round(new_best, 1),
                "last_practiced": datetime.utcnow(),
                "mastery_level": mastery
            }}
        )
    else:
        # Create new progress record
        await db["user_pronunciation_progress"].insert_one({
            "userId": user_id,
            "sound_id": sound_id,
            "total_attempts": 1,
            "average_score": round(score, 1),
            "best_score": round(score, 1),
            "last_practiced": datetime.utcnow(),
            "mastery_level": MasteryLevel.PRACTICING.value
        })


@router.get("/modules", response_model=List[PronunciationModuleSummary])
async def get_pronunciation_modules(
    user: Optional[UserInDB] = Depends(get_optional_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
    difficulty: Optional[str] = Query(None, description="Filter by difficulty level")
):
    """
    Get all available pronunciation modules with user progress.

    Returns a list of modules grouped by difficulty level.
    """
    try:
        query = {}
        if difficulty:
            query["difficulty_level"] = difficulty

        cursor = db["pronunciation_modules"].find(query).sort([
            ("difficulty_level", 1),
            ("name", 1)
        ])

        modules = []
        async for doc in cursor:
            # Get user progress if authenticated
            progress = None
            if user:
                progress = await _get_user_progress(db, user.id, doc["sound_id"])

            modules.append(PronunciationModuleSummary(
                id=str(doc["_id"]),
                sound_id=doc["sound_id"],
                phoneme_ipa=doc["phoneme_ipa"],
                name=doc["name"],
                description=doc["description"],
                articulatory_tip=doc["articulatory_tip"],
                difficulty_level=DifficultyLevel(doc.get("difficulty_level", "intermediate")),
                exercises_count=len(doc.get("exercises", [])),
                user_progress=progress
            ))

        return modules

    except Exception as e:
        logger.error(f"Failed to fetch pronunciation modules: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch modules")


@router.get("/modules/{sound_id}", response_model=PronunciationModule)
async def get_pronunciation_module(
    sound_id: str,
    user: Optional[UserInDB] = Depends(get_optional_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Get a specific pronunciation module with all exercises.
    """
    try:
        doc = await db["pronunciation_modules"].find_one({"sound_id": sound_id})

        if not doc:
            raise HTTPException(status_code=404, detail="Module not found")

        # Get user progress if authenticated
        progress = None
        if user:
            progress = await _get_user_progress(db, user.id, sound_id)

        # Convert exercises
        exercises = [
            PronunciationExercise(
                word=ex.get("word", ""),
                ipa=ex.get("ipa", ""),
                sentence=ex.get("sentence", ""),
                audio_url=ex.get("audio_url")
            )
            for ex in doc.get("exercises", [])
        ]

        return PronunciationModule(
            id=str(doc["_id"]),
            sound_id=doc["sound_id"],
            phoneme_ipa=doc["phoneme_ipa"],
            name=doc["name"],
            description=doc["description"],
            articulatory_tip=doc["articulatory_tip"],
            difficulty_level=DifficultyLevel(doc.get("difficulty_level", "intermediate")),
            exercises=exercises,
            exercises_count=len(exercises),
            user_progress=progress
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to fetch module {sound_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch module")


@router.get("/modules/{sound_id}/exercises/{index}", response_model=ExerciseDetail)
async def get_exercise_with_benchmark(
    sound_id: str,
    index: int,
    user: UserInDB = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Get a specific exercise with benchmark audio.

    Generates TTS audio if not already cached.
    """
    try:
        doc = await db["pronunciation_modules"].find_one({"sound_id": sound_id})

        if not doc:
            raise HTTPException(status_code=404, detail="Module not found")

        exercises = doc.get("exercises", [])
        if index < 0 or index >= len(exercises):
            raise HTTPException(status_code=404, detail="Exercise not found")

        exercise = exercises[index]
        audio_url = exercise.get("audio_url")

        # Generate benchmark audio if not cached
        if not audio_url:
            try:
                # Generate audio for the word
                _, audio_url = pronunciation_service.generate_benchmark_audio(exercise["word"])

                # Cache the URL in the database
                await db["pronunciation_modules"].update_one(
                    {"sound_id": sound_id},
                    {"$set": {f"exercises.{index}.audio_url": audio_url}}
                )
                logger.info(f"Generated and cached benchmark audio for {exercise['word']}")
            except Exception as e:
                logger.error(f"Failed to generate benchmark audio: {e}")
                # Continue without audio URL

        # Get user's best score for this exercise
        best_score = None
        best_session = await db["pronunciation_sessions"].find_one(
            {
                "userId": user.id,
                "sound_id": sound_id,
                "exercise_index": index
            },
            sort=[("overall_score", -1)]
        )
        if best_session:
            best_score = best_session.get("overall_score")

        return ExerciseDetail(
            sound_id=sound_id,
            exercise_index=index,
            word=exercise["word"],
            ipa=exercise["ipa"],
            sentence=exercise["sentence"],
            phoneme_ipa=doc["phoneme_ipa"],
            articulatory_tip=doc["articulatory_tip"],
            benchmark_audio_url=audio_url,
            user_best_score=best_score
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to fetch exercise: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch exercise")


@router.post("/analyze", response_model=PronunciationSessionResponse)
async def analyze_pronunciation(
    audio: UploadFile = File(..., description="User's pronunciation recording (MP3, WAV, WebM)"),
    sound_id: str = Form(..., description="Sound module ID"),
    exercise_index: int = Form(..., description="Index of the exercise in the module"),
    user: UserInDB = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Analyze user's pronunciation attempt.

    Flow:
    1. Fetch module and exercise data
    2. Validate and upload user audio to S3
    3. Transcribe audio using ElevenLabs
    4. Compare with target IPA
    5. Generate AI feedback
    6. Save session and update progress
    """
    try:
        # 1. Get the module and exercise
        module_doc = await db["pronunciation_modules"].find_one({"sound_id": sound_id})
        if not module_doc:
            raise HTTPException(status_code=404, detail="Module not found")

        exercises = module_doc.get("exercises", [])
        if exercise_index < 0 or exercise_index >= len(exercises):
            raise HTTPException(status_code=404, detail="Exercise not found")

        exercise = exercises[exercise_index]

        # 2. Read and validate audio
        audio_bytes = await audio.read()
        if not audio_bytes:
            raise HTTPException(status_code=400, detail="Empty audio file")

        # 3. Upload user audio to S3
        try:
            user_audio_path, user_audio_url = pronunciation_service.upload_user_audio(audio_bytes)
        except ValueError as e:
            raise HTTPException(status_code=500, detail=str(e))

        # 4. Ensure benchmark audio exists
        benchmark_url = exercise.get("audio_url")
        if not benchmark_url:
            try:
                _, benchmark_url = pronunciation_service.generate_benchmark_audio(exercise["word"])
                await db["pronunciation_modules"].update_one(
                    {"sound_id": sound_id},
                    {"$set": {f"exercises.{exercise_index}.audio_url": benchmark_url}}
                )
            except Exception as e:
                logger.warning(f"Could not generate benchmark: {e}")

        # 5. Analyze pronunciation
        try:
            analysis = pronunciation_service.analyze_pronunciation(
                audio_bytes=audio_bytes,
                word=exercise["word"],
                sentence=exercise["sentence"],
                target_ipa=exercise["ipa"],
                phoneme_ipa=module_doc["phoneme_ipa"],
                articulatory_tip=module_doc["articulatory_tip"]
            )
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))
        except Exception as e:
            logger.error(f"Analysis failed: {e}")
            raise HTTPException(status_code=500, detail="Failed to analyze pronunciation")

        # 6. Save session to MongoDB
        session_doc = {
            "userId": user.id,
            "createdAt": datetime.utcnow(),
            "sound_id": sound_id,
            "sound_name": module_doc["name"],
            "exercise_index": exercise_index,
            "word": exercise["word"],
            "sentence": exercise["sentence"],
            "target_ipa": exercise["ipa"],
            "user_ipa": analysis.user_ipa,
            "benchmark_audio_url": benchmark_url or "",
            "user_audio_url": user_audio_url,
            "overall_score": analysis.overall_score,
            "phoneme_errors": [e.model_dump() for e in analysis.phoneme_errors],
            "ai_feedback": analysis.ai_feedback,
            "articulatory_tips": analysis.articulatory_tips
        }

        result = await db["pronunciation_sessions"].insert_one(session_doc)
        session_id = str(result.inserted_id)

        # 7. Update user progress
        await _update_user_progress(db, user.id, sound_id, analysis.overall_score)

        logger.info(f"Pronunciation session {session_id}: score={analysis.overall_score}")

        return PronunciationSessionResponse(
            id=session_id,
            created_at=session_doc["createdAt"],
            sound_id=sound_id,
            word=exercise["word"],
            sentence=exercise["sentence"],
            analysis=analysis,
            benchmark_audio_url=benchmark_url or "",
            user_audio_url=user_audio_url
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to process pronunciation: {e}")
        raise HTTPException(status_code=500, detail="Failed to process pronunciation")


@router.get("/history", response_model=List[PronunciationHistoryItem])
async def get_pronunciation_history(
    user: UserInDB = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    sound_id: Optional[str] = Query(None, description="Filter by sound module")
):
    """
    Get user's pronunciation practice history.

    Returns paginated list sorted by date (newest first).
    """
    try:
        query = {"userId": user.id}
        if sound_id:
            query["sound_id"] = sound_id

        cursor = db["pronunciation_sessions"].find(query).sort(
            "createdAt", -1
        ).skip(skip).limit(limit)

        history = []
        async for doc in cursor:
            history.append(PronunciationHistoryItem(
                id=str(doc["_id"]),
                created_at=doc["createdAt"],
                sound_id=doc["sound_id"],
                sound_name=doc.get("sound_name", doc["sound_id"]),
                word=doc["word"],
                score=doc["overall_score"],
                phoneme_errors_count=len(doc.get("phoneme_errors", []))
            ))

        return history

    except Exception as e:
        logger.error(f"Failed to fetch pronunciation history: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch history")


@router.get("/stats", response_model=PronunciationStats)
async def get_pronunciation_stats(
    user: UserInDB = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Get user's overall pronunciation statistics.
    """
    try:
        # Aggregate session stats
        pipeline = [
            {"$match": {"userId": user.id}},
            {"$group": {
                "_id": None,
                "total_sessions": {"$sum": 1},
                "avg_score": {"$avg": "$overall_score"},
                "sound_ids": {"$addToSet": "$sound_id"}
            }}
        ]

        result = await db["pronunciation_sessions"].aggregate(pipeline).to_list(1)

        if not result:
            return PronunciationStats()

        stats = result[0]

        # Get progress per sound
        progress_cursor = db["user_pronunciation_progress"].find({"userId": user.id})
        weak_sounds = []
        strong_sounds = []
        modules_mastered = 0

        async for doc in progress_cursor:
            if doc.get("mastery_level") == MasteryLevel.MASTERED.value:
                strong_sounds.append(doc["sound_id"])
                modules_mastered += 1
            elif doc.get("average_score", 0) < 60:
                weak_sounds.append(doc["sound_id"])

        return PronunciationStats(
            total_sessions=stats.get("total_sessions", 0),
            average_score=round(stats.get("avg_score", 0), 1),
            total_modules_practiced=len(stats.get("sound_ids", [])),
            modules_mastered=modules_mastered,
            weak_sounds=weak_sounds[:5],
            strong_sounds=strong_sounds[:5]
        )

    except Exception as e:
        logger.error(f"Failed to fetch pronunciation stats: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch stats")


@router.get("/recommended", response_model=List[PronunciationModuleSummary])
async def get_recommended_modules(
    user: UserInDB = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
    limit: int = Query(3, ge=1, le=10)
):
    """
    Get recommended modules based on user's weak areas and progress.

    Prioritizes:
    1. Modules with low scores (needs practice)
    2. Unstarted modules (new content)
    3. Modules not practiced recently
    """
    try:
        # Get user's progress per sound
        progress_map = {}
        async for doc in db["user_pronunciation_progress"].find({"userId": user.id}):
            progress_map[doc["sound_id"]] = doc

        # Get all modules
        all_modules = []
        async for doc in db["pronunciation_modules"].find():
            sound_id = doc["sound_id"]
            progress = progress_map.get(sound_id)

            # Calculate priority score (lower = recommend first)
            if not progress:
                priority = 0  # New modules first
            elif progress.get("average_score", 0) < 60:
                priority = 1  # Weak modules
            elif progress.get("mastery_level") != MasteryLevel.MASTERED.value:
                priority = 2  # In progress
            else:
                priority = 3  # Mastered

            user_progress = None
            if progress:
                user_progress = UserProgress(
                    total_attempts=progress.get("total_attempts", 0),
                    average_score=progress.get("average_score", 0.0),
                    best_score=progress.get("best_score", 0.0),
                    last_practiced=progress.get("last_practiced"),
                    mastery_level=MasteryLevel(progress.get("mastery_level", "new"))
                )

            all_modules.append((priority, PronunciationModuleSummary(
                id=str(doc["_id"]),
                sound_id=doc["sound_id"],
                phoneme_ipa=doc["phoneme_ipa"],
                name=doc["name"],
                description=doc["description"],
                articulatory_tip=doc["articulatory_tip"],
                difficulty_level=DifficultyLevel(doc.get("difficulty_level", "intermediate")),
                exercises_count=len(doc.get("exercises", [])),
                user_progress=user_progress
            )))

        # Sort by priority and return top N
        all_modules.sort(key=lambda x: x[0])
        return [m[1] for m in all_modules[:limit]]

    except Exception as e:
        logger.error(f"Failed to get recommendations: {e}")
        raise HTTPException(status_code=500, detail="Failed to get recommendations")


@router.get("/difficulty-levels", response_model=List[str])
async def get_difficulty_levels(
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Get available difficulty levels.
    """
    try:
        levels = await db["pronunciation_modules"].distinct("difficulty_level")
        # Sort by order
        order = ["beginner", "intermediate", "advanced"]
        return [l for l in order if l in levels]
    except Exception as e:
        logger.error(f"Failed to fetch difficulty levels: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch difficulty levels")
