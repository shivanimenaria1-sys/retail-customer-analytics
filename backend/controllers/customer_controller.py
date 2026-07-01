from fastapi import HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from backend.services.customer_service import get_customers, get_customer_by_id
from backend.schemas.validation_schemas import CustomerResponse
from backend.utils.logger import logger

def handle_get_customers(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    cluster: Optional[int] = None,
    education: Optional[str] = None,
    marital_status: Optional[str] = None,
    sort_by: Optional[str] = "id",
    sort_order: Optional[str] = "asc"
) -> List[CustomerResponse]:
    """
    Controller handling paginated lists of customer records with demographic/segment filters and sorting.
    """
    logger.info(f"Retrieving customers (skip={skip}, limit={limit}, cluster={cluster}, sort_by={sort_by})")
    try:
        customers = get_customers(
            db=db, 
            skip=skip, 
            limit=limit, 
            cluster=cluster, 
            education=education, 
            marital_status=marital_status,
            sort_by=sort_by,
            sort_order=sort_order
        )
        return [CustomerResponse.model_validate(c) for c in customers]
    except Exception as e:
        logger.error(f"Error retrieving customers list: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"An error occurred while fetching customers: {str(e)}"
        )

def handle_get_customer_by_id(customer_id: int, db: Session) -> CustomerResponse:
    """
    Controller handling single customer profile retrieval by ID.
    """
    logger.info(f"Retrieving customer by ID: {customer_id}")
    customer = get_customer_by_id(db, customer_id)
    if not customer:
        logger.warning(f"Customer profile not found: {customer_id}")
        raise HTTPException(
            status_code=404, 
            detail=f"Customer with ID {customer_id} not found."
        )
    return CustomerResponse.model_validate(customer)
