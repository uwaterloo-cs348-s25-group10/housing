-- FEATURE 1a EXPLORE HOUSING PRICES
-- This query returns the average price of Ontario (“ON”) condos in 2020, broken down by region.
\echo '== FEATURE 1a EXPLORE HOUSING PRICES: Average price of ON condos in 2020 by region =='
SELECT
  R.name AS region,
  R.province AS province,
  HP.year AS year,
  P.type AS property_type,
  AVG(HP.avg_price) AS avg_price
FROM housing_price HP
JOIN property P ON HP.property_id = P.property_id
JOIN region R ON P.region_id    = R.region_id
WHERE R.province = 'ON'
  AND P.type = 'Condo'
  AND HP.year = 2020
GROUP BY R.name, R.province, HP.year, P.type;

-- FEATURE 1b EXPLORE INCOME DATA
-- This query returns the average 2020 income for Ontario regions, grouped by region.
\echo '== FEATURE 1b EXPLORE INCOME DATA: Average income of ON regions in 2020 =='
SELECT
  R.name AS region,
  R.province AS province,
  I.year AS year,
  AVG(I.avg_income) AS avg_income
FROM income_data I
JOIN region R ON I.region_id = R.region_id
WHERE R.province = 'ON'
  AND I.year = 2020
GROUP BY R.name, R.province, I.year;

-- FEATURE 7b AFFORDABILITY BY INCOME
-- Calculates Home‐Affordability Index (HAI) = (user_income / avg_price) × 100,
-- then returns the top 5 regions where HAI ≥ 25 for 2020 condos.
\echo 'FEATURE 2: Top 5 regions where $145,000 income yields HAI ≥ 25% for 2020 condos'
SELECT
  sub.region,
  sub.user_HAI
FROM (
  SELECT
    R.name AS region,
    ROUND(((145000.0 / HP.avg_price) * 100)::numeric, 2) AS user_HAI
  FROM housing_price HP
  JOIN property P ON HP.property_id = P.property_id
  JOIN region R ON P.region_id = R.region_id
  WHERE HP.year = 2020
    AND P.type = 'Condo'
) AS sub
WHERE sub.user_HAI >= 25
ORDER BY sub.user_HAI DESC
LIMIT 5;

-- FEATURE 3: Reverse Lookup – Where Did This Price Exist?
-- Finds regions, property types, years, and prices within ±$25,000 of $600,000
\echo 'FEATURE 3: Reverse Lookup – Where Did This Price Exist? (±$25,000 around 600000)'
SELECT
  R.name AS region,
  P.type AS property_type,
  HP.year,
  HP.avg_price
FROM housing_price HP
JOIN property P ON HP.property_id = P.property_id
JOIN region R ON P.region_id = R.region_id
WHERE ABS(HP.avg_price - 600000) <= 25000;

-- FEATURE 4: Affordability Ranking by Region (HAI Rankings)
-- Computes Home‐Affordability Index (HAI) = (avg_income / avg_price) × 100
-- and returns the top 5 most affordable regions for 2020 condos.
\echo 'FEATURE 4: Top 5 HAI rankings for all regions in 2020 condos'
SELECT
  r.region_id,
  r.name,
  ROUND((i.avg_income / AVG(h.avg_price) * 100)::numeric, 2) AS hai_index
FROM region AS r
JOIN property AS p ON r.region_id = p.region_id
JOIN housing_price AS h ON p.property_id = h.property_id
JOIN income_data AS i ON i.region_id = r.region_id AND i.year = h.year
WHERE
  h.year = 2020
  AND p.type = 'Condo'
GROUP BY r.region_id, r.name, i.avg_income
ORDER BY hai_index DESC
LIMIT 5;

