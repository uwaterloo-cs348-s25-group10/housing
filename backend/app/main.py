from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
import time
import logging
from sqlalchemy.exc import OperationalError
from sqlalchemy.orm import Session
from typing import Optional
from sqlalchemy import func, text, create_engine, distinct
from sqlalchemy import func, cast, Numeric, text

import csv
from app.models import Apartment, Property, HousingPrice, Region, IncomeData, MonthlyHAISummary
from app.db.db_prod import SessionLocal, engine
from app.db.base import Base
from app.import_data import full_reset, load_csv_data, verify_data
from fastapi.responses import JSONResponse

import os
import pandas as pd

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://frontend:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    max_retries = 30
    retry_interval = 2
    
    for attempt in range(max_retries):
        try:
            Base.metadata.create_all(bind=engine)
            with engine.begin() as conn:                
                conn.execute(text("CREATE EXTENSION IF NOT EXISTS pg_cron;"))

                conn.execute(text("""
                CREATE OR REPLACE FUNCTION refresh_monthly_hai() RETURNS VOID AS $$
                BEGIN
                  DELETE FROM monthly_hai_summary
                   WHERE summary_month = date_trunc('month', CURRENT_DATE);

                  WITH hai_vals AS (
                    SELECT
                      r.region_id,
                      (i.avg_income / h.avg_price) * 100 AS hai
                    FROM housing_price AS h
                    JOIN property     AS p ON h.property_id = p.property_id
                    JOIN region       AS r ON p.region_id   = r.region_id
                    JOIN income_data  AS i ON i.region_id   = r.region_id
                                           AND i.year        = h.year
                    WHERE h.year = EXTRACT(YEAR FROM CURRENT_DATE)::INT
                  ),
                  ranked AS (
                    SELECT
                      region_id,
                      hai,
                      ROW_NUMBER() OVER (ORDER BY hai DESC) AS rn
                    FROM hai_vals
                  )
                  INSERT INTO monthly_hai_summary(summary_month, region_id, hai, rank_type)
                  SELECT
                    date_trunc('month', CURRENT_DATE)::DATE,
                    region_id,
                    hai,
                    'TOP'
                  FROM ranked
                  WHERE rn <= 5;
                END;
                $$ LANGUAGE plpgsql;
                """))

                job_exists = conn.execute(text("""
                    SELECT COUNT(*) FROM cron.job WHERE jobname = 'monthly_hai_job';
                """)).scalar()

                if job_exists == 0:
                    conn.execute(text("""
                    SELECT cron.schedule(
                      'monthly_hai_job',
                      '0 2 1 * *',
                      $$SELECT refresh_monthly_hai();$$
                    );
                    """))
            logging.info("Database connected successfully!")
            break
        except OperationalError as e:
            if attempt < max_retries - 1:
                logging.warning(f"Database connection attempt {attempt + 1} failed. Retrying in {retry_interval} seconds...")
                time.sleep(retry_interval)
            else:
                logging.error("Failed to connect to database after all retries")
                raise e

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def read_root():
    return {"message": "Hello, World!"}

@app.get("/apartments/")
def read_apartments(db: Session = Depends(get_db)):
    apartments = db.query(Apartment).all()
    return apartments

@app.post("/apartments/")
def create_apartments(city: str, registration_number: str, db: Session = Depends(get_db)):
    apartment = Apartment(city=city, registration_number=registration_number)
    db.add(apartment)
    db.commit()
    db.refresh(apartment)
    return apartment

@app.get("/property")
def read_property(db: Session = Depends(get_db)):
    properties = db.query(Property).all()
    return properties

@app.post("/property/")
def create_apartments(type: str, region_id: int, db: Session = Depends(get_db)):
    property = Property(type=type, region_id=region_id)
    db.add(property)
    db.commit()
    db.refresh(property)
    return property


@app.get("/meta/housing")
def housing_meta(db: Session = Depends(get_db)):
    provinces = [p[0] for p in db.query(distinct(Region.province)).all()]
    years     = sorted([y[0] for y in db.query(distinct(HousingPrice.year)).all()])
    property_types = [t[0] for t in db.query(distinct(Property.type)).all()]
    return {
        "provinces": provinces,
        "years": years,
        "property_types": property_types,
    }

@app.get("/meta/regions/{province}")
def regions_by_province(province: str, db: Session = Depends(get_db)):
    names = [r[0] for r in db.query(distinct(Region.name))
                     .filter(Region.province == province)
                     .all()]
    return names

@app.get("/meta/income")
def income_meta(db: Session = Depends(get_db)):
    """
    Returns the list of distinct provinces and years for IncomeData,
    so the frontend can populate its dropdowns.
    """
    provinces = [p[0] for p in db.query(distinct(Region.province)).all()]
    years     = sorted([y[0] for y in db.query(distinct(IncomeData.year)).all()])
    return {
        "provinces": provinces,
        "years": years,
    }

# FEATURE 3
@app.get("/reverse-lookup")
def reverse_lookup(price: float, margin: int = 25000, property_type: Optional[str] = None, year: Optional[int] = None, db: Session = Depends(get_db)):
    q = (
        db.query(
            Region.name.label("region"),
            Property.type.label("property_type"),
            HousingPrice.year,
            HousingPrice.avg_price,
        )
        .join(Property, HousingPrice.property_id == Property.property_id)
        .join(Region, Property.region_id == Region.region_id)
        .filter(func.abs(HousingPrice.avg_price - price) <= margin)
    )

    if property_type:
        q = q.filter(Property.type == property_type)
    if year:
        q = q.filter(HousingPrice.year == year)

    return [
        {
            "region": region,
            "property_type": ptype,
            "year": yr,
            "avg_price": avg,
        }
        for region, ptype, yr, avg in q.all()
    ]

@app.get("/housing-price/")
def list_housing_prices(db: Session = Depends(get_db)):
    return db.query(HousingPrice).all()

@app.post("/housing-price/")
def create_housing_price(
    property_id: int,
    year: int,
    avg_price: float,
    db: Session = Depends(get_db)
):
    record = HousingPrice(
        property_id=property_id,
        year=year,
        avg_price=avg_price
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record

# FEATURE 1a
@app.get("/trends/housing")
def housing_trends(
    province: Optional[str] = Query(None),
    property_type: Optional[str] = Query(None),
    year: Optional[int] = Query(None),
    region: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """
    Returns the average sale price for each region in the given
    province, property type, and year.
    """
    base_q = (
        db.query(
            Region.name.label("region"),
            Region.province.label("province"),
            HousingPrice.year.label("year"),
            Property.type.label("property_type"),
            func.avg(HousingPrice.avg_price).label("avg_price"),
        )
        .join(Property, HousingPrice.property_id == Property.property_id)
        .join(Region, Property.region_id == Region.region_id)
    )

    filters = []
    if province:
        filters.append(Region.province == province)
    if region:
        filters.append(Region.name == region)
    if year:
        filters.append(HousingPrice.year == year)
    if property_type:
        filters.append(Property.type == property_type)

    q = (
        base_q
        .filter(*filters)
        .group_by(Region.name, Region.province, HousingPrice.year, Property.type)
        .order_by(Region.name)
    )

    return [
        {
            "region": region,
            "province": prov,
            "year": yr,
            "property_type": ptype,
            "avg_price": avg,
        }
        for region, prov, yr, ptype, avg in q.all()
    ]

# FEATURE 2
@app.get("/where-can-i-live")
def where_can_i_live(
    income: float,
    year: int,
    property_type: str,
    min_hai: float = 25,
    limit: int = 5,
    db: Session = Depends(get_db)
):
    hai_expr = cast((income / func.avg(HousingPrice.avg_price)) * 100, Numeric)

    results = (
        db.query(
            Region.name.label("region"),
            func.round(hai_expr, 2).label("user_hai"),
        )
        .join(Property, HousingPrice.property_id == Property.property_id)
        .join(Region, Property.region_id == Region.region_id)
        .filter(
            HousingPrice.year == year,
            Property.type == property_type,
        )
        .group_by(Region.name)
        .having(hai_expr >= min_hai)
        .order_by(text("user_hai DESC"))
        .limit(limit)
        .all()
    )

    return [
        {"region": region, "user_hai": float(hai)}
        for region, hai in results
    ]


# FEATURE 4
@app.get("/hai-rankings/")
def hai_rankings(year: Optional[int] = Query(None), property_type: Optional[str] = Query(None), db: Session = Depends(get_db)):
    hai_expr = cast(
        IncomeData.avg_income / func.avg(HousingPrice.avg_price) * 100,
        Numeric
    )
    filters = []
    if year:
        filters.append(HousingPrice.year == year)
    if property_type:
        filters.append(Property.type == property_type)
    q = (
        db.query(
            Region.region_id,
            Region.name.label("region"),
            func.round(hai_expr, 2).label("hai_index"),
        )
        .join(Property, Property.region_id == Region.region_id)
        .join(HousingPrice, HousingPrice.property_id == Property.property_id)
        .join(
            IncomeData,
            (IncomeData.region_id == Region.region_id) &
            (IncomeData.year == HousingPrice.year)
        )
        .filter(*filters)
        .group_by(
            Region.region_id,
            Region.name,
            IncomeData.avg_income
        )
        .having(func.avg(HousingPrice.avg_price) > 0)   # avoid NULL / zero
        .order_by(text("hai_index DESC"))
        .limit(5)
    )

    return [
        {"region_id": rid, "region": region, "hai_index": hai}
        for rid, region, hai in q.all()
    ]

@app.get("/data-gaps/")
def data_gap_finder(
    year: int,
    property_type: str,
    db: Session = Depends(get_db)
):

    price_regions = (
        db.query(
            Region.region_id,
            Region.name.label("region")
        )
        .join(Property, Property.region_id == Region.region_id)
        .join(HousingPrice, HousingPrice.property_id == Property.property_id)
        .filter(
            HousingPrice.year == year,
            Property.type == property_type
        )
        .distinct()
    )

    income_regions = (
        db.query(
            Region.region_id,
            Region.name.label("region")
        )
        .join(IncomeData, IncomeData.region_id == Region.region_id)
        .filter(IncomeData.year == year)
        .distinct()
    )

    gap_query = price_regions.except_(income_regions)

    return [
        {"region_id": rid, "region": region}
        for rid, region in db.execute(gap_query).fetchall()
    ]

# FEATURE 1b
@app.get("/trends/income")
def income_trends(
    province: Optional[str] = Query(None),
    region: Optional[str] = Query(None),
    year: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    """
    Returns the average income for each region in the given
    province and year.
    """
    filters = []
    if province:
        filters.append(Region.province == province)
    if region:
        filters.append(Region.name == region)
    if year:
        filters.append(IncomeData.year == year)

    q = (
        db.query(
            Region.name.label("region"),
            Region.province.label("province"),
            IncomeData.year.label("year"),
            func.avg(IncomeData.avg_income).label("avg_income"),
        )
        .join(Region, IncomeData.region_id == Region.region_id)
        .filter(*filters)
        .group_by(Region.name, Region.province, IncomeData.year)
        .order_by(Region.name)
    )

    return [
        {
            "region": region,
            "province": prov,
            "year": yr,
            "avg_income": avg_inc,
        }
        for region, prov, yr, avg_inc in q.all()
    ]

@app.post("/import-data/")
async def import_data(reset: bool = True, random_year: bool = False):
    """
        Import CSV data into the database.
        - reset: it will erase the current database
        - random_year: year will be randomly selected between 2000 and 2025

        Example: 
        curl -X POST "http://localhost:8000/import-data/?reset=true&random_year=true"
    """
    try:
        if reset:
            full_reset()
        
        load_csv_data(random_year=random_year)
        verify_data()
        
        return {"message": "Data imported successfully"}
    except Exception as e:
        logging.error(f"Data import failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Data import failed: {str(e)}")

@app.get("/heatmap")
async def get_heatmap(grid_size: float = 0.1, price_threshold: float = 0, db: Session = Depends(get_db)):
    """
    Advanced Feature:
    Returns clustered housing price points in GeoJSON format using data from cleaned_canada.csv
    """

    try:
        db.execute(text("DROP TABLE IF EXISTS CsvPoints"))
        db.execute(text("""
            CREATE TEMP TABLE CsvPoints (
                city TEXT,
                province TEXT,
                latitude DOUBLE PRECISION,
                longitude DOUBLE PRECISION,
                price DOUBLE PRECISION
            );
        """))

        with open("/app/dataset/original_dataset/cleaned_canada.csv", newline="") as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                try:
                    lat = float(row["Latitude"])
                    lon = float(row["Longitude"])
                    price = float(row["Price"])
                    city = row["City"]
                    province = row["Province"]

                    db.execute(text("""
                        INSERT INTO CsvPoints (city, province, latitude, longitude, price)
                        VALUES (:city, :province, :lat, :lon, :price);
                    """), {
                        "city": city,
                        "province": province,
                        "lat": lat,
                        "lon": lon,
                        "price": price,
                    })
                except Exception as row_err:
                    logging.warning(f"Skipping row due to error: {row_err}")
        db.commit()

        db.execute(text("DROP TABLE IF EXISTS RegionPriceCentroids"))
        db.execute(text("""
            CREATE TEMP TABLE RegionPriceCentroids AS
            SELECT 
                city AS region_name,
                province,
                AVG(latitude) AS lat,
                AVG(longitude) AS lon,
                COUNT(*) AS num_sales,
                ROUND(AVG(price)::NUMERIC, 2) AS avg_price
            FROM CsvPoints
            WHERE price > :price_threshold
            GROUP BY city, province;
        """), {"price_threshold": price_threshold})

        rows = db.execute(text("""
            SELECT region_name, province, lat, lon, num_sales, avg_price
            FROM RegionPriceCentroids;
        """)).fetchall()

        features = [
            {
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [row.lon, row.lat],
                },
                "properties": {
                    "region": row.region_name,
                    "province": row.province,
                    "count": row.num_sales,
                    "avg_price": float(row.avg_price),
                },
            }
            for row in rows
        ]

        return JSONResponse(content={
            "type": "FeatureCollection",
            "features": features,
        })

    except Exception as e:
        logging.error(f"Heatmap generation failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Heatmap generation failed: {str(e)}")

@app.post("/show-data")
async def show_data(size: int = 5, random: bool = True):
    """
        Check the current data
        - size: # of rows for each table
        - random: each row will be randomly selected. Otherwise, it will order by the 'key'


        Example: 
        curl -X POST "http://localhost:8000/show-data"
        curl -X POST "http://localhost:8000/show-data?size=10&random=True"
    """
    try:
        verify_data(sample_size=size, random=random)
        
        return {"message": "Check Log"}
    except Exception as e:
        logging.error(f"Data import failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Data import failed: {str(e)}")


@app.get("/downpayment-simulator/")
def downpayment_simulator(
    year: int = Query(..., ge=1900),
    property_type: str = Query(...),
    down_pct: float = Query(..., ge=0, le=1),
    save_pct: float = Query(..., ge=0, le=1),
    db: Session = Depends(get_db),
):
    q = (
        db.query(
            Region.region_id,
            Region.name.label("region"),
            func.round(
                cast(func.avg(HousingPrice.avg_price) * down_pct, Numeric),
                2
            ).label("down_payment"),
            func.round(
                cast(func.avg(IncomeData.avg_income) * save_pct, Numeric),
                2
            ).label("annual_savings"),
            func.ceil(
                (func.avg(HousingPrice.avg_price) * down_pct)
                / (func.avg(IncomeData.avg_income) * save_pct)
            ).label("years_to_goal"),
        )
        .join(Property, Property.region_id == Region.region_id)
        .join(HousingPrice, HousingPrice.property_id == Property.property_id)
        .join(
            IncomeData,
            (IncomeData.region_id == Region.region_id) &
            (IncomeData.year      == HousingPrice.year)
        )
        .filter(
            HousingPrice.year == year,
            Property.type == property_type,
        )
        .group_by(Region.region_id, Region.name)
        .order_by(text("years_to_goal ASC"))
    )

    return [
        {
            "region_id":      rid,
            "region":         region,
            "down_payment":   float(dp),
            "annual_savings": float(sav),
            "years_to_goal":  int(yrs),
        }
        for rid, region, dp, sav, yrs in q.all()
    ]

@app.get("/income-growth")
def income_growth(
    years: int = Query(3, description="Minimum number of consecutive years for income growth"),
    db: Session = Depends(get_db)
):
    """
        curl -X GET "http://localhost:8000/income-growth?years=3"
    """
    try:
        sql = text("""
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
                        minimum_y INT := :years;
                    BEGIN
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


                            IF max_growth + 1 >= minimum_y THEN
                                INSERT INTO IncomeGrowthResult(region_id, region_name, max_consecutive_growth)
                                VALUES (reg.region_id, reg.name, max_growth + 1);
                            END IF;
                        END LOOP;
                    END $$;""")
        db.execute(sql, {"years": years})

        result_sql = text("""
            SELECT
                t.region_id,
                t.region_name,
                t.max_consecutive_growth,
                r.province
            FROM IncomeGrowthResult t
            JOIN region r ON t.region_id = r.region_id
            ORDER BY t.max_consecutive_growth DESC, t.region_name;
        """)

        result = db.execute(result_sql).fetchall()

        return {
            "years": years,
            "total_regions": len(result),
            "regions": [
                {
                    "region_id": row.region_id,
                    "region_name": row.region_name,
                    "max_consecutive_growth": row.max_consecutive_growth,
                    "province": row.province
                } 
                for row in result
            ]
        }
    except Exception as e:
        logging.error(f"Income growth analysis failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Income growth analysis failed: {str(e)}")

@app.get("/monthly-summary")
def monthly_summary(db: Session = Depends(get_db)):
    """
        curl -X GET "http://localhost:8000/monthly-summary"
    """
       
    rows = db.execute(text("""
      SELECT summary_month, region_id, hai, rank_type
        FROM monthly_hai_summary
       WHERE summary_month = date_trunc('month', CURRENT_DATE)::DATE
       ORDER BY hai DESC;
    """)).fetchall()

    return [
      {
        "month":     r.summary_month.isoformat(),
        "region_id": r.region_id,
        "hai":       float(r.hai),
        "rank_type": r.rank_type
      }
      for r in rows
    ]

@app.get("/monthly-summary/all")
def monthly_summary(db: Session = Depends(get_db)):
    """
        curl -X GET "http://localhost:8000/monthly-summary/all"
    """
       
    rows = db.execute(text("""
        SELECT * FROM monthly_hai_summary;
    """)).fetchall()

    return [
      {
        "month":     r.summary_month.isoformat(),
        "region_id": r.region_id,
        "hai":       float(r.hai),
        "rank_type": r.rank_type
      }
      for r in rows
    ]

@app.post("/monthly-summary/refresh")
def monthly_summary(reset: bool = False, db: Session = Depends(get_db)):
    """
        curl -X POST "http://localhost:8000/monthly-summary/refresh"
        curl -X POST "http://localhost:8000/monthly-summary/refresh?reset=True" 
            if you want to reset

    """
    
    if reset:
        db.execute(text("""
        DO $$
        DECLARE
            y INT;
        BEGIN
            FOR y IN SELECT DISTINCT year FROM housing_price LOOP
                DELETE FROM monthly_hai_summary WHERE summary_month = make_date(y, EXTRACT(MONTH FROM CURRENT_DATE)::INT, 1);

                WITH hai_vals AS (
                    SELECT
                    r.region_id,
                    (i.avg_income / h.avg_price) * 100 AS hai
                    FROM housing_price AS h
                    JOIN property     AS p ON h.property_id = p.property_id
                    JOIN region       AS r ON p.region_id   = r.region_id
                    JOIN income_data  AS i ON i.region_id   = r.region_id
                                        AND i.year        = h.year
                    WHERE h.year = y
                ),
                ranked AS (
                    SELECT region_id, hai, ROW_NUMBER() OVER (ORDER BY hai DESC) AS rn
                    FROM hai_vals
                )
                INSERT INTO monthly_hai_summary(summary_month, region_id, hai, rank_type)
                SELECT make_date(y, EXTRACT(MONTH FROM CURRENT_DATE)::INT, 1),
                    region_id,
                    hai,
                    'TOP'
                FROM ranked
                WHERE rn <= 5;
            END LOOP;
        END $$;
        """))
    else:
        db.execute(text("""SELECT refresh_monthly_hai();"""))
    db.commit()
    return {"ok": True}