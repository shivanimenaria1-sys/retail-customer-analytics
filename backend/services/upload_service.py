import io
import pandas as pd
from sqlalchemy.orm import Session
from backend.models import Customer, CustomerFeatures, CustomerSegments
from backend.services.data_cleaner import clean_dataset
from backend.services.feature_engineering import engineer_features
from backend.services.customer_segmentation import run_segmentation_pipeline
from backend.utils.logger import logger

def process_and_store_csv(file_content: bytes, db: Session) -> dict:
    """
    Reads an uploaded CSV file, applies the full ETL cleaning and segmentation
    pipeline, and transactionally commits/upserts it to the PostgreSQL tables.

    Args:
        file_content (bytes): Byte content of the uploaded CSV file.
        db (Session): SQLAlchemy database session.

    Returns:
        dict: Ingestion summary report.
    """
    logger.info("Starting CSV data ingestion pipeline...")
    
    # Read CSV
    df = pd.read_csv(io.BytesIO(file_content))
    total_records = len(df)
    logger.info(f"Successfully loaded CSV file. Raw records count: {total_records}")

    # Clean
    cleaned = clean_dataset(df)
    
    # Engineer features
    engineered = engineer_features(cleaned)
    
    # Segment (do not overwrite current stable model files on disk)
    segmented = run_segmentation_pipeline(engineered, save_models=False)
    logger.info("ETL segmentation computations completed successfully.")

    rows_imported = 0
    cluster_counts = {}

    try:
        # Loop through rows and insert/merge record instances
        for _, row in segmented.iterrows():
            c_id = int(row['ID'])

            # Create Customer model
            customer = Customer(
                id=c_id,
                year_birth=int(row['Year_Birth']),
                education=str(row['Education']),
                marital_status=str(row['Marital_Status']),
                income=float(row['Income']) if not pd.isna(row['Income']) else None,
                kidhome=int(row['Kidhome']),
                teenhome=int(row['Teenhome']),
                dt_customer=pd.to_datetime(row['Dt_Customer']).date(),
                recency=int(row['Recency']),
                mnt_wines=int(row['MntWines']),
                mnt_fruits=int(row['MntFruits']),
                mnt_meat_products=int(row['MntMeatProducts']),
                mnt_fish_products=int(row['MntFishProducts']),
                mnt_sweet_products=int(row['MntSweetProducts']),
                mnt_gold_prods=int(row['MntGoldProds']),
                num_deals_purchases=int(row['NumDealsPurchases']),
                num_web_purchases=int(row['NumWebPurchases']),
                num_catalog_purchases=int(row['NumCatalogPurchases']),
                num_store_purchases=int(row['NumStorePurchases']),
                num_web_visits_month=int(row['NumWebVisitsMonth']),
                accepted_cmp3=int(row['AcceptedCmp3']),
                accepted_cmp4=int(row['AcceptedCmp4']),
                accepted_cmp5=int(row['AcceptedCmp5']),
                accepted_cmp1=int(row['AcceptedCmp1']),
                accepted_cmp2=int(row['AcceptedCmp2']),
                complain=int(row['Complain']),
                response=int(row['Response'])
            )

            # Create Features model
            features = CustomerFeatures(
                customer_id=c_id,
                age=int(row['Age']),
                customer_tenure=int(row['Customer_Tenure']),
                total_spending=float(row['Total_Spending']),
                total_purchases=int(row['Total_Purchases']),
                average_spending_per_purchase=float(row['Average_Spending_Per_Purchase'])
            )

            # Create Segment model
            cluster_id = int(row['Cluster'])
            segment = CustomerSegments(
                customer_id=c_id,
                cluster=cluster_id,
                pc1=float(row['PC1']),
                pc2=float(row['PC2'])
            )

            # Establish relationships
            customer.features = features
            customer.segment = segment

            # Upsert into PostgreSQL session
            db.merge(customer)
            rows_imported += 1
            cluster_counts[str(cluster_id)] = cluster_counts.get(str(cluster_id), 0) + 1

        db.commit()
        logger.info(f"Ingested and committed {rows_imported} rows to database.")
        
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to ingest CSV data. Error: {str(e)}")
        raise e

    return {
        "total_records_processed": total_records,
        "rows_imported": rows_imported,
        "clusters_distribution": cluster_counts,
        "status": "success"
    }
