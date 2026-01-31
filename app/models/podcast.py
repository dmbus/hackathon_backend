from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from enum import Enum


class CEFRLevel(str, Enum):
    A1 = "A1"
    A2 = "A2"
    B1 = "B1"
    B2 = "B2"
    C1 = "C1"
    C2 = "C2"


# Context options for podcast generation
PODCAST_CONTEXTS = [
    # Daily Life & Essentials
    "Die Bäckerei",
    "Der Supermarkt",
    "Der Wochenmarkt",
    "Die Apotheke",
    "Der Friseur",
    # Social & Leisure
    "Das Café",
    "Das Restaurant",
    "Die Kneipe",
    "Der Weihnachtsmarkt",
    "Das Bekleidungsgeschäft",
    # Travel & Transport
    "Der Bahnhof",
    "Im Bus",
    "Die Hotelrezeption",
    "Der Flughafen",
    # Work, Study & Housing
    "Das Büro",
    "Die Universität",
    "Die WG",
    "Die Wohnungsbesichtigung",
    # Services & Bureaucracy
    "Die Arztpraxis",
    "Das Bürgeramt",
]


class ScriptLine(BaseModel):
    speaker: str = Field(description="The name of the speaker")
    text: str = Field(description="The spoken text in German")
    start_time: Optional[float] = Field(default=None, description="Start time in seconds")
    end_time: Optional[float] = Field(default=None, description="End time in seconds")


class QuizQuestion(BaseModel):
    question: str = Field(description="The question text in German")
    options: List[str] = Field(description="4 possible answers in German")
    correct_answer: str = Field(description="The correct answer from the options")


class PodcastCreate(BaseModel):
    words: List[str] = Field(..., min_length=3, max_length=7, description="German vocabulary words (3-7)")
    cefr_level: CEFRLevel = Field(..., description="CEFR language level")
    context: str = Field(..., description="Context/setting for the podcast")
    voice_ids: List[str] = Field(default=["rachel", "drew"], description="ElevenLabs voice IDs")


class PodcastInDB(BaseModel):
    id: str = Field(alias="_id")
    title: str
    words: List[str]
    cefr_level: str
    context: str
    voice_ids: List[str]
    audio_url: str
    duration: Optional[str] = None
    transcript: List[ScriptLine]
    quiz: List[QuizQuestion]
    created_at: datetime
    created_by: Optional[str] = None

    class Config:
        populate_by_name = True


class PodcastResponse(BaseModel):
    id: str
    title: str
    words: List[str]
    cefr_level: str
    context: str
    audio_url: str
    duration: Optional[str] = None
    transcript: List[ScriptLine]
    quiz: List[QuizQuestion]
    created_at: datetime


class PodcastListItem(BaseModel):
    id: str
    title: str
    cefr_level: str
    context: str
    duration: Optional[str] = None
    audio_url: str
    created_at: datetime


class VoiceOption(BaseModel):
    voice_id: str
    name: str
    preview_url: Optional[str] = None
    labels: Optional[dict] = None
