import pandas as pd
from sqlalchemy.orm import Session
from sqlalchemy.sql import func
from app.db.db_prod import SessionLocal, engine
from app.db.base import Base
from app.models import Region, Property, HousingPrice, IncomeData
import random
import unicodedata

def clean_income_data():
    df = pd.read_csv('/app/dataset/RawIncomeData2.csv')
    df = df.drop(['DGUID', 'UOM', 'UOM_ID', 'SCALAR_FACTOR', 'VECTOR', 'SCALAR_ID', 'COORDINATE', 'STATUS', 'SYMBOL', 'TERMINATED', 'DECIMALS'], axis=1)
    df = df[(df['Family income'] == 'All income groups') & (df['Age of older adult'] == 'Total all ages') & (df['Family type'] == 'Couple families')]  
    df = df.drop(['Family type', 'Age of older adult', 'Family income'], axis=1)
    df = df.rename(columns={'REF_DATE':'year', 'GEO':'region_name', 'VALUE':'avg_income'})
    df[['region_name', 'province']] = df['region_name'].str.split(', ', expand=True)
    province_mapping = {
        "Alberta": "AB",
        "British Columbia": "BC",
        "Manitoba": "MB",
        "New Brunswick": "NB",
        "Newfoundland and Labrador": "NL",
        "Northwest Territories": "NT",
        "Nova Scotia": "NS",
        "Nunavut": "NU",
        "Ontario": "ON",
        "Prince Edward Island": "PE",
        "Quebec": "QC",
        "Saskatchewan": "SK",
        "Yukon": "YT"
    }

    # Normalize province names to strip accents and standardize case
    def normalize_province_name(name):
        if pd.isna(name):
            return name
        name = unicodedata.normalize('NFKD', name).encode('ASCII', 'ignore').decode('utf-8')
        return name.strip()

    df['province'] = df['province'].apply(normalize_province_name)
    df['province'] = df['province'].map(province_mapping)
    df.to_csv("/app/dataset/IncomeData2.csv", index=False)

if __name__ == "__main__":
    clean_income_data()