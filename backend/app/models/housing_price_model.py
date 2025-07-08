'''
Author: Nandini Mehrotra

HousingPrice(housing_id Int, property_id Int, year Int, avg_price Float)
'''

from sqlalchemy import Column, Integer, Float, ForeignKey, UniqueConstraint
from app.db.base import Base

class HousingPrice(Base):
    __tablename__ = "housing_price"

    housing_id  = Column(Integer, primary_key=True, index=True, autoincrement=True)
    property_id = Column(Integer, ForeignKey("property.property_id"), nullable=False, index=True)
    year        = Column(Integer, nullable=False)
    avg_price   = Column(Float, nullable=False)

    # Prevent duplicate snapshots for the same property/year
    __table_args__ = (
        UniqueConstraint("property_id", "year", name="uq_property_year"),
    )