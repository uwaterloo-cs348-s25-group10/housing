import pandas as pd
from sqlalchemy import text
from sqlalchemy.orm import Session
from sqlalchemy.sql import func
from app.db.db_prod import SessionLocal, engine
from app.db.base import Base
from app.models import Region, Property, HousingPrice, IncomeData
import random

# Note that this data is for production
# By running the function, 
#   pre-established database will be removed and reset (full-reset)

# Author: Minjae Lee
# Note that get helped by Claude (LLM) to implement 'import_data.py' on Docker & debugging

def full_reset():
    Base.metadata.drop_all(bind=engine)

def add_data_constraints(db: Session):
    """Adds tuple-based data integrity constraints to housing_price and income_data tables."""

    print("Adding data integrity constraints...")

    constraints = [
        # HousingPrice constraints
        """
        ALTER TABLE housing_price
        ADD CONSTRAINT chk_price_positive CHECK (avg_price > 0)
        """,
        """
        ALTER TABLE housing_price
        ADD CONSTRAINT chk_year_range CHECK (year BETWEEN 1900 AND 2100)
        """,

        # IncomeData constraints
        """
        ALTER TABLE income_data
        ADD CONSTRAINT chk_income_min CHECK (avg_income >= 5000)
        """,
        """
        ALTER TABLE income_data
        ADD CONSTRAINT chk_income_year_range CHECK (year BETWEEN 1900 AND 2100)
        """,
    ]

    for sql in constraints:
        try:
            db.execute(text(sql))
            print(f"Executed: {sql.strip().splitlines()[0]}")
        except Exception as e:
            if "already exists" in str(e):
                print(f"Constraint already exists, skipping.")
            else:
                print(f"Failed to execute constraint:\n{sql}\nError: {e}")

    db.commit()
    print("All constraints added.")

def load_csv_data(random_year: bool = False):
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        print("Region...")
        region_df = pd.read_csv('/app/dataset/Region.csv')
        region_df = region_df.drop_duplicates(subset=['name', 'province'])

        regions = []
        for idx, row in region_df.iterrows():
            if pd.notna(row['name']) and pd.notna(row['province']):
                regions.append(Region(
                    region_id = idx + 1,
                    name=str(row['name']),
                    province=str(row['province'])
                ))
            else:
                print(f"Skipping region row with missing data: {row['name']}, {row['province']}")
        db.add_all(regions)
        db.commit()
        print("Region Inserted")

        print("Property...")
        region_mapping = {(str(r.name), str(r.province)): r.region_id for r in regions}
        property_df = pd.read_csv('/app/dataset/Property.csv')

        property_df = property_df.drop_duplicates(subset=['region_name', 'province', 'type', 'subtype'])

        properties = []
        property_mapping = {}

        for idx, row in property_df.iterrows():
            if pd.notna(row['region_name']) and pd.notna(row['province']) and pd.notna(row['type']):
                region_key = (str(row['region_name']), str(row['province']))
                region_id = region_mapping.get(region_key)

                if region_id:
                    property_id = idx + 1
                    subtype = str(row['subtype']) if pd.notna(row['subtype']) else ''
                    prop_key = (str(row['region_name']), str(row['province']), str(row['type']), subtype)
                    property_mapping[prop_key] = property_id
                    properties.append(Property(
                        property_id=property_id,
                        region_id=region_id, 
                        type = str(row['type']),
                        subtype=subtype
                    ))
                else:
                    print(f"No region for: {region_key}")
            else:
                print(f"Skipping property row with missing data: {row['region_name']}, {row['province']}, {row['type']}")

        db.add_all(properties)
        db.commit()
        print("Property Inserted")

        print("Housing...")
        housing_df = pd.read_csv('/app/dataset/HousingPrice.csv')
        
        housing_prices = []
        property_lookup = {
            (str(key[0]), str(key[1])): prop_id
            for key, prop_id in property_mapping.items()
        }
        seen_keys = set()
        for idx, row in housing_df.iterrows():
            if pd.notna(row['region_name']) and pd.notna(row['province']) and pd.notna(row['avg_price']):
                region_key = (str(row['region_name']), str(row['province']))
                region_id = region_mapping.get(region_key)
                
                if region_id:
                    property_id = property_lookup.get(region_key)
                    
                    if property_id:
                        year = random.randrange(2020, 2026) if random_year else int(row['year'])
                        key = (property_id, year)
                        
                        if key in seen_keys:
                            continue
                        seen_keys.add(key)

                        housing_prices.append(HousingPrice(
                            housing_id=idx + 1,
                            property_id=property_id,
                            year=year,
                            avg_price=float(row['avg_price'])
                        ))
                    else:
                        print(f"No property found for region: {region_key}")
                else:
                    print(f"No region for: {region_key}")
            else:
                print(f"Skipping housing row with missing data: {row['region_name']}, {row['province']}, {row['avg_price']}")
        
        batch_size = 5000
        for i in range(0, len(housing_prices), batch_size):
            batch = housing_prices[i: i + batch_size]
            try:
                db.add_all(batch)
                db.commit()
            except Exception as e: 
                db.rollback()
                print(f"{ i // batch_size+1 } failed: e")
                for record in batch:
                    try:
                        db.add(record)
                        db.commit()
                    except:
                        db.rollback()
        print("Housing Inserted")

        print("IncomeData2...")
        income_df = pd.read_csv('/app/dataset/IncomeData2.csv')
        income_data1 = []
        region_mapping = {(str(r.name), str(r.province)): r.region_id for r in regions}
        seen_keys = set()
        lastIdx = 0
        for idx, row in income_df.iterrows():
            region_key = (str(row['region_name']), str(row['province']))
            region_id = region_mapping.get(region_key)

            if region_id and pd.notna(row['avg_income']):
                year = int(row['year'])
                key = (region_id, year)

                if key in seen_keys:
                    continue
                seen_keys.add(key)
                
                income_data1.append(IncomeData(
                    income_id=idx+1,
                    region_id = region_id,
                    year=year,
                    avg_income=float(row['avg_income'])
                ))
                lastIdx = idx + 1
            else:
                if not region_id:
                    print(f"Region not found: {region_key}")       
                else:
                    print("Something Happened")
        
        db.add_all(income_data1)
        db.commit()
        print("IncomeData2 Inserted")

        print("IncomeData1...")
        income_df2 = pd.read_csv('/app/dataset/IncomeData1.csv')
        income_data2 = []
        region_mapping = {(str(r.name), str(r.province)): r.region_id for r in regions}
        # seen_keys = set()
        for idx, row in income_df2.iterrows():
            region_key = (str(row['region_name']), str(row['province']))
            region_id = region_mapping.get(region_key)

            if region_id and pd.notna(row['avg_income']):
                year = random.randrange(2020, 2026) if random_year else int(row['year'])
                key = (region_id, year)

                if key in seen_keys:
                    continue
                seen_keys.add(key)
                
                income_data2.append(IncomeData(
                    income_id=lastIdx+1,
                    region_id = region_id,
                    year=year,
                    avg_income=float(row['avg_income'])
                ))
                lastIdx += 1 
            else:
                if not region_id:
                    print(f"Region not found: {region_key}")       
                else:
                    print("Something Happened")

        db.add_all(income_data2)
        db.commit()
        print("IncomeData1 Inserted")


        print("Income Inserted")
        print("CSV Sync done")
        add_data_constraints(db)

    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
        raise
    finally:
        db.close()

def verify_data(sample_size: int = 5, random: bool = True):
    db = SessionLocal()
    try:
        print(f"Regions: {db.query(Region).count()}")
        print(f"Properties: {db.query(Property).count()}")
        print(f"HousingPrices: {db.query(HousingPrice).count()}")
        print(f"IncomeData: {db.query(IncomeData).count()}")
        print("\n=== Random Sample Data ===")

        print("\nRegion Sample:")
        print(f"{'ID':<5} {'Name':<20} {'Province':<15}")
        for r in db.query(Region).order_by(func.random() if random else "region_id").limit(sample_size):
            print(f"{r.region_id:<5} {r.name:<20} {r.province:<15}")

        print("\nProperty Sample:")
        print(f"{'ID':<5} {'Type':<15} {'Subtype':<15} {'RegionID':<10}")
        for p in db.query(Property).order_by(func.random() if random else "property_id").limit(sample_size):
            print(f"{p.property_id:<5} {p.type:<15} {p.subtype:<15} {p.region_id:<10}")

        print("\nHousingPrice Sample:")
        print(f"{'ID':<5} {'PropertyID':<12} {'Year':<6} {'AvgPrice':<10}")
        for h in db.query(HousingPrice).order_by(func.random() if random else "housing_id").limit(sample_size):
            print(f"{h.housing_id:<5} {h.property_id:<12} {h.year:<6} {h.avg_price:<10.2f}")

        print("\nIncomeData Sample:")
        print(f"{'ID':<5} {'RegionID':<10} {'Year':<6} {'AvgIncome':<10}")
        for i in db.query(IncomeData).order_by(func.random() if random else "income_id").limit(sample_size):
            print(f"{i.income_id:<5} {i.region_id:<10} {i.year:<6} {i.avg_income:<10.2f}")

    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    full_reset()
    load_csv_data(random_year=True)
    verify_data()