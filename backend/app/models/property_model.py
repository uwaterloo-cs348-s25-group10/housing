'''
Aurthor: Minjae Lee

Property(property_id Int, region_id Int, type String, subtype String)
'''

from sqlalchemy import Column, Integer, String, Float, ForeignKey
from app.database import Base

# Property(property_id, region_id, type, subtype) (Minjae Lee)


class Property(Base):
    __tablename__ = "property"

    property_id = Column(Integer, primary_key=True, index=True)
    region_id = Column(Integer, ForeignKey("region.region_id"))
    type = Column(String)
    subtype = Column(String)
