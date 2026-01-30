from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

class Settings(BaseSettings):
    MONGO_USER: str
    MONGO_PASSWORD: str
    MONGO_ADDRESS: str
    MONGO_CLUSTER: str
    FIREBASE_API: str
    ALLOWED_ORIGINS: List[str] = ["http://localhost:5173", "http://localhost:3000", "http://localhost:8000"]

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
