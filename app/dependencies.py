from fastapi import Depends, HTTPException, status, Header
from app.models.user import UserInDB
from app.db.mongodb import get_database
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.services.firebase_auth import get_user_by_token
from typing import List

async def get_current_user(
    authorization: str = Header(..., description="Bearer <token>"),
    db: AsyncIOMotorDatabase = Depends(get_database)
) -> UserInDB:
    if not authorization.startswith("Bearer "):
         raise HTTPException(status_code=401, detail="Invalid authorization header")
    token = authorization.split(" ")[1]
    
    # Verify token with Firebase REST API
    firebase_user = await get_user_by_token(token)
    user_id = firebase_user["localId"]
    
    # Fetch from MongoDB
    user_doc = await db["user"].find_one({"_id": user_id})
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found in database")
        
    return UserInDB(
        id=user_doc["_id"],
        email=user_doc["email"],
        role=user_doc.get("role", "student_free"), # Fallback for legacy users
        permissions=user_doc.get("permissions", []),
        created_at=user_doc.get("created_at")
    )

class RoleChecker:
    def __init__(self, allowed_roles: List[str]):
        self.allowed_roles = allowed_roles

    def __call__(self, user: UserInDB = Depends(get_current_user)):
        if user.role not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have enough privileges"
            )
