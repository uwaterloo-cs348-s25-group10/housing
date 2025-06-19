from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
import time
import logging
from sqlalchemy.exc import OperationalError
from sqlalchemy.orm import Session
from typing import Optional
from sqlalchemy import func, text, create_engine

import app.models
from app.models import Apartment, Property, HousingPrice, Region, IncomeData
from app.database import SessionLocal, engine, Base

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
def create_apartments(type: str, subtype: str, region_id: int, db: Session = Depends(get_db)):
    property = Property(type=type, subtype=subtype, region_id=region_id)
    db.add(property)
    db.commit()
    db.refresh(property)
    return property

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

@app.get("/trends/housing")
def housing_trends(
    province: str,
    property_type: str,
    year: int,
    db: Session = Depends(get_db)
):
    """
    Returns the average sale price for each region in the given
    province, property type, and year.
    """
    q = (
        db.query(
            Region.name.label("region"),
            HousingPrice.year,
            Property.type.label("property_type"),
            func.avg(HousingPrice.avg_price).label("avg_price"),
        )
        .join(Property, HousingPrice.property_id == Property.property_id)
        .join(Region, Property.region_id == Region.region_id)
        .filter(
            Region.province == province,
            Property.type == property_type,
            HousingPrice.year == year,
        )
        .group_by(Region.name, HousingPrice.year, Property.type)
        .order_by(Region.name)
    )

    return [
        {
            "region": region,
            "year": yr,
            "property_type": ptype,
            "avg_price": avg,
        }
        for region, yr, ptype, avg in q.all()
    ]
