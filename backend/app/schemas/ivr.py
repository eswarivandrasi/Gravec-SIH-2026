from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class IVRTestCallRequest(BaseModel):
    phone_number: str = "+919876543210"
    recipient_name: str = "Praveen Kumar"
    language: str = "telugu" # telugu, hindi, english
    cyclone_id: Optional[int] = None
    alert_id: Optional[int] = None
    district: str = "Visakhapatnam"

class IVRInteractRequest(BaseModel):
    call_sid: str
    digit: str # "1", "2", "3", "4", "5"
    current_language: str = "telugu"

class IVRInteractResponse(BaseModel):
    call_sid: str
    status: str # "IN_PROGRESS", "COMPLETED"
    digit_received: str
    action_taken: str
    voice_prompt: str
    audio_transcript_en: str
    audio_transcript_te: str
    audio_transcript_hi: str
    next_options: List[Dict[str, str]]
    language: str
    is_demo: bool = True

class IVRCallResponse(BaseModel):
    id: int
    call_sid: str
    recipient_name: str
    phone_number: str
    district: str
    language: str
    call_status: str
    duration_seconds: int
    digits_pressed: str
    audio_played: Optional[str] = None
    call_log: Optional[List[Dict[str, Any]]] = None
    is_demo: bool
    timestamp: Optional[datetime] = None

    class Config:
        from_attributes = True
