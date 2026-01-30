from fastapi import FastAPI, Request
import logging
import time
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, words, podcasts
from app.db.mongodb import close_mongo_connection

app = FastAPI()

# Configure Logging
logging.basicConfig(
    filename='backend.log',
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

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
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(words.router, prefix="/words", tags=["words"])
app.include_router(podcasts.router, prefix="/podcasts", tags=["podcasts"])

@app.on_event("shutdown")
async def shutdown_db_client():
    await close_mongo_connection()

@app.get("/")
def read_root():
    return {"message": "Hello from backend!"}
