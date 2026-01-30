from fastapi import APIRouter, Depends
from app.dependencies import RoleChecker
from app.core.security import UserRole

router = APIRouter()

@router.post("/", dependencies=[Depends(RoleChecker([UserRole.ADMIN, UserRole.TEACHER]))])
async def create_word_entry():
    return {"message": "Word created successfully"}
