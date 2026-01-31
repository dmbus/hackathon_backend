from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timedelta
from app.dependencies import get_current_user
from app.models.user import UserInDB
from app.db.mongodb import get_database
from motor.motor_asyncio import AsyncIOMotorDatabase
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

# --- Models ---

class UserSettings(BaseModel):
    flashcards_per_session: int = 30
    word_repetitions: int = 3
    questions_per_test: int = 20
    cefr_level: str = "B1"

class UserSettingsUpdate(BaseModel):
    flashcards_per_session: Optional[int] = None
    word_repetitions: Optional[int] = None
    questions_per_test: Optional[int] = None
    cefr_level: Optional[str] = None

class UserProfile(BaseModel):
    id: str
    email: str
    name: Optional[str] = None
    role: str
    created_at: Optional[datetime] = None
    settings: UserSettings
    subscription: dict

class UserProfileUpdate(BaseModel):
    name: Optional[str] = None

class Notification(BaseModel):
    id: str
    title: str
    message: str
    type: str  # info, success, warning, achievement
    read: bool = False
    created_at: datetime

class NotificationUpdate(BaseModel):
    read: bool


# --- Endpoints ---

@router.get("/me", response_model=UserProfile)
async def get_current_user_profile(
    current_user: UserInDB = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get the current user's profile including settings and subscription."""
    user_doc = await db["user"].find_one({"_id": current_user.id})
    
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get or create default settings
    settings = user_doc.get("settings", {})
    default_settings = UserSettings()
    user_settings = UserSettings(
        flashcards_per_session=settings.get("flashcards_per_session", default_settings.flashcards_per_session),
        word_repetitions=settings.get("word_repetitions", default_settings.word_repetitions),
        questions_per_test=settings.get("questions_per_test", default_settings.questions_per_test),
        cefr_level=settings.get("cefr_level", default_settings.cefr_level)
    )
    
    # Get or create trial subscription
    subscription = user_doc.get("subscription")
    if not subscription:
        # Create a 1-month trial starting from account creation
        created_at = user_doc.get("created_at", datetime.utcnow())
        trial_end = created_at + timedelta(days=30)
        subscription = {
            "plan": "trial",
            "status": "active" if datetime.utcnow() < trial_end else "expired",
            "started_at": created_at.isoformat() if isinstance(created_at, datetime) else created_at,
            "expires_at": trial_end.isoformat() if isinstance(trial_end, datetime) else trial_end,
            "features": ["flashcards", "speaking", "listening", "tests"]
        }
        # Save the subscription to DB
        await db["user"].update_one(
            {"_id": current_user.id},
            {"$set": {"subscription": subscription}}
        )
    
    return UserProfile(
        id=user_doc["_id"],
        email=user_doc["email"],
        name=user_doc.get("name"),
        role=user_doc.get("role", "student_free"),
        created_at=user_doc.get("created_at"),
        settings=user_settings,
        subscription=subscription
    )


@router.put("/me", response_model=UserProfile)
async def update_user_profile(
    update: UserProfileUpdate,
    current_user: UserInDB = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Update the current user's profile (name)."""
    update_data = {k: v for k, v in update.dict().items() if v is not None}
    
    if update_data:
        await db["user"].update_one(
            {"_id": current_user.id},
            {"$set": update_data}
        )
    
    # Return updated profile
    return await get_current_user_profile(current_user, db)


@router.get("/me/settings", response_model=UserSettings)
async def get_user_settings(
    current_user: UserInDB = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get the current user's settings."""
    user_doc = await db["user"].find_one({"_id": current_user.id})
    
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")
    
    settings = user_doc.get("settings", {})
    default_settings = UserSettings()
    
    return UserSettings(
        flashcards_per_session=settings.get("flashcards_per_session", default_settings.flashcards_per_session),
        word_repetitions=settings.get("word_repetitions", default_settings.word_repetitions),
        questions_per_test=settings.get("questions_per_test", default_settings.questions_per_test),
        cefr_level=settings.get("cefr_level", default_settings.cefr_level)
    )


@router.put("/me/settings", response_model=UserSettings)
async def update_user_settings(
    settings_update: UserSettingsUpdate,
    current_user: UserInDB = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Update the current user's settings."""
    update_data = {f"settings.{k}": v for k, v in settings_update.dict().items() if v is not None}
    
    if update_data:
        await db["user"].update_one(
            {"_id": current_user.id},
            {"$set": update_data}
        )
    
    return await get_user_settings(current_user, db)


@router.get("/me/notifications", response_model=List[Notification])
async def get_user_notifications(
    current_user: UserInDB = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get the current user's notifications."""
    notifications = await db["notifications"].find(
        {"user_id": current_user.id}
    ).sort("created_at", -1).limit(50).to_list(50)
    
    # If no notifications exist, create some welcome notifications
    if not notifications:
        welcome_notifications = [
            {
                "user_id": current_user.id,
                "title": "Welcome to LingoFlash!",
                "message": "Start your language learning journey today. Check out the dashboard to begin.",
                "type": "info",
                "read": False,
                "created_at": datetime.utcnow()
            },
            {
                "user_id": current_user.id,
                "title": "Trial Started",
                "message": "Your 30-day free trial has begun. Enjoy full access to all features!",
                "type": "success",
                "read": False,
                "created_at": datetime.utcnow() - timedelta(minutes=1)
            }
        ]
        await db["notifications"].insert_many(welcome_notifications)
        notifications = welcome_notifications
    
    return [
        Notification(
            id=str(n.get("_id", n.get("user_id") + str(i))),
            title=n["title"],
            message=n["message"],
            type=n["type"],
            read=n.get("read", False),
            created_at=n["created_at"]
        )
        for i, n in enumerate(notifications)
    ]


@router.put("/me/notifications/{notification_id}")
async def mark_notification_read(
    notification_id: str,
    update: NotificationUpdate,
    current_user: UserInDB = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Mark a notification as read/unread."""
    from bson import ObjectId
    
    try:
        result = await db["notifications"].update_one(
            {"_id": ObjectId(notification_id), "user_id": current_user.id},
            {"$set": {"read": update.read}}
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Notification not found")
        
        return {"message": "Notification updated"}
    except Exception as e:
        logger.error(f"Error updating notification: {e}")
        raise HTTPException(status_code=400, detail="Invalid notification ID")


@router.put("/me/notifications/mark-all-read")
async def mark_all_notifications_read(
    current_user: UserInDB = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Mark all notifications as read."""
    await db["notifications"].update_many(
        {"user_id": current_user.id},
        {"$set": {"read": True}}
    )
    return {"message": "All notifications marked as read"}
