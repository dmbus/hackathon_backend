from fastapi import APIRouter, Depends, HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from datetime import datetime
from typing import List, Optional

from app.db.mongodb import get_database
from app.dependencies import get_current_user, get_optional_user
from app.models.user import UserInDB
from app.models.test import (
    TestQuestion,
    TestSession,
    TestLevelInfo,
    TestSubmission,
    TestResultResponse,
    TestHistoryItem,
)

router = APIRouter()

QUESTIONS_PER_TEST = 20


@router.get("/levels", response_model=List[TestLevelInfo])
async def get_test_levels(
    db: AsyncIOMotorDatabase = Depends(get_database),
    user: Optional[UserInDB] = Depends(get_optional_user),
):
    """Get available CEFR levels with test question counts and user's best scores."""
    
    # Aggregate words by cerf_level that have tests
    pipeline = [
        {"$match": {"tests": {"$exists": True, "$ne": []}}},
        {"$unwind": "$tests"},
        {
            "$group": {
                "_id": "$cerf_level",
                "question_count": {"$sum": 1}
            }
        },
        {"$sort": {"_id": 1}}
    ]
    
    cursor = db["words"].aggregate(pipeline)
    levels = []
    
    async for doc in cursor:
        level = doc["_id"]
        if not level:
            continue
            
        # Determine theme based on level
        theme = "slate"
        if level.startswith("A"):
            theme = "indigo"
        elif level.startswith("B"):
            theme = "blue"
        elif level.startswith("C"):
            theme = "rose"
        
        level_info = TestLevelInfo(
            level=level,
            question_count=doc["question_count"],
            theme=theme,
        )
        levels.append(level_info)
    
    # If user is authenticated, get their best scores
    if user:
        for level_info in levels:
            # Get best score for this level
            best_result = await db["test_results"].find_one(
                {"userId": user.id, "level": level_info.level},
                sort=[("score", -1)]
            )
            if best_result:
                level_info.best_score = best_result.get("score")
            
            # Count attempts
            attempts = await db["test_results"].count_documents(
                {"userId": user.id, "level": level_info.level}
            )
            level_info.attempts = attempts
    
    return levels


@router.get("/{level}/start", response_model=TestSession)
async def start_test(
    level: str,
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    """Start a new test session for a specific CEFR level with 20 random questions."""
    
    # Fetch random questions from words at this level
    pipeline = [
        {"$match": {"cerf_level": level, "tests": {"$exists": True, "$ne": []}}},
        {"$unwind": "$tests"},
        {"$sample": {"size": QUESTIONS_PER_TEST}},
        {
            "$project": {
                "word_id": {"$toString": "$_id"},
                "word": "$word",
                "question_type": "$tests.question_type",
                "question": "$tests.question",
                "options": "$tests.options",
                "correct_answer": "$tests.correct_answer",
                "explanation": "$tests.explanation",
                "difficulty": "$tests.difficulty"
            }
        }
    ]
    
    cursor = db["words"].aggregate(pipeline)
    questions = []
    
    async for doc in cursor:
        questions.append(TestQuestion(
            word_id=doc["word_id"],
            word=doc.get("word", ""),
            question_type=doc.get("question_type", "meaning"),
            question=doc.get("question", ""),
            options=doc.get("options", []),
            correct_answer=doc.get("correct_answer", ""),
            explanation=doc.get("explanation", ""),
            difficulty=doc.get("difficulty", "easy"),
        ))
    
    if not questions:
        raise HTTPException(
            status_code=404,
            detail=f"No test questions found for level {level}"
        )
    
    return TestSession(
        level=level,
        questions=questions,
        total_questions=len(questions),
    )


@router.post("/{level}/submit", response_model=TestResultResponse)
async def submit_test(
    level: str,
    submission: TestSubmission,
    db: AsyncIOMotorDatabase = Depends(get_database),
    user: UserInDB = Depends(get_current_user),
):
    """Submit test answers and store results."""
    
    # Calculate score
    correct_count = 0
    answers_data = []
    
    for answer in submission.answers:
        is_correct = answer.selected_answer == answer.correct_answer
        if is_correct:
            correct_count += 1
        
        answers_data.append({
            "wordId": answer.word_id,
            "question": answer.question,
            "selectedAnswer": answer.selected_answer,
            "correctAnswer": answer.correct_answer,
            "isCorrect": is_correct,
        })
    
    total_questions = len(submission.answers)
    percentage = round((correct_count / total_questions) * 100) if total_questions > 0 else 0
    
    # Store result in database
    result_doc = {
        "userId": user.id,
        "level": level,
        "score": percentage,
        "totalQuestions": total_questions,
        "correctAnswers": correct_count,
        "completedAt": datetime.utcnow(),
        "answers": answers_data,
    }
    
    await db["test_results"].insert_one(result_doc)
    
    return TestResultResponse(
        level=level,
        score=percentage,
        total_questions=total_questions,
        correct_answers=correct_count,
        percentage=percentage,
    )


@router.get("/history", response_model=List[TestHistoryItem])
async def get_test_history(
    skip: int = 0,
    limit: int = 20,
    db: AsyncIOMotorDatabase = Depends(get_database),
    user: UserInDB = Depends(get_current_user),
):
    """Get the user's test history."""
    
    cursor = db["test_results"].find(
        {"userId": user.id}
    ).sort("completedAt", -1).skip(skip).limit(limit)
    
    history = []
    async for doc in cursor:
        history.append(TestHistoryItem(
            id=str(doc["_id"]),
            level=doc["level"],
            score=doc["score"],
            total_questions=doc["totalQuestions"],
            correct_answers=doc["correctAnswers"],
            percentage=doc["score"],
            completed_at=doc["completedAt"],
        ))
    
    return history
