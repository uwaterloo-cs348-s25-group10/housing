"""
Author: Nandini Mehrotra

IncomeData(income_id Int, region_id Int, year Int, avg_income Float)
"""

from sqlalchemy import Column, Integer, Float, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.database import Base

class IncomeData(Base):
    __tablename__ = "income_data"

    income_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    region_id = Column(Integer, ForeignKey("region.region_id"), nullable=False, index=True)
    year = Column(Integer, nullable=False)
    avg_income = Column(Float, nullable=False)

    # Prevent duplicate snapshots for the same region/year
    __table_args__ = (
        UniqueConstraint("region_id", "year", name="uq_region_year"),
    )

    region = relationship("Region", back_populates="income_data")