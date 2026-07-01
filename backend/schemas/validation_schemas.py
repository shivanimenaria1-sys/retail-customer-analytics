from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import date

class SinglePredictRequest(BaseModel):
    Income: float = Field(..., description="Annual household income of the customer")
    Age: int = Field(..., description="Age of the customer")
    Total_Spending: float = Field(..., description="Total customer spending across all categories")
    Total_Purchases: int = Field(..., description="Total purchase frequency across web, store, catalog")
    Average_Spending_Per_Purchase: float = Field(..., description="Average cart value per purchase")
    Customer_Tenure: int = Field(..., description="Length of brand relationship in days")

class PredictResponse(BaseModel):
    cluster: int
    pc1: float
    pc2: float
    cohort_name: str
    characteristics: str
    recommendations: List[str]

class CustomerFeatureResponse(BaseModel):
    age: int
    customer_tenure: int
    total_spending: float
    total_purchases: int
    average_spending_per_purchase: float

    class Config:
        from_attributes = True

class CustomerSegmentResponse(BaseModel):
    cluster: int
    pc1: float
    pc2: float

    class Config:
        from_attributes = True

class CustomerResponse(BaseModel):
    id: int
    year_birth: int
    education: str
    marital_status: str
    income: Optional[float] = None
    kidhome: int
    teenhome: int
    dt_customer: date
    recency: int
    mnt_wines: int
    mnt_fruits: int
    mnt_meat_products: int
    mnt_fish_products: int
    mnt_sweet_products: int
    mnt_gold_prods: int
    num_deals_purchases: int
    num_web_purchases: int
    num_catalog_purchases: int
    num_store_purchases: int
    num_web_visits_month: int
    accepted_cmp3: int
    accepted_cmp4: int
    accepted_cmp5: int
    accepted_cmp1: int
    accepted_cmp2: int
    complain: int
    response: int
    features: Optional[CustomerFeatureResponse] = None
    segment: Optional[CustomerSegmentResponse] = None

    class Config:
        from_attributes = True

class ClusterStats(BaseModel):
    cluster: int
    customer_count: int
    average_income: float
    average_spending: float
    average_age: float
    average_purchases: float
    campaign_response_rate: float
    cohort_name: str
    business_characteristics: str
    recommendations: List[str]

class DashboardStats(BaseModel):
    total_customers: int
    average_income: float
    average_spending: float
    campaign_response_rates: Dict[str, float]
    cluster_distributions: List[Dict[str, Any]]

class UploadSummary(BaseModel):
    filename: str
    total_records_processed: int
    rows_imported: int
    clusters_distribution: Dict[str, int]
    status: str
