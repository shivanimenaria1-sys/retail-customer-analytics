import os
import tempfile
from pathlib import Path
from datetime import datetime
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy import func

import matplotlib
matplotlib.use('Agg')  # Use non-interactive backend
import matplotlib.pyplot as plt

from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image, PageBreak, KeepTogether
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

from backend.models import Customer, CustomerFeatures, CustomerSegments
from backend.services.customer_service import COHORT_DETAILS
from backend.services.dashboard_service import get_dashboard_statistics, get_clusters_profiles
from backend.services.ai_recommendation_service import generate_ai_recommendations
from backend.utils.logger import logger

def get_report_data(db: Session, title: str = "Executive Analytics Report", company_name: str = "Global Retail Corp") -> Dict[str, Any]:
    """
    Gathers all metrics, segment distribution, revenue analysis, AI insights,
    and business recommendations for the executive report preview and PDF generation.
    """
    logger.info("Gathering report metrics from database...")
    
    # 1. Fetch KPIs
    kpi_stats = get_dashboard_statistics(db)
    total_customers = kpi_stats["total_customers"]
    
    # Calculate average purchases and campaigns response
    avg_income = kpi_stats["average_income"]
    avg_spending = kpi_stats["average_spending"]
    cluster_distributions = kpi_stats["cluster_distributions"]
    cluster_count = len(cluster_distributions)
    
    # Campaign response rate (latest response)
    latest_campaign_rate = kpi_stats["campaign_response_rates"].get("Latest Campaign (Response)", 0.0)

    # 2. Revenue Department Analysis
    department_spending = db.query(
        func.sum(Customer.mnt_wines).label("wines"),
        func.sum(Customer.mnt_fruits).label("fruits"),
        func.sum(Customer.mnt_meat_products).label("meat"),
        func.sum(Customer.mnt_fish_products).label("fish"),
        func.sum(Customer.mnt_sweet_products).label("sweet"),
        func.sum(Customer.mnt_gold_prods).label("gold")
    ).first()

    departments = [
        {"category": "Wine", "total_spend": float(department_spending[0] or 0.0)},
        {"category": "Fruits", "total_spend": float(department_spending[1] or 0.0)},
        {"category": "Meat Products", "total_spend": float(department_spending[2] or 0.0)},
        {"category": "Fish Products", "total_spend": float(department_spending[3] or 0.0)},
        {"category": "Sweet Products", "total_spend": float(department_spending[4] or 0.0)},
        {"category": "Gold Products", "total_spend": float(department_spending[5] or 0.0)},
    ]
    
    total_dep_spend = sum(d["total_spend"] for d in departments) or 1.0
    for d in departments:
        d["percentage"] = round((d["total_spend"] * 100.0 / total_dep_spend), 2)

    # Sort categories by spending descending
    departments = sorted(departments, key=lambda x: x["total_spend"], reverse=True)

    # 3. Fetch AI Recommendations
    ai_recs_raw = generate_ai_recommendations(db)
    
    # 4. Compile Executive Summary and Strategic Recommendations
    # Find high value and price sensitive cohort names for the summary text
    vip_cohort = "High-Value VIPs"
    frugal_cohort = "Frugal Loyalists"
    for dist in cluster_distributions:
        if dist["cluster"] == 1:
            vip_cohort = dist["cohort_name"].split(" (")[0]
        elif dist["cluster"] == 2:
            frugal_cohort = dist["cohort_name"].split(" (")[0]

    exec_summary = (
        f"This comprehensive executive intelligence report analyzes the behavior of {total_customers:,} active retail "
        f"customers classified into {cluster_count} distinctive behavioral cohorts using unsupervised machine learning (K-Means). "
        f"The analysis highlights a high-value customer core representing significant revenue share, contrasted with price-sensitive "
        f"bargain hunter pools. Total department spending stands at ${total_dep_spend:,.2f} with an average basket value "
        f"of ${avg_spending:,.2f} per customer featureset. Our digital marketing campaigns yield an average response rate "
        f"of {latest_campaign_rate}%, presenting clear optimization pathways."
    )

    top_opportunities = [
        f"VIP Premium Subscriptions: Upsell the high-income '{vip_cohort}' segment via exclusive curated clubs (e.g. Wines and Organic Meats), projecting an estimated revenue lift of ${ai_recs_raw['estimated_revenue_opportunity'] * 0.4:,.2f}.",
        "Tenure Retention rewards: Protect long-term customer relationships with customized retention bonuses to increase customer lifetime value (CLV).",
        "Personalized Category Bundles: Leverage the dominant Wine and Meat category purchases by presenting personalized product pairings to active campaign subscribers."
    ]

    risks = [
        "Reactivation Churn: A significant customer portion shows transaction recency beyond 60 days. Immediate reactivation sequences are required to mitigate customer attrition.",
        "Brand Equity Dilution: Avoid offering mass discounts to high-value spenders, protecting baseline profit margins.",
        "Unengaged Starters Attrition: Newly acquired customers demonstrate low conversion rates and risk immediate churn without guided onboarding discount flows."
    ]

    growth_suggestions = [
        "Deploy automated triggers for dormant accounts with targeted win-back vouchers.",
        "Implement a structured high-margin referral loyalty layer for VIP brand advocates.",
        "Focus department advertising and procurement on high-revenue Wine and Meat selections to maximize return-on-shelf space."
    ]

    return {
        "metadata": {
            "title": title,
            "company_name": company_name,
            "date": datetime.now().strftime("%B %d, %Y")
        },
        "kpis": {
            "total_customers": total_customers,
            "average_income": avg_income,
            "average_spending": avg_spending,
            "campaign_response_rate": latest_campaign_rate,
            "cluster_count": cluster_count
        },
        "segments_distribution": cluster_distributions,
        "revenue_analysis": departments,
        "ai_recommendations": ai_recs_raw["recommendations"],
        "estimated_revenue_opportunity": ai_recs_raw["estimated_revenue_opportunity"],
        "executive_summary": exec_summary,
        "top_opportunities": top_opportunities,
        "risks": risks,
        "growth_suggestions": growth_suggestions
    }

def generate_pdf_report(db: Session, title: str = "Executive Analytics Report", company_name: str = "Global Retail Corp") -> Path:
    """
    Compiles database metrics and generates a professional executive PDF report
    with dynamic charts using ReportLab.
    """
    data = get_report_data(db, title, company_name)
    
    # 1. Generate Matplotlib Charts in a temp directory
    temp_dir = tempfile.gettempdir()
    segment_chart_path = os.path.join(temp_dir, f"segment_dist_{int(datetime.now().timestamp())}.png")
    revenue_chart_path = os.path.join(temp_dir, f"revenue_anal_{int(datetime.now().timestamp())}.png")
    
    # Matplotlib Setup Styling
    plt.rcParams['font.family'] = 'sans-serif'
    plt.rcParams['font.sans-serif'] = ['DejaVu Sans', 'Arial', 'Helvetica']

    # --- Chart 1: Segment Distribution ---
    fig, ax = plt.subplots(figsize=(6, 3.5), dpi=150)
    clusters_data = data["segments_distribution"]
    labels = [c["cohort_name"].split(" (")[0] for c in clusters_data]
    counts = [c["count"] for c in clusters_data]
    colors_list = ['#4B7BEC', '#20BF6B', '#EB3B5A', '#A5B1C2']
    
    # Horizontal Bar chart
    bars = ax.barh(labels, counts, color=colors_list[:len(labels)], height=0.5, edgecolor='#cbd5e1', linewidth=0.5)
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)
    ax.spines['left'].set_color('#94a3b8')
    ax.spines['bottom'].set_color('#94a3b8')
    ax.tick_params(colors='#475569', labelsize=8)
    ax.xaxis.grid(True, linestyle='--', alpha=0.5, color='#cbd5e1')
    ax.set_axisbelow(True)
    
    # Add counts to bar tips
    for bar in bars:
        width = bar.get_width()
        ax.text(width + (max(counts) * 0.02), bar.get_y() + bar.get_height()/2, f"{width:,}", 
                ha='left', va='center', fontsize=8, color='#334155', fontweight='bold')
                
    plt.title("Customer Distribution by Behavioral Cohort", fontsize=10, fontweight='bold', color='#1e293b', pad=12)
    plt.tight_layout()
    plt.savefig(segment_chart_path, bbox_inches='tight', transparent=True)
    plt.close()

    # --- Chart 2: Revenue Analysis ---
    fig, ax = plt.subplots(figsize=(6, 3.5), dpi=150)
    rev_data = data["revenue_analysis"]
    categories = [r["category"] for r in rev_data]
    spending = [r["total_spend"] for r in rev_data]
    palette = ['#4f46e5', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

    # Vertical Bar chart
    bars = ax.bar(categories, spending, color=palette[:len(categories)], width=0.5, edgecolor='#cbd5e1', linewidth=0.5)
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)
    ax.spines['left'].set_color('#94a3b8')
    ax.spines['bottom'].set_color('#94a3b8')
    ax.tick_params(colors='#475569', labelsize=8)
    ax.yaxis.grid(True, linestyle='--', alpha=0.5, color='#cbd5e1')
    ax.set_axisbelow(True)

    # Add labels on top of bars
    for bar in bars:
        yval = bar.get_height()
        ax.text(bar.get_x() + bar.get_width()/2, yval + (max(spending) * 0.02), f"${yval:,.0f}", 
                ha='center', va='bottom', fontsize=7.5, color='#334155', fontweight='bold')

    plt.title("Total Revenue Spending by Product Category", fontsize=10, fontweight='bold', color='#1e293b', pad=12)
    plt.tight_layout()
    plt.savefig(revenue_chart_path, bbox_inches='tight', transparent=True)
    plt.close()

    # 2. Build PDF Document using ReportLab SimpleDocTemplate
    pdf_path = os.path.join(temp_dir, f"executive_report_{int(datetime.now().timestamp())}.pdf")
    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=letter,
        leftMargin=54, # 0.75 in
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    # Styles Setup
    styles = getSampleStyleSheet()
    
    # Custom Styles (hex colors matching our template styling)
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=colors.HexColor("#1e3a8a"), # Dark Blue
        spaceAfter=6
    )
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=11,
        leading=14,
        textColor=colors.HexColor("#475569"), # Slate gray
        spaceAfter=24
    )
    h1_style = ParagraphStyle(
        'HeadingH1',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        textColor=colors.HexColor("#1e3a8a"),
        spaceBefore=14,
        spaceAfter=10,
        keepWithNext=True
    )
    body_style = ParagraphStyle(
        'BodyText',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13.5,
        textColor=colors.HexColor("#334155"),
        spaceAfter=8
    )
    bullet_style = ParagraphStyle(
        'BulletText',
        parent=body_style,
        leftIndent=15,
        firstLineIndent=-10,
        spaceAfter=5
    )

    story = []

    # --- PAGE 1: TITLE BLOCK & KPIs & EXECUTIVE SUMMARY ---
    # Header Branding
    story.append(Paragraph(data["metadata"]["company_name"].upper(), ParagraphStyle('Brand', parent=body_style, fontName='Helvetica-Bold', fontSize=10, textColor=colors.HexColor("#2563eb"), spaceAfter=4)))
    story.append(Paragraph(data["metadata"]["title"], title_style))
    story.append(Paragraph(f"Published on {data['metadata']['date']} | Business Analytics Division", subtitle_style))
    story.append(Spacer(1, 10))

    # Executive Summary Paragraph
    story.append(Paragraph("Executive Summary", h1_style))
    story.append(Paragraph(data["executive_summary"], body_style))
    story.append(Spacer(1, 12))

    # Dashboard KPIs Grid Table
    story.append(Paragraph("Core Performance Indicators (KPIs)", h1_style))
    kpis = data["kpis"]
    kpi_table_data = [
        [
            Paragraph("<b>Metric</b>", ParagraphStyle('TH', parent=body_style, fontName='Helvetica-Bold', textColor=colors.white)),
            Paragraph("<b>Aggregated Value</b>", ParagraphStyle('TH', parent=body_style, fontName='Helvetica-Bold', textColor=colors.white)),
            Paragraph("<b>Context & Coverage</b>", ParagraphStyle('TH', parent=body_style, fontName='Helvetica-Bold', textColor=colors.white))
        ],
        [
            Paragraph("Total Active Customers", body_style),
            Paragraph(f"{kpis['total_customers']:,}", ParagraphStyle('BoldVal', parent=body_style, fontName='Helvetica-Bold')),
            Paragraph("Total database customer count mapped.", body_style)
        ],
        [
            Paragraph("Average Annual Income", body_style),
            Paragraph(f"${kpis['average_income']:,.2f}", ParagraphStyle('BoldVal', parent=body_style, fontName='Helvetica-Bold')),
            Paragraph("Average household income across database.", body_style)
        ],
        [
            Paragraph("Average Customer Spending", body_style),
            Paragraph(f"${kpis['average_spending']:,.2f}", ParagraphStyle('BoldVal', parent=body_style, fontName='Helvetica-Bold')),
            Paragraph("Total spending average per customer featureset.", body_style)
        ],
        [
            Paragraph("Latest Campaign Response", body_style),
            Paragraph(f"{kpis['campaign_response_rate']}%", ParagraphStyle('BoldVal', parent=body_style, fontName='Helvetica-Bold')),
            Paragraph("Acceptance rate of marketing initiatives.", body_style)
        ],
        [
            Paragraph("Identified Customer Segments", body_style),
            Paragraph(f"{kpis['cluster_count']} Cohorts", ParagraphStyle('BoldVal', parent=body_style, fontName='Helvetica-Bold')),
            Paragraph("Distinct customer pools derived from ML models.", body_style)
        ]
    ]
    kpi_table = Table(kpi_table_data, colWidths=[150, 120, 234])
    kpi_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#1e3a8a")),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
        ('TOPPADDING', (0, 0), (-1, 0), 8),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor("#f8fafc")]),
        ('TOPPADDING', (0, 1), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 1), (-1, -1), 6),
    ]))
    story.append(kpi_table)
    story.append(PageBreak())

    # --- PAGE 2: CHARTS & SEGMENT & REVENUE ANALYSIS ---
    story.append(Paragraph("Segment Distribution & Revenue Charts", h1_style))
    story.append(Paragraph("Unsupervised ML models group our customers into four distinctive behavioral clusters based on Income, Age, Spending behavior, and Purchases. Below charts visualize the customer shares and department spending analysis.", body_style))
    story.append(Spacer(1, 8))

    # Grid containing both Matplotlib images
    charts_data = [
        [Image(segment_chart_path, width=240, height=140), Image(revenue_chart_path, width=240, height=140)]
    ]
    charts_table = Table(charts_data, colWidths=[252, 252])
    charts_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ('RIGHTPADDING', (0, 0), (-1, -1), 0),
    ]))
    story.append(charts_table)
    story.append(Spacer(1, 15))

    # Revenue by Department Table
    story.append(Paragraph("Revenue Analysis by Product Category", ParagraphStyle('SubTitle2', parent=h1_style, fontSize=11, spaceBefore=8, spaceAfter=6)))
    rev_table_data = [
        [
            Paragraph("<b>Category</b>", ParagraphStyle('TH', parent=body_style, fontName='Helvetica-Bold', textColor=colors.white)),
            Paragraph("<b>Total Spend</b>", ParagraphStyle('TH', parent=body_style, fontName='Helvetica-Bold', textColor=colors.white)),
            Paragraph("<b>Percentage Share</b>", ParagraphStyle('TH', parent=body_style, fontName='Helvetica-Bold', textColor=colors.white))
        ]
    ]
    for r in rev_data:
        rev_table_data.append([
            Paragraph(r["category"], body_style),
            Paragraph(f"${r['total_spend']:,.2f}", body_style),
            Paragraph(f"{r['percentage']}%", body_style)
        ])
    rev_table = Table(rev_table_data, colWidths=[180, 160, 164])
    rev_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#334155")),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor("#f8fafc")]),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(rev_table)
    story.append(PageBreak())

    # --- PAGE 3: AI BUSINESS RECOMMENDATIONS TABLE & PROFILES ---
    story.append(Paragraph("AI Business Insights & Growth Opportunities", h1_style))
    story.append(Paragraph(f"Our ML model combined with active business rules indicates <b>${data['estimated_revenue_opportunity']:,.2f}</b> in estimated revenue-driving growth initiatives.", body_style))
    story.append(Spacer(1, 6))

    # Recommendations Table
    recs = data["ai_recommendations"]
    recs_table_data = [
        [
            Paragraph("<b>Strategic Initiative</b>", ParagraphStyle('TH', parent=body_style, fontName='Helvetica-Bold', textColor=colors.white)),
            Paragraph("<b>Target Cohort / Focus</b>", ParagraphStyle('TH', parent=body_style, fontName='Helvetica-Bold', textColor=colors.white)),
            Paragraph("<b>Revenue Opportunity</b>", ParagraphStyle('TH', parent=body_style, fontName='Helvetica-Bold', textColor=colors.white)),
            Paragraph("<b>Priority</b>", ParagraphStyle('TH', parent=body_style, fontName='Helvetica-Bold', textColor=colors.white))
        ]
    ]
    for r in recs:
        recs_table_data.append([
            Paragraph(f"<b>{r['title']}</b><br/><font color='#64748b' size='8'>{r['recommendation']}</font>", body_style),
            Paragraph(r["business_impact"].split(" (")[0], body_style),
            Paragraph(f"${r['estimated_revenue_opportunity']:,.2f}", body_style),
            Paragraph(f"<b>{r['priority']}</b>", ParagraphStyle('Pri', parent=body_style, textColor=colors.HexColor("#b91c1c") if r["priority"] == "High" else colors.HexColor("#d97706")))
        ])
    recs_table = Table(recs_table_data, colWidths=[200, 120, 120, 64])
    recs_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#1e3a8a")),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor("#f8fafc")]),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(recs_table)
    story.append(Spacer(1, 15))

    # Segment Descriptions
    story.append(Paragraph("AI Predictor Summary - Customer Cohort Profiles", ParagraphStyle('Sub2', parent=h1_style, fontSize=11, spaceBefore=8)))
    for c_id, cohort in COHORT_DETAILS.items():
        cohort_para = f"<b>Cluster {c_id + 1}: {cohort['name']}</b> — {cohort['characteristics']}"
        story.append(Paragraph(cohort_para, ParagraphStyle('CohPara', parent=body_style, spaceAfter=4)))
        story.append(Spacer(1, 2))

    story.append(PageBreak())

    # --- PAGE 4: BUSINESS RECOMMENDATIONS & RISKS ACTION PLAN ---
    story.append(Paragraph("Executive Strategic Action Plan", h1_style))
    story.append(Paragraph("Based on the data-driven customer model findings, the analytics division recommends implementing the following roadmap of operational changes and protective measures.", body_style))
    story.append(Spacer(1, 10))

    # Opportunities
    story.append(Paragraph("Top Growth Opportunities", ParagraphStyle('OpTitle', parent=h1_style, fontSize=11, textColor=colors.HexColor("#10b981"), spaceBefore=5, spaceAfter=5)))
    for opt in data["top_opportunities"]:
        story.append(Paragraph(f"• {opt}", bullet_style))
    story.append(Spacer(1, 8))

    # Risks
    story.append(Paragraph("Operational Vulnerabilities & Risks", ParagraphStyle('RiskTitle', parent=h1_style, fontSize=11, textColor=colors.HexColor("#ef4444"), spaceBefore=5, spaceAfter=5)))
    for rsk in data["risks"]:
        story.append(Paragraph(f"• {rsk}", bullet_style))
    story.append(Spacer(1, 8))

    # Growth suggestions
    story.append(Paragraph("Actionable Growth Roadmap Suggestions", ParagraphStyle('RoadTitle', parent=h1_style, fontSize=11, textColor=colors.HexColor("#f59e0b"), spaceBefore=5, spaceAfter=5)))
    for sug in data["growth_suggestions"]:
        story.append(Paragraph(f"• {sug}", bullet_style))
    story.append(Spacer(1, 15))

    # Sign-off block
    story.append(Spacer(1, 20))
    sign_off_data = [
        [
            Paragraph("<b>Prepared by:</b><br/>Business Analytics Division", body_style),
            Paragraph("<b>Approved by:</b><br/>____________________________<br/>Chief Executive Officer", body_style)
        ]
    ]
    sign_off_table = Table(sign_off_data, colWidths=[252, 252])
    sign_off_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 10),
    ]))
    story.append(sign_off_table)

    # 3. Canvas Callback to Draw Header/Footer & Clean Page Numbers
    def canvas_callback(canvas_obj, doc_obj):
        canvas_obj.saveState()
        
        # Don't draw header/footer on page 1 (cover) to keep it premium
        if doc_obj.page > 1:
            # Draw header line
            canvas_obj.setFont('Helvetica-Bold', 8)
            canvas_obj.setFillColor(colors.HexColor("#475569"))
            canvas_obj.drawString(54, 750, f"{company_name.upper()} | EXECUTIVE REPORT")
            canvas_obj.setStrokeColor(colors.HexColor("#e2e8f0"))
            canvas_obj.setLineWidth(0.5)
            canvas_obj.line(54, 742, 558, 742)
            
            # Draw footer line
            canvas_obj.setFont('Helvetica', 8)
            canvas_obj.setFillColor(colors.HexColor("#64748b"))
            canvas_obj.drawString(54, 36, f"Generated on {data['metadata']['date']} - Confidential")
            canvas_obj.drawRightString(558, 36, f"Page {doc_obj.page}")
            
        canvas_obj.restoreState()

    # Build the document
    try:
        doc.build(story, onFirstPage=canvas_callback, onLaterPages=canvas_callback)
    except Exception as e:
        logger.error(f"Error compiling ReportLab PDF: {str(e)}", exc_info=True)
        # Attempt cleanup of temporary images
        for p in [segment_chart_path, revenue_chart_path]:
            if os.path.exists(p):
                os.remove(p)
        raise e

    # Clean up temporary chart images after successfully building report
    for p in [segment_chart_path, revenue_chart_path]:
        try:
            if os.path.exists(p):
                os.remove(p)
        except Exception as ex:
            logger.warning(f"Failed to delete temp chart image {p}: {str(ex)}")

    return Path(pdf_path)
