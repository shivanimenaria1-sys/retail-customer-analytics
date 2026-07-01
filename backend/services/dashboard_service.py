from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Dict, Any, List
from backend.models import Customer, CustomerFeatures, CustomerSegments
from backend.services.customer_service import COHORT_DETAILS
from backend.utils.logger import logger

def get_dashboard_statistics(db: Session) -> Dict[str, Any]:
    """
    Aggregates database statistics to return overall KPIs.
    """
    total_customers = db.query(func.count(Customer.id)).scalar() or 0
    
    if total_customers == 0:
        return {
            "total_customers": 0,
            "average_income": 0.0,
            "average_spending": 0.0,
            "campaign_response_rates": {},
            "cluster_distributions": []
        }

    average_income = db.query(func.avg(Customer.income)).scalar() or 0.0
    average_spending = db.query(func.avg(CustomerFeatures.total_spending)).scalar() or 0.0

    # Campaign acceptances
    c1 = db.query(func.sum(Customer.accepted_cmp1)).scalar() or 0
    c2 = db.query(func.sum(Customer.accepted_cmp2)).scalar() or 0
    c3 = db.query(func.sum(Customer.accepted_cmp3)).scalar() or 0
    c4 = db.query(func.sum(Customer.accepted_cmp4)).scalar() or 0
    c5 = db.query(func.sum(Customer.accepted_cmp5)).scalar() or 0
    resp = db.query(func.sum(Customer.response)).scalar() or 0

    campaign_rates = {
        "Campaign 1": round((c1 * 100.0 / total_customers), 2),
        "Campaign 2": round((c2 * 100.0 / total_customers), 2),
        "Campaign 3": round((c3 * 100.0 / total_customers), 2),
        "Campaign 4": round((c4 * 100.0 / total_customers), 2),
        "Campaign 5": round((c5 * 100.0 / total_customers), 2),
        "Latest Campaign (Response)": round((resp * 100.0 / total_customers), 2)
    }

    # Cluster distribution
    cluster_counts = db.query(
        CustomerSegments.cluster,
        func.count(CustomerSegments.customer_id)
    ).group_by(CustomerSegments.cluster).all()

    distributions = []
    for cluster_id, count in cluster_counts:
        distributions.append({
            "cluster": cluster_id,
            "cohort_name": COHORT_DETAILS.get(cluster_id, {}).get("name", f"Cluster {cluster_id}"),
            "count": count,
            "percentage": round((count * 100.0 / total_customers), 2)
        })

    return {
        "total_customers": total_customers,
        "average_income": round(float(average_income), 2),
        "average_spending": round(float(average_spending), 2),
        "campaign_response_rates": campaign_rates,
        "cluster_distributions": sorted(distributions, key=lambda x: x["cluster"])
    }

def get_clusters_profiles(db: Session) -> List[Dict[str, Any]]:
    """
    Computes averages per cluster to profile each cohort.
    """
    profiles = []
    
    # Query averages grouped by cluster
    results = db.query(
        CustomerSegments.cluster,
        func.count(CustomerSegments.customer_id),
        func.avg(Customer.income),
        func.avg(CustomerFeatures.total_spending),
        func.avg(CustomerFeatures.age),
        func.avg(CustomerFeatures.total_purchases),
        func.avg(Customer.response)
    ).join(
        Customer, CustomerSegments.customer_id == Customer.id
    ).join(
        CustomerFeatures, CustomerSegments.customer_id == CustomerFeatures.customer_id
    ).group_by(CustomerSegments.cluster).all()

    for row in results:
        cluster_id = int(row[0])
        count = int(row[1])
        avg_income = float(row[2]) if row[2] else 0.0
        avg_spending = float(row[3]) if row[3] else 0.0
        avg_age = float(row[4]) if row[4] else 0.0
        avg_purchases = float(row[5]) if row[5] else 0.0
        response_rate = float(row[6]) * 100.0 if row[6] else 0.0

        cohort = COHORT_DETAILS.get(cluster_id, {
            "name": f"Cluster {cluster_id}",
            "characteristics": "N/A",
            "recommendations": []
        })

        profiles.append({
            "cluster": cluster_id,
            "customer_count": count,
            "average_income": round(avg_income, 2),
            "average_spending": round(avg_spending, 2),
            "average_age": round(avg_age, 2),
            "average_purchases": round(avg_purchases, 2),
            "campaign_response_rate": round(response_rate, 2),
            "cohort_name": cohort["name"],
            "business_characteristics": cohort["characteristics"],
            "recommendations": cohort["recommendations"]
        })

    return sorted(profiles, key=lambda x: x["cluster"])

def get_cluster_details(db: Session, cluster_id: int) -> Dict[str, Any]:
    """
    Gets statistics and customer IDs for a single cluster.
    """
    profile = db.query(
        func.count(CustomerSegments.customer_id),
        func.avg(Customer.income),
        func.avg(CustomerFeatures.total_spending),
        func.avg(CustomerFeatures.age),
        func.avg(CustomerFeatures.total_purchases),
        func.avg(Customer.response)
    ).join(
        Customer, CustomerSegments.customer_id == Customer.id
    ).join(
        CustomerFeatures, CustomerSegments.customer_id == CustomerFeatures.customer_id
    ).filter(CustomerSegments.cluster == cluster_id).first()

    if not profile or profile[0] == 0:
        return {
            "cluster": cluster_id,
            "error": "Cluster not found or has no customers."
        }

    count = int(profile[0])
    avg_income = float(profile[1]) if profile[1] else 0.0
    avg_spending = float(profile[2]) if profile[2] else 0.0
    avg_age = float(profile[3]) if profile[3] else 0.0
    avg_purchases = float(profile[4]) if profile[4] else 0.0
    response_rate = float(profile[5]) * 100.0 if profile[5] else 0.0

    cohort = COHORT_DETAILS.get(cluster_id, {
        "name": f"Cluster {cluster_id}",
        "characteristics": "N/A",
        "recommendations": []
    })

    customer_ids = [r[0] for r in db.query(CustomerSegments.customer_id).filter(CustomerSegments.cluster == cluster_id).all()]

    return {
        "cluster": cluster_id,
        "customer_count": count,
        "average_income": round(avg_income, 2),
        "average_spending": round(avg_spending, 2),
        "average_age": round(avg_age, 2),
        "average_purchases": round(avg_purchases, 2),
        "campaign_response_rate": round(response_rate, 2),
        "cohort_name": cohort["name"],
        "business_characteristics": cohort["characteristics"],
        "recommendations": cohort["recommendations"],
        "customer_ids": customer_ids
    }

def get_business_insights(db: Session) -> List[Dict[str, Any]]:
    """
    Generates automated business insights based on the database statistics.
    """
    profiles = get_clusters_profiles(db)
    insights = []

    if not profiles:
        return [{"title": "No Data Available", "content": "Populate the database to see insights."}]

    for p in profiles:
        cluster = p["cluster"]
        name = p["cohort_name"]
        
        if cluster == 0:
            insights.append({
                "title": f"Optimizing the {name}",
                "metric": f"Average Spend: ${p['average_spending']}, Response Rate: {p['campaign_response_rate']}%",
                "insight": "This segment is mature and financially stable. Focus on regular product expansions and premium loyalty upgrades (like Wine subscriptions) to lock in lifetime value."
            })
        elif cluster == 1:
            insights.append({
                "title": f"Maximizing the {name}",
                "metric": f"Highest Spend: ${p['average_spending']}, High Response: {p['campaign_response_rate']}%",
                "insight": "Elite Spenders represent our highest-value cohort. Direct personalized email marketing and early-access catalogs are highly effective here. Do not dilute their brand experience with mass coupons."
            })
        elif cluster == 2:
            insights.append({
                "title": f"Leveraging the {name}",
                "metric": f"Longest Tenure, Moderate Response: {p['campaign_response_rate']}%",
                "insight": "Budget-conscious but extremely loyal. Leverage volume discounts (Buy 2 Get 1) and flash promotions to boost basket sizes without alienating them on price."
            })
        elif cluster == 3:
            insights.append({
                "title": f"Nurturing {name}",
                "metric": f"Lowest Spend: ${p['average_spending']}, Low Response: {p['campaign_response_rate']}%",
                "insight": "Newly acquired customers. Run immediate welcome discounts and web tutorials to drive engagement and avoid early churn."
            })

    # Add general product insight
    insights.append({
        "title": "Core Product Focus",
        "metric": "Wine & Meat generate >80% revenue",
        "insight": "Retail sales are driven primarily by Wine and Meat categories. Maintain inventory variety and gourmet promotions for these two primary departments."
    })

    return insights
