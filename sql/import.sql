-- import.sql
-- Import pipeline to load customer_segments.csv into normalized PostgreSQL tables

-- 1. Create a temporary staging table reflecting the exact 35 CSV columns
CREATE TEMP TABLE temp_customer_staging (
    id INT,
    year_birth INT,
    education VARCHAR(50),
    marital_status VARCHAR(50),
    income NUMERIC(12, 2),
    kidhome INT,
    teenhome INT,
    dt_customer DATE,
    recency INT,
    mnt_wines INT,
    mnt_fruits INT,
    mnt_meat_products INT,
    mnt_fish_products INT,
    mnt_sweet_products INT,
    mnt_gold_prods INT,
    num_deals_purchases INT,
    num_web_purchases INT,
    num_catalog_purchases INT,
    num_store_purchases INT,
    num_web_visits_month INT,
    accepted_cmp3 INT,
    accepted_cmp4 INT,
    accepted_cmp5 INT,
    accepted_cmp1 INT,
    accepted_cmp2 INT,
    complain INT,
    response INT,
    age INT,
    customer_tenure INT,
    total_spending NUMERIC(12, 2),
    total_purchases INT,
    average_spending_per_purchase NUMERIC(12, 2),
    cluster INT,
    pc1 NUMERIC(10, 6),
    pc2 NUMERIC(10, 6)
);

-- 2. Client-side \copy CSV data into staging table
-- NOTE: We use client-side \copy command instead of server-side COPY.
-- This runs under the client user's permissions and prevents "Permission denied" errors on Windows.
-- Modify the path below to match your local file path.
\copy temp_customer_staging FROM 'C:/Users/HP/Desktop/retail-customer-analytics/dataset/processed/customer_segments.csv' DELIMITER ',' CSV HEADER;

-- 3. Populate target tables with INSERT SELECT ON CONFLICT to avoid duplicate insertions
-- A. Populate customers
INSERT INTO customers (
    id, year_birth, education, marital_status, income, kidhome, teenhome, dt_customer, recency, 
    mnt_wines, mnt_fruits, mnt_meat_products, mnt_fish_products, mnt_sweet_products, mnt_gold_prods, 
    num_deals_purchases, num_web_purchases, num_catalog_purchases, num_store_purchases, num_web_visits_month, 
    accepted_cmp3, accepted_cmp4, accepted_cmp5, accepted_cmp1, accepted_cmp2, complain, response
)
SELECT 
    id, year_birth, education, marital_status, income, kidhome, teenhome, dt_customer, recency, 
    mnt_wines, mnt_fruits, mnt_meat_products, mnt_fish_products, mnt_sweet_products, mnt_gold_prods, 
    num_deals_purchases, num_web_purchases, num_catalog_purchases, num_store_purchases, num_web_visits_month, 
    accepted_cmp3, accepted_cmp4, accepted_cmp5, accepted_cmp1, accepted_cmp2, complain, response
FROM temp_customer_staging
ON CONFLICT (id) DO NOTHING;

-- B. Populate customer_features
INSERT INTO customer_features (
    customer_id, age, customer_tenure, total_spending, total_purchases, average_spending_per_purchase
)
SELECT 
    id, age, customer_tenure, total_spending, total_purchases, average_spending_per_purchase
FROM temp_customer_staging
ON CONFLICT (customer_id) DO NOTHING;

-- C. Populate customer_segments
INSERT INTO customer_segments (
    customer_id, cluster, pc1, pc2
)
SELECT 
    id, cluster, pc1, pc2
FROM temp_customer_staging
ON CONFLICT (customer_id) DO NOTHING;

-- 4. Clean up staging table
DROP TABLE temp_customer_staging;
