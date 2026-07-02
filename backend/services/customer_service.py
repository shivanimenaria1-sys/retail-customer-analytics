import joblib
import pandas as pd
import numpy as np
from pathlib import Path
from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from backend.models import Customer, CustomerFeatures, CustomerSegments
from backend.config import SCALER_PATH, KMEANS_MODEL_PATH
from backend.schemas.validation_schemas import SinglePredictRequest, PredictResponse, SinglePredictResponse
from sklearn.decomposition import PCA
from backend.utils.logger import logger

COHORT_DETAILS = {
    0: {
        "name": "Mature Value Shoppers (Stable Core)",
        "characteristics": "Mature customers (average age 54) with mid-to-high income (~$65k) and solid overall spending (~$868). They exhibit high purchase frequency with mid-range cart values.",
        "recommendations": [
            "Enroll in premium product subscription programs (e.g. gourmet wines/meats monthly clubs).",
            "Send regular high-quality catalog direct mailings.",
            "Offer loyalty retention updates with emphasis on quality and reliability."
        ]
    },
    1: {
        "name": "High-Value VIPs (Elite Spenders)",
        "characteristics": "Highest earning segment (~$76k) composed of younger/middle-aged professionals (average age 39.5). Staggering average spending (~$1,492) and highest marketing campaign response rate (~32.2%).",
        "recommendations": [
            "Provide direct invitations to high-end VIP events and early-access launches.",
            "Focus on personalized premium product pairings (e.g., cellared wines and organic meats).",
            "Avoid generic mass discounts to protect brand equity."
        ]
    },
    2: {
        "name": "Frugal Loyalists (Disengaged Bargain Hunters)",
        "characteristics": "Budget-conscious segment with low average income (~$33.8k) but the longest customer tenure (average 526 days). Highly responsive to discount/promo campaigns (16% response).",
        "recommendations": [
            "Deliver high-frequency flash sale alerts and coupons.",
            "Promote bulk discount offers (e.g. Buy 2 Get 1 Free).",
            "Focus promotions on low-cost categories with flexible margins (e.g., gold and fruits)."
        ]
    },
    3: {
        "name": "Unengaged Starters (New Frugals)",
        "characteristics": "Newly acquired customers (average tenure 173 days) with low household incomes (~$37.9k) and lowest spending (~$108). Very low campaign response rate (5.05%).",
        "recommendations": [
            "Deploy automated welcome onboarding discounts.",
            "Send guides detailing web portal purchasing convenience to boost visits.",
            "Trigger automated email retargeting if inactive for over 60 days."
        ]
    }
}

def get_fitted_pca() -> Optional[PCA]:
    """
    Fits PCA dynamically using the processed customer features file
    to return accurate PC1 and PC2 coordinates.
    """
    features_csv = Path(r"c:\Users\HP\Desktop\retail-customer-analytics\dataset\processed\customer_features.csv")
    if features_csv.exists():
        try:
            df_feat = pd.read_csv(features_csv)
            cols = ['Income', 'Age', 'Total_Spending', 'Total_Purchases', 'Average_Spending_Per_Purchase', 'Customer_Tenure']
            X = df_feat[cols]
            
            # Re-scale locally for PCA fit
            from sklearn.preprocessing import StandardScaler
            X_scaled = StandardScaler().fit_transform(X)
            
            pca = PCA(n_components=2, random_state=42)
            pca.fit(X_scaled)
            return pca
        except Exception as e:
            logger.error(f"Error fitting PCA dynamically: {str(e)}")
            return None
    return None

def get_customers(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    cluster: Optional[int] = None,
    education: Optional[str] = None,
    marital_status: Optional[str] = None,
    sort_by: Optional[str] = "id",
    sort_order: Optional[str] = "asc"
) -> List[Customer]:
    """
    Queries database for customer records, with pagination, filtering, and server-side sorting.
    """
    query = db.query(Customer)
    
    # Apply filters
    if cluster is not None:
        query = query.join(CustomerSegments, Customer.id == CustomerSegments.customer_id).filter(CustomerSegments.cluster == cluster)
    if education is not None:
        query = query.filter(Customer.education.ilike(education))
    if marital_status is not None:
        query = query.filter(Customer.marital_status.ilike(marital_status))
        
    # Apply server-side sorting
    if sort_by:
        column = None
        if sort_by == "id":
            column = Customer.id
        elif sort_by == "year_birth":
            column = Customer.year_birth
        elif sort_by == "education":
            column = Customer.education
        elif sort_by == "marital_status":
            column = Customer.marital_status
        elif sort_by == "income":
            column = Customer.income
        elif sort_by == "total_spending":
            # Outer join or inner join on features table
            query = query.join(CustomerFeatures, Customer.id == CustomerFeatures.customer_id)
            column = CustomerFeatures.total_spending
        elif sort_by == "total_purchases":
            query = query.join(CustomerFeatures, Customer.id == CustomerFeatures.customer_id)
            column = CustomerFeatures.total_purchases
        elif sort_by == "cluster":
            # If not already joined in filter
            if cluster is None:
                query = query.join(CustomerSegments, Customer.id == CustomerSegments.customer_id)
            column = CustomerSegments.cluster

        if column is not None:
            if sort_order == "desc":
                query = query.order_by(column.desc())
            else:
                query = query.order_by(column.asc())

    return query.offset(skip).limit(limit).all()

def get_customer_by_id(db: Session, customer_id: int) -> Optional[Customer]:
    """
    Queries a single customer record by ID.
    """
    return db.query(Customer).filter(Customer.id == customer_id).first()

def predict_segment(request: SinglePredictRequest) -> PredictResponse:
    """
    Reloads the StandardScaler and KMeans model to predict the segment cluster,
    coordinates, and recommendations for a prospect customer.
    """
    if not SCALER_PATH.exists() or not KMEANS_MODEL_PATH.exists():
        raise FileNotFoundError("Clustering models are not serialized yet. Please run the segmentation pipeline first.")

    # Load scaler and model
    scaler = joblib.load(SCALER_PATH)
    kmeans = joblib.load(KMEANS_MODEL_PATH)

    # Format vector matching CLUSTERING_FEATURES order
    features_vector = np.array([[
        request.Income,
        request.Age,
        request.Total_Spending,
        request.Total_Purchases,
        request.Average_Spending_Per_Purchase,
        request.Customer_Tenure
    ]])

    # Scale vector
    scaled_vector = scaler.transform(features_vector)

    # Predict cluster
    cluster_label = int(kmeans.predict(scaled_vector)[0])

    # Project PCA coordinates
    pc1, pc2 = 0.0, 0.0
    pca = get_fitted_pca()
    if pca is not None:
        pca_comps = pca.transform(scaled_vector)
        pc1 = float(pca_comps[0, 0])
        pc2 = float(pca_comps[0, 1])

    cohort = COHORT_DETAILS.get(cluster_label, {
        "name": "Unknown Segment",
        "characteristics": "No profile available.",
        "recommendations": []
    })

    return PredictResponse(
        cluster=cluster_label,
        pc1=pc1,
        pc2=pc2,
        cohort_name=cohort["name"],
        characteristics=cohort["characteristics"],
        recommendations=cohort["recommendations"]
    )

def predict_customer_segment_details(request: SinglePredictRequest) -> SinglePredictResponse:
    """
    Forecasts segment assignment, PCA coordinates, distance to center, value category,
    and confidence scores for a single customer profile.
    """
    if not SCALER_PATH.exists() or not KMEANS_MODEL_PATH.exists():
        raise FileNotFoundError("Clustering models are not serialized yet. Please run the segmentation pipeline first.")

    # Load scaler and model
    scaler = joblib.load(SCALER_PATH)
    kmeans = joblib.load(KMEANS_MODEL_PATH)

    # Format vector matching CLUSTERING_FEATURES order
    features_vector = np.array([[
        request.Income,
        request.Age,
        request.Total_Spending,
        request.Total_Purchases,
        request.Average_Spending_Per_Purchase,
        request.Customer_Tenure
    ]])

    # Scale vector
    scaled_vector = scaler.transform(features_vector)

    # Predict cluster
    cluster_label = int(kmeans.predict(scaled_vector)[0])

    # Calculate distances to all cluster centers
    distances = kmeans.transform(scaled_vector)[0]
    distance_to_center = float(distances[cluster_label])

    # Calculate confidence score using softmax over negative distances
    exp_neg_dist = np.exp(-distances)
    confidence = float(exp_neg_dist[cluster_label] / np.sum(exp_neg_dist))

    # Project PCA coordinates
    pc1, pc2 = 0.0, 0.0
    pca = get_fitted_pca()
    if pca is not None:
        pca_comps = pca.transform(scaled_vector)
        pc1 = float(pca_comps[0, 0])
        pc2 = float(pca_comps[0, 1])

    cohort = COHORT_DETAILS.get(cluster_label, {
        "name": "Unknown Segment",
        "characteristics": "No profile available.",
        "recommendations": []
    })

    # Value Category mapping
    # Cluster 0: Mature Value Shoppers -> Medium
    # Cluster 1: High-Value VIPs -> High
    # Cluster 2: Frugal Loyalists -> Low
    # Cluster 3: Unengaged Starters -> Low
    value_category_map = {
        0: "Medium",
        1: "High",
        2: "Low",
        3: "Low"
    }
    value_category = value_category_map.get(cluster_label, "Low")

    return SinglePredictResponse(
        cluster=cluster_label,
        cohort_name=cohort["name"],
        confidence=round(confidence, 4),
        distance=round(distance_to_center, 4),
        business_description=cohort["characteristics"],
        recommendations=cohort["recommendations"],
        value_category=value_category,
        pc1=pc1,
        pc2=pc2
    )

