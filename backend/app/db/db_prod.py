from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# production
DB_ENV = os.getenv("DB_ENV")

def get_prod_db_url():
    print(f"""
Run Production Database
Current Env: {DB_ENV}
    """)
    return os.getenv("DATABASE_URL")

DATABASE_URL = get_prod_db_url()
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

