from pydantic import BaseModel
from typing import List, Optional, Any
from datetime import datetime


class TestQuestion(BaseModel):
    """A single test question from a word's tests array."""
    word_id: str
    word: str
    question_type: str  # "article", "meaning", "collocation", "sentence"
    question: str
    options: List[str]
    correct_answer: str
    explanation: str
    difficulty: str  # "easy", "medium"


class TestSession(BaseModel):
    """A test session with questions for a specific CEFR level."""
    level: str
    questions: List[TestQuestion]
    total_questions: int


class TestLevelInfo(BaseModel):
    """Information about available tests for a CEFR level."""
    level: str
    question_count: int
    best_score: Optional[int] = None
    attempts: int = 0
    theme: str = "slate"


class AnswerSubmission(BaseModel):
    """A single answer submission."""
    question_index: int
    word_id: str
    question: str
    selected_answer: str
    correct_answer: str


class TestSubmission(BaseModel):
    """Submission payload for completing a test."""
    answers: List[AnswerSubmission]


class TestResultResponse(BaseModel):
    """Response after submitting a test."""
    level: str
    score: int
    total_questions: int
    correct_answers: int
    percentage: float


class TestHistoryItem(BaseModel):
    """A single item in the user's test history."""
    id: str
    level: str
    score: int
    total_questions: int
    correct_answers: int
    percentage: float
    completed_at: Any  # datetime
