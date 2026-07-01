from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from backend.database import get_db
from backend.schemas.validation_schemas import DashboardStats, ClusterStats
from backend.controllers.dashboard_controller import (
    handle_get_dashboard,
    handle_get_clusters,
    handle_get_cluster_by_id,
    handle_get_insights
)

router = APIRouter()

@router.get("/dashboard", response_model=DashboardStats, summary="Get dashboard statistics", tags=["Dashboard"])
def get_dashboard(db: Session = Depends(get_db)):
    """
    Returns global customer value metric aggregates and marketing conversion indicators.
    """
    return handle_get_dashboard(db)

@router.get("/clusters", response_model=List[ClusterStats], summary="Get all clusters profiles", tags=["Dashboard"])
def get_clusters(db: Session = Depends(get_db)):
    """
    Returns profile breakdowns (averages and characteristics) for all customer segments.
    """
    return handle_get_clusters(db)

@router.get("/cluster/{id}", summary="Get specific cluster profile and cohort list", tags=["Dashboard"])
def get_cluster(id: int, db: Session = Depends(get_db)):
    """
    Returns detailed averages, demographics, and complete customer ID listing for a specific cluster.
    """
    return handle_get_cluster_by_id(id, db)

@router.get("/insights", summary="Get business insights", tags=["Dashboard"])
def get_insights(db: Session = Depends(get_db)):
    """
    Provides dynamic data-driven business text recommendations based on segments.
    """
    return handle_get_insights(db)
