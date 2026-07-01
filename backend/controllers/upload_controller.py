from fastapi import UploadFile, HTTPException
from sqlalchemy.orm import Session
from backend.services.upload_service import process_and_store_csv
from backend.schemas.validation_schemas import UploadSummary
from backend.utils.logger import logger

def handle_csv_upload(file: UploadFile, db: Session) -> UploadSummary:
    """
    Controller that validates the uploaded file type, triggers the ingestion pipeline,
    and returns a summary schema.
    """
    logger.info(f"Received file upload request: {file.filename}")
    
    if not file.filename.endswith(".csv"):
        logger.error(f"Rejected invalid file format: {file.filename}")
        raise HTTPException(
            status_code=400, 
            detail="Invalid file format. Only CSV files are supported."
        )
        
    try:
        content = file.file.read()
        summary = process_and_store_csv(content, db)
        return UploadSummary(
            filename=file.filename,
            total_records_processed=summary["total_records_processed"],
            rows_imported=summary["rows_imported"],
            clusters_distribution=summary["clusters_distribution"],
            status=summary["status"]
        )
    except Exception as e:
        logger.error(f"Error handling CSV upload: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"An error occurred during file processing: {str(e)}"
        )
