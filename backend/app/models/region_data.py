from sqlalchemy import Column, Integer, Text, Float, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.database import Base

class Region(Base):
    __tablename__ = "region"

    region_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(Text, nullable=False)
    province = Column(Text, nullable=False)

    properties = relationship("Property", back_populates="region", cascade="all, delete-orphan")
    income_data = relationship("IncomeData", back_populates="region", cascade="all, delete-orphan")