from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    cyclone_id = Column(Integer, ForeignKey("cyclones.id"), nullable=False, index=True)
    title = Column(String(200), nullable=False)
    severity = Column(String(50), default="CRITICAL") # INFO, WATCH, WARNING, CRITICAL, EMERGENCY
    hazard_type = Column(String(100), default="High Wind & Storm Surge")
    affected_districts = Column(JSON, nullable=False) # ["Visakhapatnam", "East Godavari", "Kakinada", "Srikakulam"]
    affected_states = Column(JSON, nullable=False) # ["Andhra Pradesh", "Odisha"]
    
    # Multilingual Voice & Text Alerts
    message_en = Column(Text, nullable=False)
    message_te = Column(Text, nullable=False)
    message_hi = Column(Text, nullable=False)
    
    channels = Column(JSON, default=["SMS", "IVR", "WHATSAPP", "SIREN"])
    is_broadcast = Column(Boolean, default=False)
    total_recipients = Column(Integer, default=0)
    delivered_count = Column(Integer, default=0)
    is_demo = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    cyclone = relationship("Cyclone", back_populates="alerts")
    recipients = relationship("AlertRecipient", back_populates="alert", cascade="all, delete-orphan")
    ivr_calls = relationship("IVRCall", back_populates="alert", cascade="all, delete-orphan")

class AlertRecipient(Base):
    __tablename__ = "alert_recipients"

    id = Column(Integer, primary_key=True, index=True)
    alert_id = Column(Integer, ForeignKey("alerts.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    phone_number = Column(String(20), nullable=False)
    language = Column(String(20), default="english")
    channel = Column(String(50), default="SMS")
    status = Column(String(50), default="SENT") # SENT, DELIVERED, FAILED
    sent_at = Column(DateTime(timezone=True), server_default=func.now())

    alert = relationship("Alert", back_populates="recipients")

class IVRCall(Base):
    __tablename__ = "ivr_calls"

    id = Column(Integer, primary_key=True, index=True)
    alert_id = Column(Integer, ForeignKey("alerts.id"), nullable=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    call_sid = Column(String(100), unique=True, index=True) # Unique Call ID
    recipient_name = Column(String(100), default="Citizen")
    phone_number = Column(String(20), nullable=False)
    district = Column(String(100), default="Visakhapatnam")
    language = Column(String(20), default="telugu") # telugu, hindi, english
    call_status = Column(String(50), default="COMPLETED") # INITIATED, RINGING, IN_PROGRESS, COMPLETED, FAILED
    duration_seconds = Column(Integer, default=45)
    digits_pressed = Column(String(50), default="1") # Track keypad navigation: e.g. "4 -> 1 -> 2"
    audio_played = Column(Text, nullable=True)
    call_log = Column(JSON, nullable=True)
    is_demo = Column(Boolean, default=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

    alert = relationship("Alert", back_populates="ivr_calls")

class SafetyInstruction(Base):
    __tablename__ = "safety_instructions"

    id = Column(Integer, primary_key=True, index=True)
    stage = Column(String(50), nullable=False) # "BEFORE", "DURING", "AFTER"
    category = Column(String(100), default="General Public") # Fishermen, Coastal Residents, Farmers, General Public
    instruction_en = Column(Text, nullable=False)
    instruction_te = Column(Text, nullable=False)
    instruction_hi = Column(Text, nullable=False)
    priority = Column(Integer, default=1)
    icon = Column(String(50), default="shield")

class Shelter(Base):
    __tablename__ = "shelters"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    district = Column(String(100), nullable=False, index=True)
    state = Column(String(100), default="Andhra Pradesh")
    address = Column(Text, nullable=False)
    capacity = Column(Integer, default=500)
    current_occupancy = Column(Integer, default=0)
    contact_phone = Column(String(20), default="1070")
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    amenities = Column(JSON, default=["Food", "First Aid", "Power Generator", "Clean Water", "Solar Lights"])
    status = Column(String(50), default="READY") # READY, FULL, EVACUATING
