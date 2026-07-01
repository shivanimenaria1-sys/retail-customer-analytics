# PostgreSQL Database Documentation

This document describes the schema design, tables, constraints, relationships, indexes, and import pipelines of the customer segmentation PostgreSQL database.

---

## 1. Database Schema Overview

The database uses a fully normalized schema where customer demographics, features, and segmentation labels are split into three separate relational tables linked via primary and foreign key constraints:

1. **`customers`**: The core customer table, storing loaded raw customer demographics, transaction counts, product spend categories, complaints, and marketing campaign histories.
2. **`customer_features`**: Stores the feature-engineered calculations (e.g. `age`, `customer_tenure`, `total_spending`, `total_purchases`, `average_spending_per_purchase`) in a 1-to-1 relationship with `customers`.
3. **`customer_segments`**: Stores cluster labels and 2D PCA projection coordinates (`pc1`, `pc2`) in a 1-to-1 relationship with `customers`.

---

## 2. Table Definitions

### `customers` Table
Stores primary demographics, transaction values, and campaign histories.

| Column Name | Data Type | Constraints / Defaults | Description |
| :--- | :--- | :--- | :--- |
| `id` | `INT` | `PRIMARY KEY` | Unique customer ID. |
| `year_birth` | `INT` | `NOT NULL`, `CHECK (year_birth >= 1940)` | Year of birth. |
| `education` | `VARCHAR(50)` | `NOT NULL` | Education level. |
| `marital_status` | `VARCHAR(50)` | `NOT NULL` | Standardized marital status. |
| `income` | `NUMERIC(12, 2)` | `CHECK (income >= 0)` | Annual household income. |
| `kidhome` | `INT` | `NOT NULL`, `DEFAULT 0`, `CHECK (kidhome >= 0)` | Number of small children at home. |
| `teenhome` | `INT` | `NOT NULL`, `DEFAULT 0`, `CHECK (teenhome >= 0)` | Number of teenagers at home. |
| `dt_customer` | `DATE` | `NOT NULL` | Customer sign-up date. |
| `recency` | `INT` | `NOT NULL`, `CHECK (recency >= 0)` | Days since last purchase. |
| `mnt_wines` | `INT` | `NOT NULL`, `DEFAULT 0`, `CHECK (mnt_wines >= 0)` | Spending on wine. |
| `mnt_fruits` | `INT` | `NOT NULL`, `DEFAULT 0`, `CHECK (mnt_fruits >= 0)` | Spending on fruits. |
| `mnt_meat_products` | `INT` | `NOT NULL`, `DEFAULT 0`, `CHECK (mnt_meat_products >= 0)` | Spending on meat. |
| `mnt_fish_products` | `INT` | `NOT NULL`, `DEFAULT 0`, `CHECK (mnt_fish_products >= 0)` | Spending on fish. |
| `mnt_sweet_products` | `INT` | `NOT NULL`, `DEFAULT 0`, `CHECK (mnt_sweet_products >= 0)` | Spending on sweets. |
| `mnt_gold_prods` | `INT` | `NOT NULL`, `DEFAULT 0`, `CHECK (mnt_gold_prods >= 0)` | Spending on gold products. |
| `num_deals_purchases` | `INT` | `NOT NULL`, `DEFAULT 0`, `CHECK (num_deals_purchases >= 0)` | Number of deals purchases. |
| `num_web_purchases` | `INT` | `NOT NULL`, `DEFAULT 0`, `CHECK (num_web_purchases >= 0)` | Number of web purchases. |
| `num_catalog_purchases`| `INT` | `NOT NULL`, `DEFAULT 0`, `CHECK (num_catalog_purchases >= 0)`| Number of catalog purchases. |
| `num_store_purchases` | `INT` | `NOT NULL`, `DEFAULT 0`, `CHECK (num_store_purchases >= 0)` | Number of store purchases. |
| `num_web_visits_month`| `INT` | `NOT NULL`, `DEFAULT 0`, `CHECK (num_web_visits_month >= 0)`| Monthly visits to company's website. |
| `accepted_cmp3` | `INT` | `NOT NULL`, `DEFAULT 0`, `CHECK (accepted_cmp3 IN (0, 1))` | 1 if accepted campaign 3, 0 otherwise.|
| `accepted_cmp4` | `INT` | `NOT NULL`, `DEFAULT 0`, `CHECK (accepted_cmp4 IN (0, 1))` | 1 if accepted campaign 4, 0 otherwise.|
| `accepted_cmp5` | `INT` | `NOT NULL`, `DEFAULT 0`, `CHECK (accepted_cmp5 IN (0, 1))` | 1 if accepted campaign 5, 0 otherwise.|
| `accepted_cmp1` | `INT` | `NOT NULL`, `DEFAULT 0`, `CHECK (accepted_cmp1 IN (0, 1))` | 1 if accepted campaign 1, 0 otherwise.|
| `accepted_cmp2` | `INT` | `NOT NULL`, `DEFAULT 0`, `CHECK (accepted_cmp2 IN (0, 1))` | 1 if accepted campaign 2, 0 otherwise.|
| `complain` | `INT` | `NOT NULL`, `DEFAULT 0`, `CHECK (complain IN (0, 1))` | 1 if customer complained in 2 years. |
| `response` | `INT` | `NOT NULL`, `DEFAULT 0`, `CHECK (response IN (0, 1))` | 1 if accepted offer in last campaign. |

---

### `customer_features` Table
Stores feature-engineered calculations (1-to-1 mapping with `customers`).

| Column Name | Data Type | Constraints / Defaults | Description |
| :--- | :--- | :--- | :--- |
| `customer_id` | `INT` | `PRIMARY KEY`, `FOREIGN KEY REFERENCES customers(id) ON DELETE CASCADE` | Link to customer profile. |
| `age` | `INT` | `NOT NULL`, `CHECK (age >= 18)` | Customer's age in 2014. |
| `customer_tenure` | `INT` | `NOT NULL`, `CHECK (customer_tenure >= 0)` | Days since signup relative to max date. |
| `total_spending` | `NUMERIC(12, 2)` | `NOT NULL`, `CHECK (total_spending >= 0)` | Sum of spend across 6 product types. |
| `total_purchases` | `INT` | `NOT NULL`, `CHECK (total_purchases >= 0)` | Sum of Web, Catalog, and Store purchases.|
| `average_spending_per_purchase` | `NUMERIC(12, 2)` | `NOT NULL`, `CHECK (average_spending_per_purchase >= 0)`| Average spend (cart value) per purchase. |

---

### `customer_segments` Table
Stores clustering labels and dimensions (1-to-1 mapping with `customers`).

| Column Name | Data Type | Constraints / Defaults | Description |
| :--- | :--- | :--- | :--- |
| `customer_id` | `INT` | `PRIMARY KEY`, `FOREIGN KEY REFERENCES customers(id) ON DELETE CASCADE` | Link to customer profile. |
| `cluster` | `INT` | `NOT NULL`, `CHECK (cluster >= 0)` | Assigned K-Means cluster ID (0 to 3). |
| `pc1` | `NUMERIC(10, 6)` | `NOT NULL` | Principal Component 1 coordinate. |
| `pc2` | `NUMERIC(10, 6)` | `NOT NULL` | Principal Component 2 coordinate. |

---

## 3. Database Indexes

To optimize performance for expected web applications and query patterns:

1. **`idx_customers_education`**: Speeds up aggregations and groupings based on user qualifications.
2. **`idx_customers_marital`**: Optimizes segmentation demographics based on marital status.
3. **`idx_features_spending`**: Optimizes high-value customer filtering and ranking queries.
4. **`idx_features_purchases`**: Optimizes transaction count search criteria.
5. **`idx_segments_cluster`**: Significantly accelerates cluster cohort queries, which will be common when retrieving specific segment profiles.

---

## 4. CSV Data Ingestion Staging Mechanism

The ingestion pipeline designed in `import.sql` follows a zero-downtime, safe staging design:

1. A **temporary staging table** (`temp_customer_staging`) is spun up with columns matching the exact schema and position of columns in the generated `customer_segments.csv`.
2. PostgreSQL's client-side bulk load `\copy` command is executed to populate the temporary table from the file path, avoiding Windows server-side folder permission restrictions.
3. Target normalized tables (`customers`, `customer_features`, `customer_segments`) are populated using bulk `INSERT ... SELECT` statements.
4. The `ON CONFLICT (id) DO NOTHING` or `ON CONFLICT (customer_id) DO NOTHING` constraints prevent duplicate primary keys if imports are run repeatedly.
5. The temporary table is dropped automatically at the end of the transaction session.
