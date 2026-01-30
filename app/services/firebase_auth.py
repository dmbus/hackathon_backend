import httpx
from app.core.config import settings
from fastapi import HTTPException, status

FIREBASE_AUTH_URL = "https://identitytoolkit.googleapis.com/v1/accounts"

async def sign_up_with_email(email: str, password: str):
    url = f"{FIREBASE_AUTH_URL}:signUp?key={settings.FIREBASE_API}"
    payload = {"email": email, "password": password, "returnSecureToken": True}
    
    async with httpx.AsyncClient() as client:
        response = await client.post(url, json=payload)
        
    if response.status_code != 200:
        error_data = response.json()
        error_msg = error_data.get("error", {}).get("message", "Unknown error")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Firebase Register Error: {error_msg}"
        )
    return response.json()

async def sign_in_with_email(email: str, password: str):
    url = f"{FIREBASE_AUTH_URL}:signInWithPassword?key={settings.FIREBASE_API}"
    payload = {"email": email, "password": password, "returnSecureToken": True}
    
    async with httpx.AsyncClient() as client:
        response = await client.post(url, json=payload)

    if response.status_code != 200:
        error_data = response.json()
        error_msg = error_data.get("error", {}).get("message", "Unknown error")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Firebase Login Error: {error_msg}"
        )
    return response.json()

async def send_password_reset_email(email: str):
    url = f"{FIREBASE_AUTH_URL}:sendOobCode?key={settings.FIREBASE_API}"
    payload = {"requestType": "PASSWORD_RESET", "email": email}
    
    async with httpx.AsyncClient() as client:
        response = await client.post(url, json=payload)

    if response.status_code != 200:
        error_data = response.json()
        error_msg = error_data.get("error", {}).get("message", "Unknown error")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Password Reset Error: {error_msg}"
        )
    return response.json()

async def send_email_verification(id_token: str):
    url = f"{FIREBASE_AUTH_URL}:sendOobCode?key={settings.FIREBASE_API}"
    payload = {"requestType": "VERIFY_EMAIL", "idToken": id_token}
    
    async with httpx.AsyncClient() as client:
        response = await client.post(url, json=payload)

    if response.status_code != 200:
        error_data = response.json()
        error_msg = error_data.get("error", {}).get("message", "Unknown error")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Email Verification Error: {error_msg}"
        )
    return response.json()

async def get_user_by_token(id_token: str):
    url = f"{FIREBASE_AUTH_URL}:lookup?key={settings.FIREBASE_API}"
    payload = {"idToken": id_token}
    
    async with httpx.AsyncClient() as client:
        response = await client.post(url, json=payload)
        
    if response.status_code != 200:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )
        
    data = response.json()
    if not data.get("users"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
        
    return data["users"][0]
