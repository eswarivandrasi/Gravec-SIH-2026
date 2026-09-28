from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON, Text
from sqlalchemy.sql import func
from app.database import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    username = Column(String(100), default="system")
    action = Column(String(100), nullable=False) # e.g. "AI_ANALYSIS_TRIGGERED", "MASS_ALERT_DISPATCHED", "IVR_TRIGGERED"
    target_type = Column(String(50), nullable=True) # "Cyclone", "Alert", "User", "Model"
    target_id = Column(String(50), nullable=True)
    details = Column(JSON, nullable=True)
    ip_address = Column(String(50), default="127.0.0.1")
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
