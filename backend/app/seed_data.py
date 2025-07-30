"""
Author: Nandini Mehrotra
Purpose: Drop & recreate tables, then insert dummy data for Region, Property, HousingPrice and IncomeData.
"""

from app.db.db_sample import SessionLocal, engine
from app.db.base import Base
from app.models import Region, Property, HousingPrice, IncomeData

def seed():

    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # Regions
        regions = [
            Region(region_id=1, name="Vancouver", province="BC"),
            Region(region_id=2, name="Calgary",   province="AB"),
            Region(region_id=3, name="Toronto",   province="ON"),
            Region(region_id=4, name="Ottawa",    province="ON"),
            Region(region_id=5, name="Montreal",  province="QC"),
        ]
        db.add_all(regions)
        db.commit()

        # Properties
        properties = [
            Property(property_id=1, region_id=1, type="Condo"),
            Property(property_id=2, region_id=2, type="Condo"),
            Property(property_id=3, region_id=3, type="Condo"),
            Property(property_id=4, region_id=4, type="Condo"),
            Property(property_id=5, region_id=5, type="Condo"),
        ]
        db.add_all(properties)
        db.commit()

        # HousingPrice
        housing_prices = [
            HousingPrice(housing_id=1, property_id=1, year=2020, avg_price=550000),
            HousingPrice(housing_id=2, property_id=2, year=2020, avg_price=475000),
            HousingPrice(housing_id=3, property_id=3, year=2020, avg_price=625000),
            HousingPrice(housing_id=4, property_id=4, year=2020, avg_price=500000),
            HousingPrice(housing_id=5, property_id=5, year=2020, avg_price=525000),
            HousingPrice(housing_id=6, property_id=1, year=2019, avg_price=530000),
            HousingPrice(housing_id=7, property_id=2, year=2019, avg_price=480000),
        ]
        db.add_all(housing_prices)
        db.commit()

        # IncomeData
        income_data = [
            IncomeData(income_id=1, region_id=1, year=2020, avg_income=120000),
            IncomeData(income_id=2, region_id=2, year=2020, avg_income=95000),
            IncomeData(income_id=3, region_id=3, year=2020, avg_income=120000),
            IncomeData(income_id=4, region_id=4, year=2020, avg_income=105000),
            IncomeData(income_id=5, region_id=5, year=2020, avg_income=115000),
            IncomeData(income_id=6, region_id=5, year=2021, avg_income=120000),
            IncomeData(income_id=7, region_id=5, year=2022, avg_income=125000),
            IncomeData(income_id=8, region_id=4, year=2021, avg_income=125000),
            IncomeData(income_id=9, region_id=3, year=2024, avg_income=150000),
            IncomeData(income_id=10, region_id=1, year=2021, avg_income=100000),
        ]
        db.add_all(income_data)
        db.commit()

        print("✅ Seed data inserted!")
    finally:
        db.close()

if __name__ == "__main__":
    seed()
