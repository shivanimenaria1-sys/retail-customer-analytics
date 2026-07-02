from fastapi import HTTPException
from backend.schemas.validation_schemas import SinglePredictRequest, PredictResponse, SinglePredictResponse
from backend.services.customer_service import predict_segment, predict_customer_segment_details
from backend.utils.logger import logger

def handle_predict_segment(request: SinglePredictRequest) -> PredictResponse:
    """
    Controller that receives a customer feature vector and returns a segment assignment forecast.
    """
    logger.info("Received customer segmentation prediction request.")
    try:
        response = predict_segment(request)
        return response
    except FileNotFoundError as fnf:
        logger.error(f"Prediction models are not prepared: {str(fnf)}")
        raise HTTPException(
            status_code=503, 
            detail="Segment prediction service is temporarily unavailable. Clustering models are not trained."
        )
    except Exception as e:
        logger.error(f"Error predicting customer segment: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"An error occurred during segment classification: {str(e)}"
        )

def handle_predict_customer_segment_details(request: SinglePredictRequest) -> SinglePredictResponse:
    """
    Controller that receives a customer profile and returns detailed segment calculations (confidence, distance, value category, PCA).
    """
    logger.info("Received customer detailed segment prediction request.")
    try:
        response = predict_customer_segment_details(request)
        return response
    except FileNotFoundError as fnf:
        logger.error(f"Prediction models are not prepared: {str(fnf)}")
        raise HTTPException(
            status_code=503, 
            detail="Segment prediction service is temporarily unavailable. Clustering models are not trained."
        )
    except Exception as e:
        logger.error(f"Error predicting customer segment details: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500, 
            detail=f"An error occurred during segment analysis: {str(e)}"
        )

