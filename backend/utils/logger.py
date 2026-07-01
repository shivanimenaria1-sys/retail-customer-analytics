import logging
import sys
from backend.config import LOG_LEVEL

def setup_logger():
    logger = logging.getLogger("retail_analytics")
    logger.setLevel(LOG_LEVEL)
    
    # Check if handler already exists
    if not logger.handlers:
        formatter = logging.Formatter(
            "[%(asctime)s] %(levelname)s [%(name)s:%(lineno)s] - %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S"
        )
        
        handler = logging.StreamHandler(sys.stdout)
        handler.setFormatter(formatter)
        logger.addHandler(handler)
        
    return logger

logger = setup_logger()
