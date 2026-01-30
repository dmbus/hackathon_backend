from pydantic import BaseModel, EmailStr
from typing import Optional, List, Any
from app.core.security import UserRole, ROLES_PERMISSIONS

class UserProfile(BaseModel):
    native_language: str = "en"
    target_level: str = "B1"

class UserCreate(BaseModel):
    name: Optional[str] = None
    email: EmailStr
    password: str
    profile: Optional[UserProfile] = None

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

class FirebaseLoginRequest(BaseModel):
    idToken: str

class UserInDB(BaseModel):
    id: str  # maps to _id
    email: EmailStr
    role: str
    permissions: List[str]
    profile: Optional[UserProfile] = None
    created_at: Any = None

class UserResponse(BaseModel):
    id: str
    email: EmailStr
    role: str
    permissions: List[str]
    profile: Optional[UserProfile] = None

class EmailRequest(BaseModel):
    email: EmailStr

class LoginResponse(BaseModel):
    tokens: FirebaseTokenResponse
    user: UserResponse
