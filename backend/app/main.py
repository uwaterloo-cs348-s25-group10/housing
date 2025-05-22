from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from app.models.apartments_model import Apartment
from app.database import SessionLocal, engine, Base

Base.metadata.create_all(bind=engine)

app = FastAPI()

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