from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
import time
import logging
from sqlalchemy import create_engine
from sqlalchemy.exc import OperationalError
from sqlalchemy.orm import Session
from optional import Optional
from app.models.apartments_model import Apartment
from app.models.property_model import Property
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
    query = """
    SELECT r.name, p.type, h.year, h.avg_price
    FROM HousingPrice h
    JOIN Property p ON h.property_id = p.property_id
    JOIN Region r ON p.region_id = r.region_id
    WHERE ABS(h.avg_price - :price) <= :margin
    """
    params = {"price": price, "margin": margin}

    if  property_type:
        query += " AND P.type = :property_type"
        params["property_type"] = property_type
    if year:
        query += " AND h.year = :year"
        params["year"] = year

    results = db.execute(query, params).fetchall()
    return [dict(row) for row in results]

