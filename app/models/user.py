from pydantic import BaseModel, EmailStr
from typing import Optional, List, Any
from app.core.security import UserRole, ROLES_PERMISSIONS

class UserCreate(BaseModel):
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

# Response model from Firebase usually includes these fields
class FirebaseTokenResponse(BaseModel):
    idToken: str
    email: EmailStr
    refreshToken: str
    expiresIn: str
    localId: str

class EmailRequest(BaseModel):
    email: EmailStr

class UserInDB(BaseModel):
    id: str  # maps to _id
    email: EmailStr
    role: str
    permissions: List[str]
    created_at: Any = None

class UserResponse(BaseModel):
    id: str
    email: EmailStr
    role: str
    permissions: List[str]

