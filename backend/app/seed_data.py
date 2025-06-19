"""
Author: Nandini Mehrotra
Purpose: Drop & recreate all tables, then insert dummy data
         for Regions, Properties, HousingPrice, Apartments.
"""

from app.database import SessionLocal, engine, Base
from app.models import Region, Property, HousingPrice, Apartment

def seed():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # Regions
        toronto = Region(name="Toronto", province="ON")
        ottawa  = Region(name="Ottawa", province="ON")
        montreal= Region(name="Montreal", province="QC")
        db.add_all([toronto, ottawa, montreal])
        db.commit()

        # Properties
        p1 = Property(region_id=toronto.region_id, type="Condo", subtype="High-rise")
        p2 = Property(region_id=toronto.region_id, type="House", subtype="Detached")
        p3 = Property(region_id=ottawa.region_id,  type="Condo", subtype="Low-rise")
        p4 = Property(region_id=montreal.region_id,type="Apartment", subtype="Loft")
        db.add_all([p1, p2, p3, p4])
        db.commit()

        # HousingPrice (multiple years & price ranges)
        prices = [
            (p1.property_id, 2020, 800_000),
            (p1.property_id, 2021, 850_000),
            (p2.property_id, 2020, 1_200_000),
            (p2.property_id, 2021, 1_250_000),
            (p3.property_id, 2020, 400_000),
            (p3.property_id, 2021, 420_000),
            (p4.property_id, 2020, 300_000),
            (p4.property_id, 2021, 320_000),
        ]
        db.add_all([
            HousingPrice(property_id=pid, year=yr, avg_price=price)
            for pid, yr, price in prices
        ])
        db.commit()

        # Apartments
        a1 = Apartment(city="Toronto", registration_number="A-100")
        a2 = Apartment(city="Ottawa", registration_number="O-200")
        db.add_all([a1, a2])
        db.commit()

        print("✅ Seed data inserted!")
    finally:
        db.close()

if __name__ == "__main__":
    seed()
