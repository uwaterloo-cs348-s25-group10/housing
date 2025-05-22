from sqlalchemy import Column, Integer, String, Float, ForeignKey
from app.database import Base

class Apartment(Base):
    __tablename__ = "apartments"

    id = Column(Integer, primary_key=True, index=True)
    city = Column(String)
    registration_number = Column(String)
