from fastapi import APIRouter, Depends, HTTPException, status, Header, Body
from app.models.user import UserCreate, UserLogin, FirebaseTokenResponse, EmailRequest
from app.core.security import UserRole, ROLES_PERMISSIONS
from app.services.firebase_auth import (
    sign_up_with_email, 
    sign_in_with_email, 
    send_password_reset_email,
    send_email_verification
)
from app.db.mongodb import get_database
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime

router = APIRouter()

@router.post("/register", response_model=FirebaseTokenResponse, status_code=status.HTTP_201_CREATED)
async def register(user: UserCreate, db: AsyncIOMotorDatabase = Depends(get_database)):
    # 1. Sign up with Firebase
    firebase_response = await sign_up_with_email(user.email, user.password)
    
    # 2. Store in MongoDB
    # We use the 'localId' from firebase as the unique identifier
    user_doc = {
        "_id": firebase_response["localId"],
        "email": firebase_response["email"],
        "role": UserRole.STUDENT_FREE,
        "permissions": ROLES_PERMISSIONS[UserRole.STUDENT_FREE],
        "created_at": datetime.utcnow()
    }
    
    # Using upsert=True just in case of retry/race conditions, though Firebase should handle uniqueness
    await db["users"].update_one(
        {"_id": user_doc["_id"]}, 
        {"$set": user_doc}, 
        upsert=True
    )
    
    return firebase_response

@router.post("/login", response_model=FirebaseTokenResponse)
async def login(user: UserLogin):
    return await sign_in_with_email(user.email, user.password)

@router.post("/recover")
async def request_password_reset(request: EmailRequest):
    await send_password_reset_email(request.email)
    return {"message": "Password reset email sent"}

@router.post("/verify")
async def verify_user_email(authorization: str = Header(..., description="Bearer <token>")):
    # Extract token from Bearer header
    if not authorization.startswith("Bearer "):
         raise HTTPException(status_code=401, detail="Invalid authorization header")
    token = authorization.split(" ")[1]
    
    await send_email_verification(token)
    return {"message": "Verification email sent"}

@router.post("/logout")
async def logout():
    # Stateless logout - client discards token
    return {"message": "Logged out successfully"}
