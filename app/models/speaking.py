from pydantic import BaseModel, Field, field_validator
from typing import List, Optional
from datetime import datetime


class SpeakingQuestionInDB(BaseModel):
    """A speaking practice question stored in the database."""
    id: int = Field(description="Unique identifier for the question")
    level: str = Field(default="A1", description="CEFR level (A1, A2, B1, B2, C1, C2)")
    theme: str = Field(description="Theme/topic of the question (e.g., 'Introduction', 'Hobbies')")
    question: str = Field(description="The question text in German")
    question_en: str = Field(description="English translation of the question")
    target_words: List[str] = Field(description="List of target vocabulary words for this question")


class SpeakingQuestionResponse(BaseModel):
    """Response model for a random speaking question."""
    id: int
    level: str
    theme: str
    question: str
    question_en: str
    target_words: List[str]


class TargetWord(BaseModel):
    """A word that the user should use in their speaking practice."""
    wordId: str = Field(description="Reference to the word in the Words collection")
    word: str = Field(description="The German word")
    translation: str = Field(description="English translation")


class SpeakingQuestion(BaseModel):
    """The question/prompt for the speaking practice."""
    text: str = Field(description="The question text in German")
    text_en: Optional[str] = Field(default=None, description="English translation of the question")
    theme: Optional[str] = Field(default=None, description="Theme/topic of the question")
    level: Optional[str] = Field(default=None, description="CEFR level (A1, A2, B1, B2, C1, C2)")
    audioUrl: Optional[str] = Field(default=None, description="Optional audio URL for the question")


class AudioMetadata(BaseModel):
    """Metadata about the uploaded audio file."""
    hetznerPath: str = Field(description="Path in Hetzner storage, e.g., /users/speaking/550e8400-e29b.mp3")
    bucketUrl: str = Field(description="Public or signed URL to access the audio")
    durationSeconds: float = Field(description="Duration of the audio in seconds")
    sizeBytes: int = Field(description="Size of the audio file in bytes")
    
    @field_validator('durationSeconds')
    @classmethod
    def validate_duration(cls, v: float) -> float:
        if v > 60:
            raise ValueError('Audio duration must not exceed 60 seconds')
        return v


class WordUsageAnalysis(BaseModel):
    """Analysis of how a specific target word was used."""
    word: str = Field(description="The target word")
    isUsed: bool = Field(description="Whether the word was used in the answer")
    isUsedCorrectly: bool = Field(description="Whether the word was used correctly")
    feedback: str = Field(description="Specific feedback for this word's usage")


class SpeakingAnalysis(BaseModel):
    """Complete analysis of the speaking practice attempt."""
    transcription: str = Field(description="Raw transcription from ElevenLabs")
    correctedText: str = Field(description="Grammatically corrected version")
    cefrLevel: str = Field(description="Assessed CEFR level (A1-C2)")
    score: int = Field(ge=0, le=100, description="Overall score from 0-100")
    generalFeedback: str = Field(description="General feedback and advice")
    wordUsage: List[WordUsageAnalysis] = Field(description="Analysis for each target word")


# Request/Response Models

class PracticeSessionResponse(BaseModel):
    """Response for GET /speaking/practice endpoint."""
    question: SpeakingQuestion
    targetWords: List[TargetWord]
    maxDuration: int = Field(default=60, description="Maximum recording duration in seconds")


class AnalyzeRequest(BaseModel):
    """Request body for POST /speaking/analyze (metadata only, audio sent as file)."""
    questionText: str = Field(description="The question that was asked")
    targetWords: List[TargetWord] = Field(description="The words the user was supposed to use")


class SpeakingSessionInDB(BaseModel):
    """Speaking session as stored in MongoDB."""
    id: str = Field(alias="_id")
    userId: str = Field(description="Reference to the user")
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    question: SpeakingQuestion
    targetWords: List[TargetWord]
    audio: AudioMetadata
    analysis: SpeakingAnalysis
    
    class Config:
        populate_by_name = True


class SpeakingSessionResponse(BaseModel):
    """Full speaking session response."""
    id: str
    createdAt: datetime
    question: SpeakingQuestion
    targetWords: List[TargetWord]
    audio: AudioMetadata
    analysis: SpeakingAnalysis


class SpeakingHistoryItem(BaseModel):
    """Summary item for the history list."""
    id: str
    createdAt: datetime
    questionText: str = Field(description="The question that was asked")
    score: int = Field(description="The score achieved (0-100)")
    cefrLevel: str = Field(description="The assessed CEFR level")
    targetWordsCount: int = Field(description="Number of target words")
    wordsUsedCorrectly: int = Field(description="Number of words used correctly")


class SpeakingHistoryResponse(BaseModel):
    """Response for GET /speaking/history endpoint."""
    sessions: List[SpeakingHistoryItem]
    total: int = Field(description="Total number of sessions")


# OpenAI Response Model (for parsing)

class OpenAIWordUsage(BaseModel):
    """Word usage analysis from OpenAI response."""
    word: str
    used: bool
    correct_usage: bool
    comment: str


class OpenAIAnalysisResponse(BaseModel):
    """Expected response format from OpenAI analysis."""
    transcription: str
    corrected_text: str
    cefr_level: str
    score: int
    word_usage_analysis: List[OpenAIWordUsage]
    feedback: str
