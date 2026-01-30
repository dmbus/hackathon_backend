from fastapi import APIRouter, Depends, status
from app.dependencies import RoleChecker
from app.core.security import UserRole
from app.models.word import WordSchema
from app.db.mongodb import get_database
from motor.motor_asyncio import AsyncIOMotorDatabase

router = APIRouter()

@router.post("/", dependencies=[Depends(RoleChecker([UserRole.ADMIN, UserRole.TEACHER]))], status_code=status.HTTP_201_CREATED)
async def create_word_entry(word_data: WordSchema, db: AsyncIOMotorDatabase = Depends(get_database)):
    word_doc = word_data.model_dump() # Pydantic v2

    result = await db["words"].insert_one(word_doc)

    return {"message": "Word created successfully", "id": str(result.inserted_id), "word": word_data.word}
