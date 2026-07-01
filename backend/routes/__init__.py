from fastapi import APIRouter
from backend.routes.base_routes import router as base_router
from backend.routes.customer_routes import router as customer_router
from backend.routes.dashboard_routes import router as dashboard_router

api_router = APIRouter()

# Combine routers
api_router.include_router(base_router)
api_router.include_router(customer_router)
api_router.include_router(dashboard_router)
