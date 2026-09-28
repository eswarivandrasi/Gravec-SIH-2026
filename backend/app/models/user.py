from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum as SQLEnum
from sqlalchemy.sql import func
from app.database import Base
import enum

class UserRole(str, enum.Enum):
    ADMIN = "admin"
    ANALYST = "analyst"
    RESPONDER = "responder"
    CITIZEN = "citizen"

class LanguagePreference(str, enum.Enum):
    TELUGU = "telugu"
    HINDI = "hindi"
    ENGLISH = "english"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    phone_number = Column(String(20), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), default=UserRole.CITIZEN)
    preferred_language = Column(String(20), default=LanguagePreference.ENGLISH)
    state = Column(String(100), default="Andhra Pradesh")
    district = Column(String(100), nullable=False, index=True)
    area = Column(String(100), nullable=True)
    alert_preference = Column(String(50), default="ALL") # SMS, IVR, WHATSAPP, ALL
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
