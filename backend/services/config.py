import os
from pathlib import Path

# Base workspace directory (points to retail-customer-analytics root)
BASE_DIR = Path(__file__).resolve().parent.parent.parent

# Input/Output paths
RAW_DATA_PATH = BASE_DIR / "dataset" / "raw" / "data_market.xlsx"
CLEANED_DATA_PATH = BASE_DIR / "dataset" / "processed" / "cleaned_customer_data.csv"
FEATURE_DATA_PATH = BASE_DIR / "dataset" / "processed" / "customer_features.csv"
SEGMENTED_DATA_PATH = BASE_DIR / "dataset" / "processed" / "customer_segments.csv"

# Model paths
MODEL_DIR = BASE_DIR / "models"
SCALER_PATH = MODEL_DIR / "scaler.pkl"
KMEANS_MODEL_PATH = MODEL_DIR / "kmeans_model.pkl"

# Cleaning and outlier configurations
REFERENCE_YEAR = 2014
BIRTH_YEAR_OUTLIER_THRESHOLD = 1940
INCOME_OUTLIER_THRESHOLD = 600000.0

MARITAL_STATUS_MAPPING = {
    'Alone': 'Single',
    'Absurd': 'Single',
    'YOLO': 'Single'
}

# Feature engineering columns
SPENDING_COLUMNS = [
    'MntWines', 
    'MntFruits', 
    'MntMeatProducts', 
    'MntFishProducts', 
    'MntSweetProducts', 
    'MntGoldProds'
]

PURCHASE_COLUMNS = [
    'NumWebPurchases', 
    'NumCatalogPurchases', 
    'NumStorePurchases'
]

# Segmentation configurations
CLUSTERING_FEATURES = [
    'Income', 
    'Age', 
    'Total_Spending', 
    'Total_Purchases', 
    'Average_Spending_Per_Purchase', 
    'Customer_Tenure'
]

N_CLUSTERS = 4
RANDOM_STATE = 42
