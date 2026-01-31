"""Pydantic models for German pronunciation training."""

from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from enum import Enum


class DifficultyLevel(str, Enum):
    """Difficulty levels for pronunciation modules."""
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"


class MasteryLevel(str, Enum):
    """User mastery levels for a sound."""
    NEW = "new"
    PRACTICING = "practicing"
    MASTERED = "mastered"


# --- Exercise Models ---

class PronunciationExercise(BaseModel):
    """A single pronunciation exercise within a module."""
    word: str = Field(description="German word to practice")
    ipa: str = Field(description="IPA transcription of the word")
    sentence: str = Field(description="Example sentence containing the word")
    audio_url: Optional[str] = Field(default=None, description="Cached TTS audio URL")


# --- Progress Models ---

class UserProgress(BaseModel):
    """User's progress for a specific sound module."""
    total_attempts: int = Field(default=0)
    average_score: float = Field(default=0.0)
    best_score: float = Field(default=0.0)
    last_practiced: Optional[datetime] = None
    mastery_level: MasteryLevel = Field(default=MasteryLevel.NEW)


class UserProgressInDB(BaseModel):
    """MongoDB document for user pronunciation progress."""
    id: str = Field(alias="_id")
    user_id: str = Field(alias="userId")
    sound_id: str
    total_attempts: int
    average_score: float
    best_score: float
    last_practiced: datetime
    mastery_level: str

    class Config:
        populate_by_name = True


# --- Module Models ---

class PronunciationModuleBase(BaseModel):
    """Base model for pronunciation modules."""
    sound_id: str = Field(description="Unique identifier for the sound")
    phoneme_ipa: str = Field(description="IPA representation of the target phoneme(s)")
    name: str = Field(description="Display name (e.g., 'Initial St')")
    description: str = Field(description="Explanation of when/how this sound occurs")
    articulatory_tip: str = Field(description="How to produce this sound correctly")
    difficulty_level: DifficultyLevel = Field(default=DifficultyLevel.INTERMEDIATE)


class PronunciationModule(PronunciationModuleBase):
    """Full pronunciation module with exercises and user progress."""
    id: str = Field(description="MongoDB document ID")
    exercises: List[PronunciationExercise] = Field(default_factory=list)
    user_progress: Optional[UserProgress] = Field(
        default=None,
        description="User-specific progress (populated per request)"
    )
    exercises_count: int = Field(default=0, description="Total number of exercises")


class PronunciationModuleSummary(PronunciationModuleBase):
    """Summary view of a module for listing."""
    id: str
    exercises_count: int
    user_progress: Optional[UserProgress] = None


class PronunciationModuleInDB(BaseModel):
    """MongoDB document for pronunciation module."""
    id: str = Field(alias="_id")
    sound_id: str
    phoneme_ipa: str
    name: str
    description: str
    articulatory_tip: str
    difficulty_level: str
    exercises: List[dict]

    class Config:
        populate_by_name = True


# --- Analysis Models ---

class PhonemeError(BaseModel):
    """A specific phoneme mismatch between target and user pronunciation."""
    target: str = Field(description="Expected phoneme")
    produced: str = Field(description="Phoneme the user produced")
    position: int = Field(description="Position in the IPA string")


class PronunciationAnalysisResult(BaseModel):
    """Complete analysis result for a pronunciation attempt."""
    overall_score: float = Field(ge=0, le=100, description="Score from 0-100")
    target_ipa: str = Field(description="Expected IPA transcription")
    user_ipa: str = Field(description="IPA extracted from user's audio")
    phoneme_errors: List[PhonemeError] = Field(
        default_factory=list,
        description="List of specific phoneme mismatches"
    )
    ai_feedback: str = Field(description="GPT-4o generated feedback")
    articulatory_tips: List[str] = Field(
        default_factory=list,
        description="Specific tips for improvement"
    )


# --- Session Models ---

class PronunciationSessionCreate(BaseModel):
    """Request to analyze a pronunciation attempt."""
    sound_id: str = Field(description="ID of the sound module")
    exercise_index: int = Field(ge=0, description="Index of the exercise in the module")
    # Audio is sent as multipart form data


class PronunciationSessionResponse(BaseModel):
    """Response after analyzing a pronunciation attempt."""
    id: str = Field(description="Session document ID")
    created_at: datetime
    sound_id: str
    word: str
    sentence: str
    analysis: PronunciationAnalysisResult
    benchmark_audio_url: str
    user_audio_url: str


class PronunciationSessionInDB(BaseModel):
    """MongoDB document for a pronunciation session."""
    id: str = Field(alias="_id")
    user_id: str = Field(alias="userId")
    created_at: datetime = Field(alias="createdAt")
    sound_id: str
    exercise_index: int
    word: str
    sentence: str
    target_ipa: str
    user_ipa: str
    benchmark_audio_url: str
    user_audio_url: str
    overall_score: float
    phoneme_errors: List[dict]
    ai_feedback: str

    class Config:
        populate_by_name = True


class PronunciationHistoryItem(BaseModel):
    """Summary item for history listing."""
    id: str
    created_at: datetime
    sound_id: str
    sound_name: str
    word: str
    score: float
    phoneme_errors_count: int


# --- Stats Models ---

class PronunciationStats(BaseModel):
    """Overall user pronunciation statistics."""
    total_sessions: int = Field(default=0)
    average_score: float = Field(default=0.0)
    total_modules_practiced: int = Field(default=0)
    modules_mastered: int = Field(default=0)
    weak_sounds: List[str] = Field(
        default_factory=list,
        description="Sound IDs that need more practice"
    )
    strong_sounds: List[str] = Field(
        default_factory=list,
        description="Sound IDs the user has mastered"
    )


# --- Exercise Detail Model ---

class ExerciseDetail(BaseModel):
    """Detailed exercise info including benchmark audio."""
    sound_id: str
    exercise_index: int
    word: str
    ipa: str
    sentence: str
    phoneme_ipa: str = Field(description="Target phoneme for this module")
    articulatory_tip: str
    benchmark_audio_url: Optional[str] = None
    user_best_score: Optional[float] = None
