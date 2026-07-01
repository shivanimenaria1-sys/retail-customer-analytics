-- schema.sql
-- Production database schema for retail customer analytics database

-- Drop tables if they exist (clean setup)
DROP TABLE IF EXISTS customer_segments CASCADE;
DROP TABLE IF EXISTS customer_features CASCADE;
DROP TABLE IF EXISTS customers CASCADE;

-- 1. Customers Table (Demographics, transaction values, and campaign histories)
CREATE TABLE customers (
    id INT PRIMARY KEY,
    year_birth INT NOT NULL,
    education VARCHAR(50) NOT NULL,
    marital_status VARCHAR(50) NOT NULL,
    income NUMERIC(12, 2),
    kidhome INT NOT NULL DEFAULT 0,
    teenhome INT NOT NULL DEFAULT 0,
    dt_customer DATE NOT NULL,
    recency INT NOT NULL,
    mnt_wines INT NOT NULL DEFAULT 0,
    mnt_fruits INT NOT NULL DEFAULT 0,
    mnt_meat_products INT NOT NULL DEFAULT 0,
    mnt_fish_products INT NOT NULL DEFAULT 0,
    mnt_sweet_products INT NOT NULL DEFAULT 0,
    mnt_gold_prods INT NOT NULL DEFAULT 0,
    num_deals_purchases INT NOT NULL DEFAULT 0,
    num_web_purchases INT NOT NULL DEFAULT 0,
    num_catalog_purchases INT NOT NULL DEFAULT 0,
    num_store_purchases INT NOT NULL DEFAULT 0,
    num_web_visits_month INT NOT NULL DEFAULT 0,
    accepted_cmp3 INT NOT NULL DEFAULT 0,
    accepted_cmp4 INT NOT NULL DEFAULT 0,
    accepted_cmp5 INT NOT NULL DEFAULT 0,
    accepted_cmp1 INT NOT NULL DEFAULT 0,
    accepted_cmp2 INT NOT NULL DEFAULT 0,
    complain INT NOT NULL DEFAULT 0,
    response INT NOT NULL DEFAULT 0,

    -- Constraints
    CONSTRAINT chk_year_birth CHECK (year_birth >= 1940),
    CONSTRAINT chk_income CHECK (income >= 0),
    CONSTRAINT chk_kidhome CHECK (kidhome >= 0),
    CONSTRAINT chk_teenhome CHECK (teenhome >= 0),
    CONSTRAINT chk_recency CHECK (recency >= 0),
    CONSTRAINT chk_mnt_wines CHECK (mnt_wines >= 0),
    CONSTRAINT chk_mnt_fruits CHECK (mnt_fruits >= 0),
    CONSTRAINT chk_mnt_meat CHECK (mnt_meat_products >= 0),
    CONSTRAINT chk_mnt_fish CHECK (mnt_fish_products >= 0),
    CONSTRAINT chk_mnt_sweet CHECK (mnt_sweet_products >= 0),
    CONSTRAINT chk_mnt_gold CHECK (mnt_gold_prods >= 0),
    CONSTRAINT chk_deals CHECK (num_deals_purchases >= 0),
    CONSTRAINT chk_web CHECK (num_web_purchases >= 0),
    CONSTRAINT chk_catalog CHECK (num_catalog_purchases >= 0),
    CONSTRAINT chk_store CHECK (num_store_purchases >= 0),
    CONSTRAINT chk_web_visits CHECK (num_web_visits_month >= 0),
    CONSTRAINT chk_accepted_cmp1 CHECK (accepted_cmp1 IN (0, 1)),
    CONSTRAINT chk_accepted_cmp2 CHECK (accepted_cmp2 IN (0, 1)),
    CONSTRAINT chk_accepted_cmp3 CHECK (accepted_cmp3 IN (0, 1)),
    CONSTRAINT chk_accepted_cmp4 CHECK (accepted_cmp4 IN (0, 1)),
    CONSTRAINT chk_accepted_cmp5 CHECK (accepted_cmp5 IN (0, 1)),
    CONSTRAINT chk_complain CHECK (complain IN (0, 1)),
    CONSTRAINT chk_response CHECK (response IN (0, 1))
);

-- 2. Customer Features Table (Feature-engineered variables)
CREATE TABLE customer_features (
    customer_id INT PRIMARY KEY,
    age INT NOT NULL,
    customer_tenure INT NOT NULL,
    total_spending NUMERIC(12, 2) NOT NULL,
    total_purchases INT NOT NULL,
    average_spending_per_purchase NUMERIC(12, 2) NOT NULL,

    -- Constraints & Foreign Key
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    CONSTRAINT chk_age CHECK (age >= 18),
    CONSTRAINT chk_tenure CHECK (customer_tenure >= 0),
    CONSTRAINT chk_total_spending CHECK (total_spending >= 0),
    CONSTRAINT chk_total_purchases CHECK (total_purchases >= 0),
    CONSTRAINT chk_avg_spending CHECK (average_spending_per_purchase >= 0)
);

-- 3. Customer Segments Table (Segmentation clusters and PCA dimensions)
CREATE TABLE customer_segments (
    customer_id INT PRIMARY KEY,
    cluster INT NOT NULL,
    pc1 NUMERIC(10, 6) NOT NULL,
    pc2 NUMERIC(10, 6) NOT NULL,

    -- Constraints & Foreign Key
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    CONSTRAINT chk_cluster CHECK (cluster >= 0)
);

-- Indexes for performance optimization
CREATE INDEX idx_customers_education ON customers(education);
CREATE INDEX idx_customers_marital ON customers(marital_status);
CREATE INDEX idx_features_spending ON customer_features(total_spending);
CREATE INDEX idx_features_purchases ON customer_features(total_purchases);
CREATE INDEX idx_segments_cluster ON customer_segments(cluster);
