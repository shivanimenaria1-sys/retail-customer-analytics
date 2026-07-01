from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import logging

from backend.config import PROJECT_NAME, CORS_ORIGINS
from backend.database import engine, Base
from backend.routes import api_router
from backend.utils.logger import logger

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    FastAPI lifespan manager. Initializes database schemas and bulk-seeds
    the customer segmentation CSV file dynamically on startup.
    """
    logger.info("FastAPI backend initializing...")
    from backend.database import SessionLocal
    db = SessionLocal()
    try:
        from backend.database_seeder import init_and_seed_db
        init_and_seed_db(db)
        logger.info("PostgreSQL database auto-initialization and seeding check completed.")
    except Exception as e:
        logger.warning(
            f"Unable to connect to database on startup. "
            f"Please verify that your PostgreSQL server is online. "
            f"Offline services (such as prospect segmentation) remain operational. "
            f"Startup Error: {str(e)}"
        )
    finally:
        db.close()
    yield
    logger.info("FastAPI backend shutting down.")


# Initialize FastAPI application
app = FastAPI(
    title=PROJECT_NAME,
    description="Production-grade API for customer segmentation and business insights.",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled server error on request {request.url.path}: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred. Please contact the administrator."}
    )

# Include combining router directly at root to match requested endpoints exactly
app.include_router(api_router)

@app.get("/")
def root_endpoint():
    return {
        "message": f"Welcome to the {PROJECT_NAME}!",
        "documentation": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    logger.info("Launching server locally via Uvicorn...")
    uvicorn.run("backend.app:app", host="0.0.0.0", port=8000, reload=True)
