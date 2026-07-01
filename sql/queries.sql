-- queries.sql
-- Production analytics and business intelligence queries for retail customer segments

-- 1. Total customers
SELECT COUNT(*) AS total_customers FROM customers;

-- 2. Average income
SELECT ROUND(AVG(income), 2) AS average_income FROM customers;

-- 3. Average spending
SELECT ROUND(AVG(total_spending), 2) AS average_spending FROM customer_features;

-- 4. Customers per cluster (counts and percentages)
SELECT
    s.cluster,
    COUNT(s.customer_id) AS customer_count,
    ROUND(COUNT(s.customer_id) * 100.0 / (SELECT COUNT(*) FROM customer_segments), 2) AS percentage
FROM customer_segments s
GROUP BY s.cluster
ORDER BY s.cluster;

-- 5. Revenue by cluster (Total spend & Average spend per segment)
SELECT
    s.cluster,
    ROUND(SUM(f.total_spending), 2) AS total_revenue,
    ROUND(AVG(f.total_spending), 2) AS average_spending
FROM customer_segments s
JOIN customer_features f ON s.customer_id = f.customer_id
GROUP BY s.cluster
ORDER BY s.cluster;

-- 6. Top 10 spending customers
SELECT
    c.id AS customer_id,
    c.education,
    c.marital_status,
    c.income,
    f.total_spending,
    f.total_purchases,
    s.cluster AS assigned_segment
FROM customers c
JOIN customer_features f ON c.id = f.customer_id
JOIN customer_segments s ON c.id = s.customer_id
ORDER BY f.total_spending DESC
LIMIT 10;

-- 7. Campaign response rate (Acceptance percentage per campaign)
SELECT
    ROUND(SUM(accepted_cmp1) * 100.0 / COUNT(*), 2) AS campaign_1_acceptance_pct,
    ROUND(SUM(accepted_cmp2) * 100.0 / COUNT(*), 2) AS campaign_2_acceptance_pct,
    ROUND(SUM(accepted_cmp3) * 100.0 / COUNT(*), 2) AS campaign_3_acceptance_pct,
    ROUND(SUM(accepted_cmp4) * 100.0 / COUNT(*), 2) AS campaign_4_acceptance_pct,
    ROUND(SUM(accepted_cmp5) * 100.0 / COUNT(*), 2) AS campaign_5_acceptance_pct,
    ROUND(SUM(response) * 100.0 / COUNT(*), 2) AS latest_campaign_acceptance_pct
FROM customers;

-- 8. Education distribution
SELECT
    education,
    COUNT(*) AS customer_count,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM customers), 2) AS percentage
FROM customers
GROUP BY education
ORDER BY customer_count DESC;

-- 9. Marital status distribution
SELECT
    marital_status,
    COUNT(*) AS customer_count,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM customers), 2) AS percentage
FROM customers
GROUP BY marital_status
ORDER BY customer_count DESC;

-- EXTRA: Spending by product categories across segments
SELECT
    s.cluster,
    ROUND(AVG(c.mnt_wines), 2) AS avg_spent_wines,
    ROUND(AVG(c.mnt_fruits), 2) AS avg_spent_fruits,
    ROUND(AVG(c.mnt_meat_products), 2) AS avg_spent_meat,
    ROUND(AVG(c.mnt_fish_products), 2) AS avg_spent_fish,
    ROUND(AVG(c.mnt_sweet_products), 2) AS avg_spent_sweets,
    ROUND(AVG(c.mnt_gold_prods), 2) AS avg_spent_gold
FROM customers c
JOIN customer_segments s ON c.id = s.customer_id
GROUP BY s.cluster
ORDER BY s.cluster;

-- EXTRA: Purchase channel preferences across segments
SELECT
    s.cluster,
    ROUND(AVG(c.num_web_purchases), 2) AS avg_web_purchases,
    ROUND(AVG(c.num_catalog_purchases), 2) AS avg_catalog_purchases,
    ROUND(AVG(c.num_store_purchases), 2) AS avg_store_purchases,
    ROUND(AVG(c.num_web_visits_month), 2) AS avg_monthly_web_visits
FROM customers c
JOIN customer_segments s ON c.id = s.customer_id
GROUP BY s.cluster
ORDER BY s.cluster;
