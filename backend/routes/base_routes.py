from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.utils.logger import logger

router = APIRouter()

@router.get("/health", summary="Health check", tags=["Base"])
def health_check(db: Session = Depends(get_db)):
    """
    Checks backend server status and tests database connectivity.
    """
    logger.info("Health check endpoint requested.")
    db_status = "healthy"
    try:
        # Executing a simple query to check connection
        db.execute("SELECT 1")
    except Exception as e:
        logger.error(f"Database health check failed: {str(e)}")
        db_status = "unhealthy"
        
    return {
        "status": "online",
        "database": db_status
    }
