<div align="center">

# 🛒 Retail Customer Analytics Platform

**A full-stack business intelligence platform for retail customer segmentation, AI-powered insights, and executive PDF reporting.**

[![Python](https://img.shields.io/badge/Python-3.12-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-336791?style=flat-square&logo=postgresql&logoColor=white)](https://postgresql.org)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-v4-38BDF8?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![scikit-learn](https://img.shields.io/badge/scikit--learn-KMeans-F7931E?style=flat-square&logo=scikitlearn&logoColor=white)](https://scikit-learn.org)

</div>

---

## Overview

The **Retail Customer Analytics Platform** is a production-grade full-stack web application that transforms raw retail transaction data into actionable business intelligence. It provides interactive dashboards, ML-powered customer segmentation, an AI business predictor, rule-based AI recommendations, and one-click executive PDF report generation — all backed by a live PostgreSQL database with a FastAPI REST API and a modern React frontend.

The platform is built around a 2,236-customer marketing dataset, applying a complete ETL pipeline: data cleaning → feature engineering → KMeans clustering → PCA visualization → database persistence.

---

## Features

### 📊 Customer Analytics Dashboard
Real-time KPI cards powered by live database aggregations — total customers, average income, average spending, campaign response rates across 5 campaigns, and cluster distribution breakdowns with progress bars.

### 🧠 Customer Segmentation
ML-driven segmentation using KMeans (K=4) and PCA dimensionality reduction. Customers are assigned to four named business cohorts:
- **Premium Loyalists** — High income, high engagement
- **Potential Growthers** — Moderate income, moderate spending
- **Budget Conscious** — Lower income, value-focused
- **At-Risk Churners** — Low engagement, at-risk retention

Interactive 2D PCA scatter plot visualization with per-cluster breakdowns and revenue analysis.

### 🤖 AI Customer Predictor
Input a customer's demographic profile (income, age, marital status, spending habits) and get real-time ML-powered segment prediction with a confidence breakdown, cohort characteristics, and tailored recommendations — no page reload required.

### 💡 AI Business Insights
Rule-based recommendation engine that queries live cluster statistics and generates prioritized strategic initiatives ranked by estimated revenue opportunity. Covers retention, upsell, loyalty, and campaign targeting strategies per segment.

### 📄 Executive PDF Reports
Customizable executive-grade PDF reports generated server-side with ReportLab and Matplotlib. Includes KPI tables, segment distribution charts, department revenue breakdowns, AI recommendations, and strategic growth roadmaps. Reports download directly in the browser with the correct filename.

### 📂 Dataset Upload
Drag-and-drop CSV upload that triggers a full server-side ETL pipeline: data cleaning, feature engineering, KMeans segmentation, and transactional upsert to PostgreSQL — all in one request.

### 🗄️ PostgreSQL Integration
Three normalized database tables (`customers`, `customer_features`, `customer_segments`) with foreign key constraints, cascade deletes, and automatic seeding from the bundled dataset on first startup.

---

## Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 19 | UI framework |
| Vite | 8 | Build tool & dev server |
| Tailwind CSS | v4 | Utility-first styling |
| React Router DOM | 7 | Client-side routing |
| Axios | 1.x | HTTP client |
| Plotly.js | 3.x | Interactive charts & scatter plots |
| Lucide React | 1.x | Icon library |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Python | 3.12 | Runtime |
| FastAPI | 0.115+ | REST API framework |
| Uvicorn | latest | ASGI server |
| SQLAlchemy | 2.x | ORM & database session management |
| Pydantic | 2.x | Request/response schema validation |

### Database
| Technology | Purpose |
|---|---|
| PostgreSQL 15+ | Primary relational database |
| SQLAlchemy ORM | Database abstraction layer |

### Machine Learning
| Library | Purpose |
|---|---|
| scikit-learn | KMeans clustering, StandardScaler, PCA |
| pandas | Data manipulation & ETL |
| NumPy | Numerical operations |
| joblib | Model serialization (.pkl) |

### Libraries & Tools
| Library | Purpose |
|---|---|
| ReportLab | Server-side PDF generation |
| Matplotlib | In-memory chart rendering for PDF |
| openpyxl | .xlsx dataset reading |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Browser (React + Vite)                  │
│  Dashboard │ Segments │ Explorer │ Predictor │ Reports │ AI  │
└─────────────────────┬───────────────────────────────────────┘
                       │  HTTP / REST  (port 5173 → 8000)
┌─────────────────────▼───────────────────────────────────────┐
│                   FastAPI Backend (Uvicorn)                   │
│                                                               │
│  Routes                  Services                             │
│  ├── /dashboard    ───►  dashboard_service.py                 │
│  ├── /clusters     ───►  dashboard_service.py                 │
│  ├── /customers    ───►  customer_service.py                  │
│  ├── /segment      ───►  customer_segmentation.py             │
│  ├── /predict      ───►  customer_segmentation.py             │
│  ├── /ai-recommendations ► ai_recommendation_service.py       │
│  ├── /report/preview ──► report_service.py                    │
│  ├── /report/export ───► report_service.py + ReportLab        │
│  └── /upload       ───►  upload_service.py (ETL pipeline)     │
│                                                               │
│  ML Models (serialized)                                       │
│  ├── models/scaler.pkl       (StandardScaler)                 │
│  └── models/kmeans_model.pkl (KMeans K=4)                     │
└─────────────────────┬───────────────────────────────────────┘
                       │  SQLAlchemy ORM
┌─────────────────────▼───────────────────────────────────────┐
│                 PostgreSQL Database                           │
│  ┌──────────────────┐  ┌──────────────────────┐             │
│  │    customers     │  │  customer_features   │             │
│  │  (demographics)  │  │ (age, tenure,        │             │
│  │  (spending)      │  │  total_spending,     │             │
│  │  (campaigns)     │  │  total_purchases)    │             │
│  └────────┬─────────┘  └──────────┬───────────┘             │
│           │                       │                          │
│           └──────┬────────────────┘                         │
│                  │                                           │
│          ┌───────▼───────────┐                               │
│          │ customer_segments │                               │
│          │ (cluster, pc1,    │                               │
│          │  pc2)             │                               │
│          └───────────────────┘                               │
└─────────────────────────────────────────────────────────────┘
```

### ML Pipeline

```
Raw Excel Dataset (data_market.xlsx)
         │
         ▼
    data_cleaner.py
    ├── Remove duplicate IDs
    ├── Filter birth year outliers (< 1940)
    ├── Filter income outliers (> $600K)
    ├── Normalize marital status
    └── Type casting & null handling
         │
         ▼
    feature_engineering.py
    ├── Age (from Year_Birth)
    ├── Customer_Tenure (days since enrollment)
    ├── Total_Spending (sum of 6 product categories)
    ├── Total_Purchases (web + catalog + store)
    └── Average_Spending_Per_Purchase
         │
         ▼
    customer_segmentation.py
    ├── StandardScaler (6 features)
    ├── KMeans (K=4, random_state=42, n_init=10)
    ├── PCA (2 components for visualization)
    └── joblib serialization → models/
         │
         ▼
    PostgreSQL (3 normalized tables)
```

---

## Folder Structure

```
retail-customer-analytics/
│
├── backend/                        # FastAPI Python backend
│   ├── app.py                      # Application entry point, CORS, lifespan
│   ├── config.py                   # Environment config, paths
│   ├── database.py                 # SQLAlchemy engine & session factory
│   ├── database_seeder.py          # Auto-seed on startup from CSV
│   ├── controllers/                # Request handlers
│   ├── models/
│   │   └── database_models.py      # SQLAlchemy ORM models (3 tables)
│   ├── routes/                     # FastAPI route definitions
│   │   ├── __init__.py             # Combined api_router
│   │   ├── customer_routes.py
│   │   ├── dashboard_routes.py
│   │   ├── ai_recommendation_routes.py
│   │   └── report_routes.py
│   ├── schemas/
│   │   └── validation_schemas.py   # Pydantic request/response schemas
│   ├── services/                   # Business logic layer
│   │   ├── config.py               # ML pipeline configuration
│   │   ├── data_cleaner.py         # ETL cleaning pipeline
│   │   ├── feature_engineering.py  # Derived feature calculations
│   │   ├── customer_segmentation.py # KMeans + PCA pipeline
│   │   ├── customer_service.py     # Customer CRUD & cohort definitions
│   │   ├── dashboard_service.py    # KPI aggregations
│   │   ├── ai_recommendation_service.py # Rule-based AI insights
│   │   ├── report_service.py       # ReportLab PDF generation
│   │   └── upload_service.py       # CSV upload ETL handler
│   └── utils/
│       └── logger.py               # Structured logging configuration
│
├── frontend/                       # React + Vite frontend
│   ├── vite.config.js
│   ├── package.json
│   └── src/
│       ├── App.jsx                 # Router, layout, protected routes
│       ├── components/
│       │   ├── Sidebar.jsx
│       │   ├── LoadingSkeleton.jsx
│       │   └── ErrorBoundary.jsx
│       ├── pages/
│       │   ├── Login.jsx
│       │   ├── Dashboard.jsx
│       │   ├── Explorer.jsx        # Customer table with search & filter
│       │   ├── Segments.jsx        # Cluster PCA scatter plot
│       │   ├── Predictor.jsx       # Real-time ML predictor
│       │   ├── AIInsights.jsx      # AI business recommendations
│       │   ├── Reports.jsx         # Executive PDF report generator
│       │   └── Upload.jsx          # Dataset CSV upload
│       └── services/
│           └── api.js              # Axios service layer
│
├── dataset/
│   ├── raw/data_market.xlsx        # Source marketing dataset (2,236 records)
│   └── processed/                  # Cleaned & segmented CSVs
│
├── models/
│   ├── scaler.pkl                  # Fitted StandardScaler
│   └── kmeans_model.pkl            # Fitted KMeans (K=4)
│
├── sql/
│   ├── schema.sql                  # PostgreSQL DDL
│   ├── import.sql                  # Data import scripts
│   ├── queries.sql                 # Analytical query reference
│   └── database.md                 # Database documentation
│
├── notebooks/                      # Jupyter EDA notebooks
├── powerbi/                        # Power BI reports
├── presentation/                   # Project presentations
├── .env.example                    # Environment variable template
└── .gitignore
```

---

## Installation

### Prerequisites

- **Python** 3.12+
- **Node.js** 18+ and npm 10+
- **PostgreSQL** 15+

---

### 1. Clone the Repository

```bash
git clone https://github.com/<your-username>/retail-customer-analytics.git
cd retail-customer-analytics
```

---

### 2. Backend Setup

```bash
# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate          # Windows
source venv/bin/activate       # macOS/Linux

# Install dependencies
pip install fastapi uvicorn sqlalchemy psycopg2-binary pandas numpy scikit-learn \
            joblib matplotlib reportlab openpyxl pydantic python-multipart
```

Create a PostgreSQL database and set the connection string:

```bash
# .env (project root)
DATABASE_URL=postgresql://postgres:<password>@localhost:5432/retail_customer_analytics
```

Start the backend:

```bash
uvicorn backend.app:app --reload
```

> On first startup the server auto-creates all tables and seeds 2,236 customer records.

- API: **http://localhost:8000**
- Swagger docs: **http://localhost:8000/docs**

---

### 3. Frontend Setup

```bash
cd frontend
npm install
```

```bash
# frontend/.env
VITE_API_URL=http://localhost:8000
```

```bash
npm run dev
```

App: **http://localhost:5173**

---

### 4. Retrain ML Models (Optional)

Pre-trained model files are included in `models/`. To retrain from scratch:

```bash
python -c "
from backend.services.data_loader import load_raw_data
from backend.services.data_cleaner import clean_dataset
from backend.services.feature_engineering import engineer_features
from backend.services.customer_segmentation import run_segmentation_pipeline
df = load_raw_data()
df = clean_dataset(df)
df = engineer_features(df)
run_segmentation_pipeline(df, save_models=True)
print('Models retrained and saved.')
"
```

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Health check |
| `GET` | `/dashboard` | KPI statistics & campaign rates |
| `GET` | `/clusters` | Cluster profiles and distributions |
| `GET` | `/cluster/{id}` | Single cluster detail |
| `GET` | `/insights` | Statistical insights |
| `GET` | `/ai-recommendations` | AI business recommendations |
| `GET` | `/customers` | Paginated customer list |
| `GET` | `/customer/{id}` | Single customer detail |
| `POST` | `/segment` | Predict segment from input data |
| `POST` | `/predict` | Full prediction with confidence & recommendations |
| `GET` | `/report/preview` | Report preview JSON |
| `GET` | `/report/export` | Download ReportLab PDF |
| `POST` | `/upload` | Upload CSV → ETL → seed database |

---

## Screenshots

### Dashboard
> Real-time KPI cards, campaign response rates, cluster distribution charts, and revenue category breakdowns.

### Segmentation
> Interactive 2D PCA scatter plot of 2,236 customers colored by cluster, with cohort profile cards and percentage breakdowns.

### AI Insights
> Prioritized business recommendation cards ranked by estimated revenue opportunity, generated from live cluster statistics.

### AI Predictor
> Input form for customer demographics returning an instant ML segment prediction with confidence levels, cohort summary, and tailored recommendations.

### Executive Reports
> Live report preview with section-by-section analytics, and one-click PDF download via the backend ReportLab PDF generator.

---

## Future Improvements

- [ ] **Authentication & RBAC** — JWT-based login with role-based access control
- [ ] **Real-time Streaming** — WebSocket or SSE for live dashboard KPI updates
- [ ] **Advanced ML Models** — DBSCAN, Gaussian Mixture Models for improved segmentation
- [ ] **Email Report Delivery** — Schedule and email executive PDF reports automatically
- [ ] **Docker Compose** — One-command containerized deployment
- [ ] **Time-series Analytics** — Revenue trends, cohort retention curves, and churn prediction
- [ ] **Power BI Embedded** — Embed live Power BI dashboards in the React frontend
- [ ] **Automated Model Retraining** — Trigger retraining pipeline on new data upload
- [ ] **Multi-tenant Support** — Namespace data by organization for SaaS deployment

---

## Author

**Shivani Menaria**

> Built as a capstone full-stack data analytics project demonstrating end-to-end integration of machine learning, REST API development, relational database design, and modern React UI engineering.

---

<div align="center">

**⭐ Star this repository if you found it helpful!**

</div>
