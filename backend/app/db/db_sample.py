from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os

# production
DB_ENV = os.getenv("DB_ENV")

def get_sample_database_url():
    sample_db_url = os.getenv("SAMPLE_DATABASE_URL")
    if not sample_db_url:
        raise ValueError(f"""
There is no SAMPLE_DATABASE_URL
                             
Current Env: {DB_ENV}
If current environment is production, please run 'make run-sample'
        """)
    print(f"""
Run Sample Database
Current Env: {DB_ENV}
    """)
    return sample_db_url 

DATABASE_URL = get_sample_database_url()
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
