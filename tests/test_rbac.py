import os
# Set required environment variables before importing settings/app
os.environ["MONGO_USER"] = "test"
os.environ["MONGO_PASSWORD"] = "test"
os.environ["MONGO_ADDRESS"] = "localhost"
os.environ["MONGO_CLUSTER"] = "test"
os.environ["FIREBASE_API"] = "test"

from fastapi.testclient import TestClient
from unittest.mock import AsyncMock, MagicMock
from app.main import app
from app.dependencies import get_current_user
from app.db.mongodb import get_database
from app.models.user import UserInDB
from app.core.security import UserRole

client = TestClient(app)

def get_admin_user():
    return UserInDB(
        id="admin_id",
        email="admin@example.com",
        role=UserRole.ADMIN,
        permissions=["manage_users"],
        profile=None
    )

def get_teacher_user():
    return UserInDB(
        id="teacher_id",
        email="teacher@example.com",
        role=UserRole.TEACHER,
        permissions=["create_deck"],
        profile=None
    )

def get_student_user():
    return UserInDB(
        id="student_id",
        email="student@example.com",
        role=UserRole.STUDENT_FREE,
        permissions=[],
        profile=None
    )

async def mock_get_database():
    mock_db = MagicMock()
    mock_collection = MagicMock()

    # Mock insert_one
    mock_insert_result = MagicMock()
    mock_insert_result.inserted_id = "507f1f77bcf86cd799439011"
    mock_collection.insert_one = AsyncMock(return_value=mock_insert_result)

    # Mock find_one
    mock_deck = {
        "_id": "507f1f77bcf86cd799439011",
        "name": "Test Deck",
        "created_by": "teacher_id",
        "is_public": False
    }
    mock_collection.find_one = AsyncMock(return_value=mock_deck)

    # Mock update_one
    mock_collection.update_one = AsyncMock()

    mock_db.__getitem__.return_value = mock_collection

    return mock_db

def test_create_word_admin():
    app.dependency_overrides[get_current_user] = get_admin_user
    app.dependency_overrides[get_database] = mock_get_database

    response = client.post("/words/", json={
        "word": "test",
        "definition": "a test",
        "example_sentence": "this is a test",
        "part_of_speech": "noun"
    })

    app.dependency_overrides = {}
    assert response.status_code == 201
    assert response.json()["message"] == "Word created successfully"

def test_create_word_student_forbidden():
    app.dependency_overrides[get_current_user] = get_student_user
    app.dependency_overrides[get_database] = mock_get_database

    response = client.post("/words/", json={
        "word": "test",
        "definition": "a test"
    })

    app.dependency_overrides = {}
    assert response.status_code == 403
    assert response.json()["detail"] == "You do not have enough privileges"

def test_create_deck_teacher():
    app.dependency_overrides[get_current_user] = get_teacher_user
    app.dependency_overrides[get_database] = mock_get_database

    response = client.post("/decks/", json={
        "name": "My Deck",
        "description": "A test deck"
    })

    app.dependency_overrides = {}
    assert response.status_code == 201
    assert response.json()["name"] == "My Deck"
    assert response.json()["created_by"] == "teacher_id"

def test_create_deck_student_forbidden():
    app.dependency_overrides[get_current_user] = get_student_user
    app.dependency_overrides[get_database] = mock_get_database

    response = client.post("/decks/", json={
        "name": "My Deck",
        "description": "A test deck"
    })

    app.dependency_overrides = {}
    assert response.status_code == 403
