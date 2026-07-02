from fastapi import HTTPException
from sqlalchemy.orm import Session
from backend.services.ai_recommendation_service import generate_ai_recommendations
from backend.schemas.validation_schemas import AIRecommendationResponse
from backend.utils.logger import logger

def handle_get_ai_recommendations(db: Session) -> AIRecommendationResponse:
    """
    Controller that coordinates dynamic AI recommendation generation and maps it to validation schemas.
    """
    logger.info("Handling get AI recommendations request...")
    try:
        recommendations_data = generate_ai_recommendations(db)
        return AIRecommendationResponse(**recommendations_data)
    except Exception as e:
        logger.error(f"Error compiling AI recommendations: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while generating AI insights: {str(e)}"
        )
