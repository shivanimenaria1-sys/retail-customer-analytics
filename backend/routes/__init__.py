from fastapi import APIRouter
from backend.routes.base_routes import router as base_router
from backend.routes.customer_routes import router as customer_router
from backend.routes.dashboard_routes import router as dashboard_router
from backend.routes.ai_recommendation_routes import router as ai_recommendation_router
from backend.routes.report_routes import router as report_router

api_router = APIRouter()

# Combine routers
api_router.include_router(base_router)
api_router.include_router(customer_router)
api_router.include_router(dashboard_router)
api_router.include_router(ai_recommendation_router)
api_router.include_router(report_router)

