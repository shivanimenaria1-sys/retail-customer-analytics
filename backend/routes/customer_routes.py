from fastapi import APIRouter, Depends, UploadFile, File, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from backend.database import get_db
from backend.schemas.validation_schemas import (
    CustomerResponse, 
    SinglePredictRequest, 
    PredictResponse, 
    UploadSummary,
    SinglePredictResponse
)
from backend.controllers.upload_controller import handle_csv_upload
from backend.controllers.customer_controller import handle_get_customers, handle_get_customer_by_id
from backend.controllers.segmentation_controller import handle_predict_segment, handle_predict_customer_segment_details

router = APIRouter()

@router.post("/upload", response_model=UploadSummary, summary="Upload customers CSV", tags=["Customers"])
def upload_csv(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """
    Uploads a flat denormalized CSV file, runs the ETL pipeline,
    computes segmentation labels, and bulk inserts them into PostgreSQL.
    """
    return handle_csv_upload(file, db)

@router.post("/segment", response_model=PredictResponse, summary="Predict segment", tags=["Customers"])
def segment_customer(request: SinglePredictRequest):
    """
    Forecasts segment assignment, PCA coordinates, and recommendations for a single customer profile.
    """
    return handle_predict_segment(request)

@router.post("/predict", response_model=SinglePredictResponse, summary="Predict customer segment with confidence and distance metrics", tags=["Customers"])
def predict_customer(request: SinglePredictRequest):
    """
    Calculates dynamic customer segment predictions, confidence level, distance to cluster center, value category, and PCA coordinates.
    """
    return handle_predict_customer_segment_details(request)


@router.get("/customers", response_model=List[CustomerResponse], summary="List customers", tags=["Customers"])
def list_customers(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    cluster: Optional[int] = Query(None, description="Filter by cluster ID"),
    education: Optional[str] = Query(None, description="Filter by education qualification"),
    marital_status: Optional[str] = Query(None, description="Filter by marital status"),
    sort_by: Optional[str] = Query("id", description="Field to sort by"),
    sort_order: Optional[str] = Query("asc", description="Sort order (asc/desc)"),
    db: Session = Depends(get_db)
):
    """
    Returns a paginated list of customers, with optional filters for cluster, education, and marital status, and sorting options.
    """
    return handle_get_customers(db, skip, limit, cluster, education, marital_status, sort_by, sort_order)

@router.get("/customer/{id}", response_model=CustomerResponse, summary="Get customer profile", tags=["Customers"])
def get_customer(id: int, db: Session = Depends(get_db)):
    """
    Returns the detailed customer demographics, features, and segmentation labels for a given ID.
    """
    return handle_get_customer_by_id(id, db)
