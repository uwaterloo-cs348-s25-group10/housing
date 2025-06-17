from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
import time
import logging
from sqlalchemy import create_engine
from sqlalchemy.exc import OperationalError
from sqlalchemy.orm import Session
from app.models.apartments_model import Apartment
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