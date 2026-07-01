import os
import pandas as pd
from pathlib import Path
from sqlalchemy import inspect, text
from sqlalchemy.orm import Session
from backend.database import engine
from backend.models import Customer, CustomerFeatures, CustomerSegments
from backend.utils.logger import logger

def init_and_seed_db(db: Session):
    """
    1. Creates PostgreSQL tables using sql/schema.sql (if they do not exist).
    2. Reads dataset/processed/customer_segments.csv using pandas.
    3. Inserts all records into PostgreSQL using SQLAlchemy (bulk insert).
    4. Skips duplicate records if they already exist.
    5. Prints how many records were inserted.
    """
    base_dir = Path(__file__).resolve().parent.parent
    schema_path = base_dir / "sql" / "schema.sql"
    csv_path = base_dir / "dataset" / "processed" / "customer_segments.csv"

    # Step 1: Check if tables exist. If customers table is missing, run schema.sql
    inspector = inspect(engine)
    if not inspector.has_table("customers"):
        logger.info("Database table 'customers' not found. Re-creating all tables using schema.sql...")
        if schema_path.exists():
            try:
                with open(schema_path, "r", encoding="utf-8") as f:
                    schema_sql = f.read()
                
                # Execute the schema DDL statement by statement to handle SQLite driver restrictions in test suites
                statements = schema_sql.split(";")
                for stmt in statements:
                    stmt_clean = stmt.strip()
                    if not stmt_clean:
                        continue
                    if db.bind.dialect.name == "sqlite":
                        stmt_clean = stmt_clean.replace("CASCADE", "")
                    db.execute(text(stmt_clean))
                
                db.commit()
                logger.info("Database tables created successfully using schema.sql.")
            except Exception as e:
                db.rollback()
                logger.error(f"Failed to create tables using schema.sql: {str(e)}")
                print(f"DATABASE INIT ERROR: Failed to run schema.sql. {str(e)}")
        else:
            logger.warning(f"schema.sql not found at {schema_path}. Falling back to metadata.create_all.")
            from backend.database import Base
            Base.metadata.create_all(bind=engine)
    else:
        logger.info("Database tables already exist. Skipping schema.sql execution.")

    # Step 2 & 3 & 4: Read and insert customer segments
    if not csv_path.exists():
        logger.warning(f"customer_segments.csv not found at {csv_path}. Skipping seeder.")
        return

    try:
        df = pd.read_csv(csv_path)
        logger.info(f"Loaded {len(df)} records from CSV for database seeding check.")

        # Get existing IDs from database to skip duplicate check quickly
        existing_ids = {r[0] for r in db.query(Customer.id).all()}
        
        new_records_count = 0
        
        for _, row in df.iterrows():
            c_id = int(row['ID'])
            if c_id in existing_ids:
                continue

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

            features = CustomerFeatures(
                customer_id=c_id,
                age=int(row['Age']),
                customer_tenure=int(row['Customer_Tenure']),
                total_spending=float(row['Total_Spending']),
                total_purchases=int(row['Total_Purchases']),
                average_spending_per_purchase=float(row['Average_Spending_Per_Purchase'])
            )

            segment = CustomerSegments(
                customer_id=c_id,
                cluster=int(row['Cluster']),
                pc1=float(row['PC1']),
                pc2=float(row['PC2'])
            )

            customer.features = features
            customer.segment = segment

            db.add(customer)
            new_records_count += 1

        if new_records_count > 0:
            db.commit()
            print(f"AUTO-SEEDER: Successfully inserted {new_records_count} new customer records into PostgreSQL database.")
            logger.info(f"Database seeder committed {new_records_count} records.")
        else:
            print("AUTO-SEEDER: Database is already up-to-date. 0 records inserted.")
            logger.info("Database seeder: 0 records inserted (all exist).")

    except Exception as e:
        db.rollback()
        logger.error(f"Auto-seeding failed: {str(e)}")
        print(f"AUTO-SEEDER ERROR: Failed to seed records. {str(e)}")
