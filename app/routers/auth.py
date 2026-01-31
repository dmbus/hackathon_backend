from fastapi import APIRouter, Depends, HTTPException, status, Header, Body
from app.models.user import UserCreate, UserLogin, FirebaseTokenResponse, FirebaseLoginRequest, EmailRequest
import logging
from app.core.security import UserRole, ROLES_PERMISSIONS
from app.services.firebase_auth import (
    sign_up_with_email, 
    sign_in_with_email, 
    send_password_reset_email,
    send_email_verification,
    get_user_by_token
)
from app.db.mongodb import get_database
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/register", response_model=FirebaseTokenResponse, status_code=status.HTTP_201_CREATED)
async def register(user: UserCreate, db: AsyncIOMotorDatabase = Depends(get_database)):
    # 1. Sign up with Firebase
    firebase_response = await sign_up_with_email(user.email, user.password)
    
    # 2. Store in MongoDB
    # We use the 'localId' from firebase as the unique identifier
    user_doc = {
        "_id": firebase_response["localId"],
        "email": firebase_response["email"],
        "name": user.name,
        "role": UserRole.STUDENT_FREE,
        "permissions": ROLES_PERMISSIONS[UserRole.STUDENT_FREE],
        "created_at": datetime.utcnow()
    }
    
    # Using upsert=True just in case of retry/race conditions, though Firebase should handle uniqueness
    await db["user"].update_one(
        {"_id": user_doc["_id"]}, 
        {"$set": user_doc}, 
        upsert=True
    )
    
    return firebase_response

@router.post("/login", response_model=FirebaseTokenResponse)
async def login(user: UserLogin):
    return await sign_in_with_email(user.email, user.password)

@router.post("/firebase-login")
async def firebase_login(request: FirebaseLoginRequest, db: AsyncIOMotorDatabase = Depends(get_database)):
    # 1. Verify token with Firebase
    logger.debug(f"Attempting Firebase login with token: {request.idToken[:10]}...")
    try:
        firebase_user = await get_user_by_token(request.idToken)
        logger.debug(f"Firebase user retrieved: {firebase_user.get('email')}")
    except Exception as e:
        logger.error(f"Error validating validation token: {str(e)}", exc_info=True)
        raise
    
    # 2. Check/Update MongoDB
    user_id = firebase_user["localId"]
    user_email = firebase_user.get("email")
    user_name = firebase_user.get("displayName")
    
    # Check if user exists
    existing_user = await db["user"].find_one({"_id": user_id})
    
    if not existing_user:
        user_doc = {
            "_id": user_id,
            "email": user_email,
            "name": user_name,
            "role": UserRole.STUDENT_FREE,
            "permissions": ROLES_PERMISSIONS[UserRole.STUDENT_FREE],
            "created_at": datetime.utcnow()
        }
        await db["user"].insert_one(user_doc)
        return {"message": "User created", "user": user_doc}
    
    return {"message": "Login successful", "user": existing_user}

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
