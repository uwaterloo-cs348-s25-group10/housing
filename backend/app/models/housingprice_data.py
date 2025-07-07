from sqlalchemy import Column, Integer, Text, Float, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.database import Base

class HousingPrice(Base):
    __tablename__ = "housing_price"

    housing_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    property_id = Column(Integer, ForeignKey("property.property_id"), nullable=False, index=True)
    year = Column(Integer, nullable=False, index=True)
    avg_price = Column(Float, nullable=False)

    property = relationship("Property", back_populates="housing_prices")