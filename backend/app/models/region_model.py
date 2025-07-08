from sqlalchemy import Column, Integer, String
from app.db.base import Base

class Region(Base):
    __tablename__ = "region"

    region_id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    province = Column(String, nullable=False)