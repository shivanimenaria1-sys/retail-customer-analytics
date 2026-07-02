from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Dict, Any, List
from backend.models import Customer, CustomerFeatures, CustomerSegments
from backend.services.customer_service import COHORT_DETAILS
from backend.utils.logger import logger

def generate_ai_recommendations(db: Session) -> Dict[str, Any]:
    """
    Analyzes live database stats and dynamically constructs business recommendations
    tailored to customer segmentation, tenure, campaign responses, and engagement.
    """
    logger.info("Computing dynamic AI business recommendations...")
    
    # 1. Fetch cluster profile stats including tenure
    results = db.query(
        CustomerSegments.cluster,
        func.count(CustomerSegments.customer_id),
        func.avg(Customer.income),
        func.avg(CustomerFeatures.total_spending),
        func.avg(CustomerFeatures.age),
        func.avg(CustomerFeatures.total_purchases),
        func.avg(Customer.response),
        func.avg(CustomerFeatures.customer_tenure)
    ).join(
        Customer, CustomerSegments.customer_id == Customer.id
    ).join(
        CustomerFeatures, CustomerSegments.customer_id == CustomerFeatures.customer_id
    ).group_by(CustomerSegments.cluster).all()

    if not results:
        return {
            "total_recommendations": 0,
            "high_priority_actions": 0,
            "estimated_revenue_opportunity": 0.0,
            "recommendations": []
        }

    cluster_profiles = []
    for row in results:
        cluster_id = int(row[0])
        count = int(row[1])
        avg_income = float(row[2]) if row[2] else 0.0
        avg_spending = float(row[3]) if row[3] else 0.0
        avg_age = float(row[4]) if row[4] else 0.0
        avg_purchases = float(row[5]) if row[5] else 0.0
        response_rate = float(row[6]) * 100.0 if row[6] else 0.0
        avg_tenure = float(row[7]) if row[7] else 0.0

        cohort = COHORT_DETAILS.get(cluster_id, {
            "name": f"Cluster {cluster_id}",
            "characteristics": "N/A",
            "recommendations": []
        })

        cluster_profiles.append({
            "cluster": cluster_id,
            "customer_count": count,
            "average_income": round(avg_income, 2),
            "average_spending": round(avg_spending, 2),
            "average_age": round(avg_age, 2),
            "average_purchases": round(avg_purchases, 2),
            "campaign_response_rate": round(response_rate, 2),
            "average_tenure": round(avg_tenure, 2),
            "cohort_name": cohort["name"],
            "business_characteristics": cohort["characteristics"]
        })

    recommendations = []

    # Recommendation 1: High-Value Spenders (Green = Opportunity)
    high_value_profile = max(cluster_profiles, key=lambda x: x["average_spending"])
    hv_count = high_value_profile["customer_count"]
    hv_spend = high_value_profile["average_spending"]
    hv_cohort = high_value_profile["cohort_name"]
    hv_rev_opp = round(hv_count * hv_spend * 0.15, 2)
    recommendations.append({
        "id": "rec_high_value",
        "title": "Premium Loyalty Program for High-Value Spenders",
        "category": "opportunity",
        "priority": "High",
        "business_impact": f"High (Est. +${hv_rev_opp:,.2f} revenue lift)",
        "recommendation": f"Enroll {hv_count} high-value customers from '{hv_cohort}' (average spend of ${hv_spend:,.2f}) into a premium monthly wine/meat subscription with exclusive VIP event invites.",
        "expected_outcome": "Increase average purchase frequency by 10-15% and reinforce brand advocacy.",
        "estimated_revenue_opportunity": hv_rev_opp
    })

    # Recommendation 2: Low-Spending Customers (Yellow = Warning)
    low_spending_profile = min(cluster_profiles, key=lambda x: x["average_spending"])
    ls_count = low_spending_profile["customer_count"]
    ls_spend = low_spending_profile["average_spending"]
    ls_cohort = low_spending_profile["cohort_name"]
    ls_rev_opp = round(ls_count * ls_spend * 0.20, 2)
    recommendations.append({
        "id": "rec_low_spending",
        "title": "Budget-Friendly Discount Campaigns for Price-Sensitive Segments",
        "category": "warning",
        "priority": "Medium",
        "business_impact": f"Medium (Est. +${ls_rev_opp:,.2f} incremental revenue)",
        "recommendation": f"Deliver high-frequency flash alerts and bundle coupon incentives (e.g. Buy 2 Get 1 Free) targeting the {ls_count} price-sensitive customers in '{ls_cohort}' (average spend of ${ls_spend:,.2f}).",
        "expected_outcome": "Drive larger cart sizes and increase weekly transaction volume.",
        "estimated_revenue_opportunity": ls_rev_opp
    })

    # Recommendation 3: High Campaign Response (Blue = Optimization)
    campaign_customers = db.query(
        func.count(Customer.id),
        func.avg(CustomerFeatures.total_spending)
    ).join(
        CustomerFeatures, Customer.id == CustomerFeatures.customer_id
    ).filter(
        (Customer.accepted_cmp1 + Customer.accepted_cmp2 + Customer.accepted_cmp3 + 
         Customer.accepted_cmp4 + Customer.accepted_cmp5 + Customer.response) > 0
    ).first()
    
    cmp_count = int(campaign_customers[0]) if campaign_customers and campaign_customers[0] else 0
    cmp_spend = float(campaign_customers[1]) if campaign_customers and campaign_customers[1] else 0.0
    cmp_rev_opp = round(cmp_count * cmp_spend * 0.18, 2)
    recommendations.append({
        "id": "rec_high_response",
        "title": "Personalized Digital & Direct-Mail Product Pairings",
        "category": "optimization",
        "priority": "High",
        "business_impact": f"High (Est. +${cmp_rev_opp:,.2f} campaign ROI)",
        "recommendation": f"Initiate personalized, content-driven pairings (e.g. gourmet wines and organic meats) tailored specifically to the {cmp_count} highly responsive marketing subscribers who have historically accepted campaigns.",
        "expected_outcome": "Improve campaign response rate by up to 20% and lower acquisition cost.",
        "estimated_revenue_opportunity": cmp_rev_opp
    })

    # Recommendation 4: Long-Tenure Customers (Green = Opportunity)
    longest_tenure_profile = max(cluster_profiles, key=lambda x: x["average_tenure"])
    lt_count = longest_tenure_profile["customer_count"]
    lt_tenure = longest_tenure_profile["average_tenure"]
    lt_spend = longest_tenure_profile["average_spending"]
    lt_cohort = longest_tenure_profile["cohort_name"]
    lt_rev_opp = round(lt_count * lt_spend * 0.08, 2)
    recommendations.append({
        "id": "rec_long_tenure",
        "title": "Tenure-Based Loyalty & Retention Rewards",
        "category": "opportunity",
        "priority": "High",
        "business_impact": f"High (Est. +${lt_rev_opp:,.2f} retention value)",
        "recommendation": f"Establish an exclusive tenure-based loyalty reward program for the {lt_count} loyalists in '{lt_cohort}' (average relationship of {lt_tenure:.0f} days) to protect their customer lifetime value (CLV).",
        "expected_outcome": "Reduce customer churn to budget competitors by 25% and increase recurring purchases.",
        "estimated_revenue_opportunity": lt_rev_opp
    })

    # Recommendation 5: Low Engagement / Reactivation (Red = Risk)
    dormant_data = db.query(
        func.count(Customer.id),
        func.avg(CustomerFeatures.total_spending)
    ).join(
        CustomerFeatures, Customer.id == CustomerFeatures.customer_id
    ).filter(
        Customer.recency > 60
    ).first()
    
    dorm_count = int(dormant_data[0]) if dormant_data and dormant_data[0] else 0
    dorm_spend = float(dormant_data[1]) if dormant_data and dormant_data[1] else 0.0
    dorm_rev_opp = round(dorm_count * dorm_spend * 0.10, 2)
    recommendations.append({
        "id": "rec_low_engagement",
        "title": "Reactivation Campaign for Dormant Accounts",
        "category": "risk",
        "priority": "High",
        "business_impact": f"High (Est. +${dorm_rev_opp:,.2f} recovered revenue)",
        "recommendation": f"Trigger automated email win-back sequences and high-incentive reactivation coupons ($15 off next purchase) for the {dorm_count} customers with no purchases in the last 60 days (recency > 60 days).",
        "expected_outcome": "Re-engage at least 10% of dormant accounts and recover customer relationships before complete attrition.",
        "estimated_revenue_opportunity": dorm_rev_opp
    })

    # Calculate Summaries
    total_recs = len(recommendations)
    high_priority_count = sum(1 for r in recommendations if r["priority"] == "High")
    total_rev_opportunity = round(sum(r["estimated_revenue_opportunity"] for r in recommendations), 2)

    return {
        "total_recommendations": total_recs,
        "high_priority_actions": high_priority_count,
        "estimated_revenue_opportunity": total_rev_opportunity,
        "recommendations": recommendations
    }
