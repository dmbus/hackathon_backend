from fastapi import APIRouter, Depends
from app.dependencies import RoleChecker
from app.core.security import UserRole

router = APIRouter()

@router.get("/{podcast_id}", dependencies=[Depends(RoleChecker([UserRole.STUDENT_PREMIUM, UserRole.ADMIN]))])
async def get_premium_podcast(podcast_id: str):
    return {"s3_url": "https://s3.example.com/podcast.mp3", "podcast_id": podcast_id}
