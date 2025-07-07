from sqlalchemy import Column, Integer, Text, Float, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.database import Base

class Property(Base):
    __tablename__ = "property"

    property_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    region_id = Column(Integer, ForeignKey("region.region_id"), nullable=False, index=True)
    type = Column(Text, nullable=False)
    subtype = Column(Text, nullable=True)

    region = relationship("Region", back_populates="properties")
    housing_prices = relationship("HousingPrice", back_populates="property", cascade="all, delete-orphan")