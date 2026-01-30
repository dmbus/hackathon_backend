from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Any
from datetime import datetime

class DeckBase(BaseModel):
    name: str
    description: Optional[str] = None
    is_public: bool = False

class DeckCreate(DeckBase):
    pass

class DeckInDB(DeckBase):
    id: str = Field(alias="_id")
    created_by: str # user_id
    created_at: datetime = Field(default_factory=datetime.utcnow)

    model_config = ConfigDict(populate_by_name=True)

class DeckResponse(DeckBase):
    id: str
    created_by: str
    created_at: datetime
