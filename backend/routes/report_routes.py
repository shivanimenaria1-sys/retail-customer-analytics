import os
from fastapi import APIRouter, Depends, Query, Response, HTTPException
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.services.report_service import get_report_data, generate_pdf_report
from backend.utils.logger import logger

router = APIRouter()

@router.get("/report/preview", summary="Get report preview data", tags=["Reports"])
def get_report_preview(
    title: str = Query("Executive Analytics Report", description="Dynamic report title"),
    company_name: str = Query("Global Retail Corp", description="Dynamic company name"),
    db: Session = Depends(get_db)
):
    """
    Returns aggregated analytics JSON structure for previewing the report in the frontend.
    """
    logger.info("Serving report preview details...")
    try:
        data = get_report_data(db, title, company_name)
        return data
    except Exception as e:
        logger.error(f"Error compiling report preview details: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while compiling report preview: {str(e)}"
        )

@router.get("/report/export", summary="Export PDF analytics report", tags=["Reports"])
def export_pdf_report(
    title: str = Query("Executive Analytics Report", description="Dynamic report title"),
    company_name: str = Query("Global Retail Corp", description="Dynamic company name"),
    db: Session = Depends(get_db)
):
    """
    Generates a professional executive PDF analytics report on-the-fly and returns it as a file attachment download.
    """
    logger.info(f"Exporting PDF Report: Title='{title}', Company='{company_name}'")
    try:
        pdf_path = generate_pdf_report(db, title, company_name)
        
        # Read file bytes to serve and release file descriptor
        with open(pdf_path, "rb") as f:
            pdf_content = f.read()
            
        # Clean up temp file immediately after reading
        try:
            os.remove(pdf_path)
        except Exception as cleanup_err:
            logger.warning(f"Failed to delete temporary PDF file {pdf_path}: {str(cleanup_err)}")
            
        return Response(
            content=pdf_content,
            media_type="application/pdf",
            headers={
                "Content-Disposition": 'attachment; filename="Executive_Customer_Analytics_Report.pdf"',
                "Access-Control-Expose-Headers": "Content-Disposition"
            }
        )
    except Exception as e:
        logger.error(f"Error generating PDF report for download: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while generating PDF report: {str(e)}"
        )
