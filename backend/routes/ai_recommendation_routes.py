from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.schemas.validation_schemas import AIRecommendationResponse
from backend.controllers.ai_recommendation_controller import handle_get_ai_recommendations

router = APIRouter()

@router.get("/ai-recommendations", response_model=AIRecommendationResponse, summary="Get dynamic AI business recommendations", tags=["AI Insights"])
def get_ai_recommendations(db: Session = Depends(get_db)):
    """
    Returns dynamically computed AI insights and business recommendations based on real-time customer data aggregates.
    """
    return handle_get_ai_recommendations(db)
