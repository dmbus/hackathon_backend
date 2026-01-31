from fastapi import FastAPI, Request
import logging
import time
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, words, podcasts, audio, flashcards, speaking
from app.db.mongodb import close_mongo_connection
from app.core.config import settings

app = FastAPI()

# Configure Logging
logging.basicConfig(
    filename='backend.log',
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    # Strict-Transport-Security is crucial for HTTPS, but can be annoying on localhost without https.
    # We can conditionally add it or just add it. Browsers usually ignore it on http://localhost.
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response

@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    logger.debug(f"Incoming request: {request.method} {request.url}")
    try:
        response = await call_next(request)
        process_time = time.time() - start_time
        logger.debug(f"Request completed: {response.status_code} in {process_time:.4f}s")
        return response
    except Exception as e:
        logger.error(f"Request failed: {str(e)}", exc_info=True)
        raise

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(words.router, prefix="/words", tags=["words"])
app.include_router(podcasts.router, prefix="/podcasts", tags=["podcasts"])
app.include_router(audio.router, prefix="/audio", tags=["audio"])
app.include_router(flashcards.router, prefix="/flashcards", tags=["flashcards"])
app.include_router(speaking.router, prefix="/speaking", tags=["speaking"])

@app.on_event("shutdown")
async def shutdown_db_client():
    await close_mongo_connection()

@app.get("/")
def read_root():
    return {"message": "Hello from backend!"}
