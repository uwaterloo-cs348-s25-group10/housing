'''
Aurthor: Minjae Lee

MonthlyHAISummary
'''

from sqlalchemy import Column, Date, Integer, Float, String, ForeignKey
from app.db.base import Base

class MonthlyHAISummary(Base):
    __tablename__ = "monthly_hai_summary"

    summary_month = Column(Date, primary_key=True)
    region_id     = Column(Integer, ForeignKey("region.region_id"), primary_key=True)
    hai           = Column(Float)
    rank_type     = Column(String, primary_key=True)