from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime

class UserProgressBase(BaseModel):
    deck_id: Optional[str] = None
    word_id: Optional[str] = None
    progress: int = 0
    next_review: Optional[datetime] = None

class UserProgressInDB(UserProgressBase):
    id: str = Field(alias="_id")
    user_id: str
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    model_config = ConfigDict(populate_by_name=True)

class UserProgressResponse(UserProgressBase):
    id: str
    user_id: str
    updated_at: datetime
