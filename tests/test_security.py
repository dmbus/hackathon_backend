import os
import pytest
from fastapi.testclient import TestClient

# Set required environment variables before importing settings/app
os.environ["MONGO_USER"] = "test"
os.environ["MONGO_PASSWORD"] = "test"
os.environ["MONGO_ADDRESS"] = "localhost"
os.environ["MONGO_CLUSTER"] = "test"
os.environ["FIREBASE_API"] = "test"

from app.main import app

client = TestClient(app)

def test_security_headers():
    response = client.get("/")
    assert response.status_code == 200
    assert response.headers["X-Content-Type-Options"] == "nosniff"
    assert response.headers["X-Frame-Options"] == "DENY"
    assert response.headers["X-XSS-Protection"] == "1; mode=block"

def test_cors_allowed_origin():
    # 'http://localhost:5173' is in the default allowed origins
    headers = {
        "Origin": "http://localhost:5173",
        "Access-Control-Request-Method": "GET"
    }
    response = client.options("/", headers=headers)
    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == "http://localhost:5173"

def test_cors_disallowed_origin():
    headers = {
        "Origin": "http://evil.com",
        "Access-Control-Request-Method": "GET"
    }
    response = client.options("/", headers=headers)
    # When origin is not allowed, no Access-Control-Allow-Origin header is sent
    assert "access-control-allow-origin" not in response.headers
