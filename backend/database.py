import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from backend.config import DATABASE_URL

logger = logging.getLogger("retail_analytics")

# Create SQLAlchemy engine
# Set connect_timeout to 5s to prevent hanging on startup if PG is offline
connect_args = {}
if DATABASE_URL.startswith("postgresql"):
    connect_args = {"connect_timeout": 5}

engine = create_engine(
    DATABASE_URL, 
    pool_pre_ping=True, 
    connect_args=connect_args
)

SessionLocal = sessionmaker(
    autocommit=False, 
    autoflush=False, 
    bind=engine
)

Base = declarative_base()

def get_db():
    """
    SQLAlchemy Database session generator dependency.
    Yields database sessions and cleans up after the request finishes.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
