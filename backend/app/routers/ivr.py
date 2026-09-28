from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from datetime import datetime

from app.database import get_db
from app.models.alert import IVRCall, Alert, Shelter, SafetyInstruction
from app.models.cyclone import Cyclone
from app.models.audit import AuditLog
from app.schemas.ivr import (
    IVRTestCallRequest, 
    IVRInteractRequest, 
    IVRInteractResponse, 
    IVRCallResponse
)
from app.services.ivr_service import ivr_provider

router = APIRouter(prefix="/api/ivr", tags=["Inclusive IVR Voice System"])

@router.get("/languages")
def get_supported_languages():
    return [
        {"code": "telugu", "name": "తెలుగు (Telugu)", "key": "1", "flag": "🇮🇳", "sample": "నమస్కారం. మీ ప్రాంతానికి తుఫాను హెచ్చరిక..."},
        {"code": "hindi", "name": "हिंदी (Hindi)", "key": "2", "flag": "🇮🇳", "sample": "नमस्ते। आपके क्षेत्र में चक्रवात चेतावनी..."},
        {"code": "english", "name": "English", "key": "3", "flag": "🌐", "sample": "Cyclone alert. A severe risk has been detected..."}
    ]

@router.get("/calls", response_model=List[IVRCallResponse])
def get_ivr_calls(db: Session = Depends(get_db)):
    return db.query(IVRCall).order_by(IVRCall.timestamp.desc()).limit(50).all()

@router.post("/test-call")
def initiate_ivr_call(req: IVRTestCallRequest, db: Session = Depends(get_db)):
    """
    Initiates an automated voice emergency call to non-smartphone / keypad users.
    """
    # Find alert or cyclone
    cyclone = None
    if req.cyclone_id:
        cyclone = db.query(Cyclone).filter(Cyclone.id == req.cyclone_id).first()
    if not cyclone:
        cyclone = db.query(Cyclone).first()

    context = {
        "cyclone_name": cyclone.name if cyclone else "VAYU-26",
        "district": req.district
    }

    call_result = ivr_provider.make_call(
        to_phone=req.phone_number,
        recipient_name=req.recipient_name,
        language=req.language,
        context=context
    )

    # Save to database
    db_call = IVRCall(
        alert_id=req.alert_id,
        call_sid=call_result["call_sid"],
        recipient_name=req.recipient_name,
        phone_number=req.phone_number,
        district=req.district,
        language=req.language,
        call_status="IN_PROGRESS",
        duration_seconds=5,
        digits_pressed="CALL_INITIATED",
        audio_played=call_result["voice_prompt"],
        call_log=[{
            "step": "INITIATION",
            "timestamp": datetime.utcnow().isoformat(),
            "language": req.language,
            "prompt": call_result["voice_prompt"]
        }],
        is_demo=True
    )
    db.add(db_call)
    db.add(AuditLog(
        username="ivr_engine",
        action="IVR_CALL_INITIATED",
        target_type="IVRCall",
        target_id=call_result["call_sid"],
        details={"phone": req.phone_number, "language": req.language, "district": req.district}
    ))
    db.commit()
    db.refresh(db_call)

    call_result["db_id"] = db_call.id
    return call_result

@router.post("/interact", response_model=IVRInteractResponse)
def interact_ivr_keypad(req: IVRInteractRequest, db: Session = Depends(get_db)):
    """
    Simulates user pressing physical keypad digits on non-smartphone:
    1 = Repeat alert
    2 = Safety instructions
    3 = Nearest shelter info
    4 = Change language
    5 = End call
    """
    call_record = db.query(IVRCall).filter(IVRCall.call_sid == req.call_sid).first()
    
    # Retrieve real shelter data for district
    district = call_record.district if call_record and call_record.district else "Visakhapatnam"
    shelter = db.query(Shelter).filter(Shelter.district.ilike(f"%{district}%")).first()
    if not shelter:
        shelter = db.query(Shelter).first()

    cyclone = db.query(Cyclone).first()
    context = {
        "cyclone_name": cyclone.name if cyclone else "Cyclone VAYU-26",
        "district": district,
        "shelter": shelter
    }

    interact_result = ivr_provider.collect_digits(
        call_sid=req.call_sid,
        digit=req.digit,
        current_language=req.current_language,
        context=context
    )

    if call_record:
        call_record.digits_pressed = f"{call_record.digits_pressed} -> {req.digit}"
        call_record.language = interact_result["language"]
        call_record.call_status = interact_result["status"]
        call_record.duration_seconds += 12
        call_record.audio_played = interact_result["voice_prompt"]
        
        current_logs = list(call_record.call_log or [])
        current_logs.append({
            "step": f"KEYPAD_{req.digit}",
            "action": interact_result["action_taken"],
            "timestamp": datetime.utcnow().isoformat(),
            "language": interact_result["language"],
            "prompt": interact_result["voice_prompt"]
        })
        call_record.call_log = current_logs
        
        db.add(AuditLog(
            username="ivr_engine",
            action="IVR_KEYPAD_DIGIT_PROCESSED",
            target_type="IVRCall",
            target_id=req.call_sid,
            details={"digit": req.digit, "action": interact_result["action_taken"], "language": interact_result["language"]}
        ))
        db.commit()

    return interact_result
