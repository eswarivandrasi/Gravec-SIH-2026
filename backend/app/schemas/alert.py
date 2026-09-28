from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class AlertCreate(BaseModel):
    cyclone_id: int
    title: str
    severity: str = "CRITICAL" # INFO, WATCH, WARNING, CRITICAL, EMERGENCY
    hazard_type: str = "High Wind & Storm Surge"
    affected_districts: List[str]
    affected_states: List[str] = ["Andhra Pradesh", "Odisha"]
    channels: List[str] = ["SMS", "IVR", "WHATSAPP", "SIREN"]
    is_broadcast: bool = False
    custom_message: Optional[str] = None

class AlertRecipientResponse(BaseModel):
    id: int
    user_id: Optional[int] = None
    phone_number: str
    language: str
    channel: str
    status: str
    sent_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class AlertResponse(BaseModel):
    id: int
    cyclone_id: int
    title: str
    severity: str
    hazard_type: str
    affected_districts: List[str]
    affected_states: List[str]
    message_en: str
    message_te: str
    message_hi: str
    channels: List[str]
    is_broadcast: bool
    total_recipients: int
    delivered_count: int
    is_demo: bool
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class SafetyInstructionResponse(BaseModel):
    id: int
    stage: str # BEFORE, DURING, AFTER
    category: str
    instruction_en: str
    instruction_te: str
    instruction_hi: str
    priority: int
    icon: str

    class Config:
        from_attributes = True

class ShelterResponse(BaseModel):
    id: int
    name: str
    district: str
    state: str
    address: str
    capacity: int
    current_occupancy: int
    contact_phone: str
    latitude: float
    longitude: float
    amenities: List[str]
    status: str

    class Config:
        from_attributes = True
