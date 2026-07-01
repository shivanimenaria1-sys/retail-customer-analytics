import os
from pathlib import Path
from typing import List

# Base directory
BASE_DIR = Path(__file__).resolve().parent.parent

# Database configurations
# Fallback to local default PostgreSQL. If testing locally, can set env DATABASE_URL.
DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "postgresql://postgres:_Shreya_2828@localhost:5432/retail_customer_analytics"
)

# App configurations
PROJECT_NAME = "Retail Customer Analytics API"
API_STR = "/api"
CORS_ORIGINS: List[str] = [
    "http://localhost",
    "http://localhost:3000",
    "http://localhost:8000",
    "*"
]

# Serialized model paths (referencing backend/services/config.py outputs)
MODEL_DIR = BASE_DIR / "models"
SCALER_PATH = MODEL_DIR / "scaler.pkl"
KMEANS_MODEL_PATH = MODEL_DIR / "kmeans_model.pkl"

# Logging configuration
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
