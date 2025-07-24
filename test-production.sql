-- INDEXING
CREATE INDEX IF NOT EXISTS idx_region_province_name ON region(province, name);

CREATE INDEX IF NOT EXISTS idx_property_region_id ON property(region_id);
CREATE INDEX IF NOT EXISTS idx_property_type ON property(type);
CREATE INDEX IF NOT EXISTS idx_property_type_region ON property(type, region_id);
CREATE INDEX IF NOT EXISTS idx_property_region_type ON property(region_id, type);

CREATE INDEX IF NOT EXISTS idx_housing_year_property ON housing_price(year, property_id);
CREATE INDEX IF NOT EXISTS idx_housing_year_price ON housing_price(year, avg_price);

CREATE INDEX IF NOT EXISTS idx_income_year ON income_data(year);
CREATE INDEX IF NOT EXISTS idx_income_year_region ON income_data(year, region_id);

-- FEATURE 1a EXPLORE HOUSING PRICES
-- This query returns the average price of Ontario (“ON”) condos in 2020, broken down by region.
\echo '== FEATURE 1a EXPLORE HOUSING PRICES: Average price of ON condos in 2020 by region (Limit 10)=='
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
GROUP BY R.name, R.province, HP.year, P.type
LIMIT 10;

-- FEATURE 1b EXPLORE INCOME DATA
-- This query returns the average 2020 income for Ontario regions, grouped by region.
\echo '== FEATURE 1b EXPLORE INCOME DATA: Average income of ON regions in 2020 (Limit 10) =='
SELECT
  R.name AS region,
  R.province AS province,
  I.year AS year,
  AVG(I.avg_income) AS avg_income
FROM income_data I
JOIN region R ON I.region_id = R.region_id
WHERE R.province = 'ON'
  AND I.year = 2020
GROUP BY R.name, R.province, I.year
LIMIT 10;

-- FEATURE 2 AFFORDABILITY BY INCOME
-- Calculates Home‐Affordability Index (HAI) = (user_income / avg_price) × 100,
-- then returns the top 5 regions where HAI ≥ 25 for 2020 condos.
\echo 'FEATURE 2: Top 5 regions where $145,000 income yields HAI ≥ 25% for 2020 condos (Limit 10)'
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
LIMIT 10;

-- FEATURE 3: Reverse Lookup – Where Did This Price Exist?
-- Finds regions, property types, years, and prices within ±$25,000 of $600,000
\echo 'FEATURE 3: Reverse Lookup – Where Did This Price Exist? (±$25,000 around 600000) (Limit 10)'
SELECT
  R.name AS region,
  P.type AS property_type,
  HP.year,
  HP.avg_price
FROM housing_price HP
JOIN property P ON HP.property_id = P.property_id
JOIN region R ON P.region_id = R.region_id
WHERE ABS(HP.avg_price - 600000) <= 25000
LIMIT 10;

-- FEATURE 4: Affordability Ranking by Region (HAI Rankings)
-- Computes Home‐Affordability Index (HAI) = (avg_income / avg_price) × 100
-- and returns the top 5 most affordable regions for 2024 condos.
\echo 'FEATURE 4: Top 5 HAI rankings for all regions in 2020 condos (Limit 10)'
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

-- FEATURE 5: Data Gap Finder
-- Finds regions that contain housing data but are missing income data for condos in 2019
\echo 'FEATURE 5: Data Gap Finder - Regions with housing data but no income data for 2019 condos'
SELECT DISTINCT R.region_id, R.name AS region
FROM housing_price HP
JOIN property P ON HP.property_id = P.property_id
JOIN region R ON P.region_id = R.region_id
WHERE HP.year = 2019 AND P.type = 'Condo'
EXCEPT
SELECT R.region_id, R.name
FROM income_data I
JOIN region R ON I.region_id = R.region_id
WHERE I.year = 2019;

-- ADVANCED FEATURES

-- Advanced Feature 1: Find region that has at least x consecutive Income Growth
\echo 'Advanced Feature 1: Find region that has minimum x consecutive Income Growth (by default, x = 3) '
CREATE TEMP TABLE IncomeGrowthResult (
 region_id INT,
 region_name TEXT,
 max_consecutive_growth INT
);

DO $$
DECLARE
 reg RECORD;
 irow RECORD;
 prev_income FLOAT;
 prev_year INT;
 curr_growth INT;
 max_growth INT;
 target_n INT := 3;
BEGIN
 DELETE FROM IncomeGrowthResult;


 FOR reg IN
   SELECT DISTINCT r.region_id, r.name
   FROM Region r
   JOIN income_data i ON r.region_id = i.region_id
 LOOP
   prev_income := NULL;
   prev_year := NULL;
   curr_growth := 0;
   max_growth := 0;


   FOR irow IN
     SELECT year, avg_income
     FROM income_data
     WHERE region_id = reg.region_id
     ORDER BY year
   LOOP
     IF prev_income IS NULL THEN
       prev_income := irow.avg_income;
       prev_year := irow.year;
     ELSE
       IF irow.year > prev_year AND irow.avg_income > prev_income THEN
         curr_growth := curr_growth + 1;
       ELSE
         curr_growth := 0;
       END IF;


       IF curr_growth > max_growth THEN
         max_growth := curr_growth;
       END IF;


       prev_income := irow.avg_income;
       prev_year := irow.year;
     END IF;
   END LOOP;


   IF max_growth + 1 >= target_n THEN
     INSERT INTO IncomeGrowthResult(region_id, region_name, max_consecutive_growth)
     VALUES (reg.region_id, reg.name, max_growth + 1);
   END IF;


 END LOOP;
END $$;

SELECT * FROM IncomeGrowthResult;
