from fastapi import HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from backend.services.dashboard_service import (
    get_dashboard_statistics,
    get_clusters_profiles,
    get_cluster_details,
    get_business_insights
)
from backend.schemas.validation_schemas import DashboardStats, ClusterStats
from backend.utils.logger import logger

def handle_get_dashboard(db: Session) -> DashboardStats:
    """
    Controller that aggregates global customer KPIs for frontend dashboard indicators.
    """
    logger.info("Aggregating dashboard stats...")
    try:
        stats = get_dashboard_statistics(db)
        return DashboardStats(**stats)
    except Exception as e:
        logger.error(f"Error fetching dashboard statistics: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while compiling dashboard data: {str(e)}"
        )

def handle_get_clusters(db: Session) -> List[ClusterStats]:
    """
    Controller that retrieves profile breakdowns for all segment cohorts.
    """
    logger.info("Retrieving profiles for all customer clusters...")
    try:
        profiles = get_clusters_profiles(db)
        return [ClusterStats(**p) for p in profiles]
    except Exception as e:
        logger.error(f"Error fetching clusters profiles: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while compiling cluster profiles: {str(e)}"
        )

def handle_get_cluster_by_id(cluster_id: int, db: Session) -> Dict[str, Any]:
    """
    Controller that retrieves granular statistics and customer lists for a single cluster.
    """
    logger.info(f"Retrieving profile details for cluster: {cluster_id}")
    try:
        details = get_cluster_details(db, cluster_id)
        if "error" in details:
            raise HTTPException(status_code=404, detail=details["error"])
        return details
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Error fetching details for cluster {cluster_id}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while compiling cluster details: {str(e)}"
        )

def handle_get_insights(db: Session) -> List[Dict[str, Any]]:
    """
    Controller that compiles dynamic data-driven text insights and marketing advice.
    """
    logger.info("Compiling dynamic business insights...")
    try:
        insights = get_business_insights(db)
        return insights
    except Exception as e:
        logger.error(f"Error compiling business insights: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while generating business insights: {str(e)}"
        )
