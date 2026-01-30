from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from datetime import datetime
from app.dependencies import RoleChecker, get_current_user
from app.core.security import UserRole
from app.models.deck import DeckCreate, DeckResponse
from app.models.user import UserInDB
from app.db.mongodb import get_database
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId

router = APIRouter()

@router.post("/", response_model=DeckResponse, status_code=status.HTTP_201_CREATED)
async def create_deck(
    deck: DeckCreate,
    user: UserInDB = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    # Only Admin and Teacher can create decks
    if user.role not in [UserRole.ADMIN, UserRole.TEACHER]:
         raise HTTPException(status_code=403, detail="Not authorized to create decks")

    deck_doc = deck.model_dump()
    deck_doc["created_by"] = user.id
    deck_doc["created_at"] = datetime.utcnow()

    result = await db["decks"].insert_one(deck_doc)

    return DeckResponse(id=str(result.inserted_id), **deck_doc)

@router.put("/{deck_id}", response_model=DeckResponse)
async def update_deck(
    deck_id: str,
    deck_update: DeckCreate,
    user: UserInDB = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    try:
        oid = ObjectId(deck_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid ID format")

    existing_deck = await db["decks"].find_one({"_id": oid})

    if not existing_deck:
        raise HTTPException(status_code=404, detail="Deck not found")

    # Check permissions: Admin or Owner
    if user.role != UserRole.ADMIN and existing_deck.get("created_by") != user.id:
        raise HTTPException(status_code=403, detail="Not authorized to edit this deck")

    update_data = deck_update.model_dump(exclude_unset=True)

    await db["decks"].update_one({"_id": oid}, {"$set": update_data})

    updated_deck = await db["decks"].find_one({"_id": oid})
    return DeckResponse(id=str(updated_deck["_id"]), **updated_deck)

@router.get("/", response_model=List[DeckResponse])
async def list_decks(
    user: UserInDB = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    # Logic: Show public decks AND decks created by user
    query = {
        "$or": [
            {"is_public": True},
            {"created_by": user.id}
        ]
    }
    cursor = db["decks"].find(query)
    decks = []
    async for doc in cursor:
        decks.append(DeckResponse(id=str(doc["_id"]), **doc))
    return decks
