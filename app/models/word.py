from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List

class WordSchema(BaseModel):
    word: str
    definition: str
    example_sentence: Optional[str] = None
    media_url: Optional[str] = None
    part_of_speech: Optional[str] = None

class WordInDB(WordSchema):
    id: str = Field(alias="_id")

    model_config = ConfigDict(populate_by_name=True)
