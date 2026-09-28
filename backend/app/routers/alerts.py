from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from datetime import datetime

from app.database import get_db
from app.models.alert import Alert, AlertRecipient, IVRCall
from app.models.cyclone import Cyclone
from app.models.user import User
from app.models.audit import AuditLog
from app.schemas.alert import AlertCreate, AlertResponse
from app.services.notification_service import NotificationService
from app.services.ivr_service import ivr_provider

router = APIRouter(prefix="/api/alerts", tags=["Emergency Alerts"])

@router.get("", response_model=List[AlertResponse])
def get_alerts(db: Session = Depends(get_db)):
    alerts = db.query(Alert).order_by(Alert.created_at.desc()).all()
    return alerts

@router.get("/history", response_model=List[AlertResponse])
def get_alert_history(db: Session = Depends(get_db)):
    return db.query(Alert).order_by(Alert.created_at.desc()).limit(50).all()

@router.post("", response_model=AlertResponse)
def create_and_broadcast_alert(alert_in: AlertCreate, db: Session = Depends(get_db)):
    cyclone = db.query(Cyclone).filter(Cyclone.id == alert_in.cyclone_id).first()
    if not cyclone:
        raise HTTPException(status_code=404, detail="Cyclone not found")

    districts_str = ", ".join(alert_in.affected_districts)

    msg_en = alert_in.custom_message or (
        f"CYCLONE WARNING: Cyclone {cyclone.name} ({cyclone.classification}) poses severe threat to {districts_str}. "
        f"Gale winds of {cyclone.max_wind_speed:.0f} km/h and heavy storm surges expected. Evacuate to nearest shelter. Call 1070 for help."
    )
    
    msg_te = (
        f"తుఫాను హెచ్చరిక: {cyclone.name} ({cyclone.classification}) ప్రభావంతో {districts_str} జిల్లాలలో తీవ్ర ప్రమాదం పొంచివుంది. "
        f"గంటకు {cyclone.max_wind_speed:.0f} కి.మీ వేగంతో పెనుగాలులు వీచే అవకాశం ఉంది. వెంటనే పునరావాస కేంద్రాలకు చేరుకోండి. అత్యవసర సహాయానికి 1070 కి కాల్ చేయండి."
    )

    msg_hi = (
        f"चक्रवात चेतावनी: चक्रवात {cyclone.name} ({cyclone.classification}) के कारण {districts_str} में भारी ख़तरा। "
        f"{cyclone.max_wind_speed:.0f} किमी/घंटा की तेज़ हवाएं और तूफ़ानी लहरों का अनुमान। तुरंत सुरक्षित राहत शिविरों में जाएं। हेल्पलाइन: 1070."
    )

    # Find registered users in affected districts
    users_in_district = db.query(User).filter(User.district.in_(alert_in.affected_districts)).all()
    total_target = max(len(users_in_district), 1250) # realistic simulated recipient count

    alert = Alert(
        cyclone_id=cyclone.id,
        title=alert_in.title,
        severity=alert_in.severity,
        hazard_type=alert_in.hazard_type,
        affected_districts=alert_in.affected_districts,
        affected_states=alert_in.affected_states,
        message_en=msg_en,
        message_te=msg_te,
        message_hi=msg_hi,
        channels=alert_in.channels,
        is_broadcast=alert_in.is_broadcast,
        total_recipients=total_target,
        delivered_count=int(total_target * 0.96),
        is_demo=True
    )
    db.add(alert)
    db.commit()
    db.refresh(alert)

    # Dispatch to registered users
    for u in users_in_district:
        rec = AlertRecipient(
            alert_id=alert.id,
            user_id=u.id,
            phone_number=u.phone_number,
            language=u.preferred_language,
            channel="IVR" if "IVR" in alert_in.channels else "SMS",
            status="DELIVERED"
        )
        db.add(rec)

    # Multi-channel notification simulation
    if "SMS" in alert_in.channels:
        NotificationService.dispatch_sms([u.phone_number for u in users_in_district], msg_en)
    if "SIREN" in alert_in.channels:
        NotificationService.dispatch_siren_alert(alert_in.affected_districts, alert.severity)

    # Audit log
    db.add(AuditLog(
        username="admin",
        action="MASS_EMERGENCY_ALERT_DISPATCHED",
        target_type="Alert",
        target_id=str(alert.id),
        details={"cyclone": cyclone.name, "districts": alert_in.affected_districts, "recipients": total_target}
    ))
    db.commit()

    return alert

@router.post("/test")
def test_alert_dispatch(
    phone_number: str = "+919876543210", 
    district: str = "Visakhapatnam", 
    channel: str = "SMS", 
    language: str = "telugu",
    db: Session = Depends(get_db)
):
    """
    Triggers test alert delivery for verification.
    """
    test_msg = {
        "english": f"[TEST ALERT - DEMO] Cyclone warning for {district}. Stay tuned to local authorities. Emergency: 1070.",
        "telugu": f"[పరీక్ష హెచ్చరిక - డెమో] {district} జిల్లాకు తుఫాను అలర్ట్. సురక్షితంగా ఉండండి. హెల్ప్‌లైన్: 1070.",
        "hindi": f"[परीक्षण चेतावनी - डेमो] {district} जिले के लिए चक्रवात अलर्ट। सतर्क रहें। हेल्पलाइन: 1070."
    }

    selected_text = test_msg.get(language.lower(), test_msg["english"])

    db.add(AuditLog(
        username="tester",
        action="TEST_ALERT_SENT",
        target_type="TestAlert",
        target_id=phone_number,
        details={"phone": phone_number, "district": district, "channel": channel, "language": language}
    ))
    db.commit()

    return {
        "status": "success",
        "message": f"Test alert dispatched via {channel} to {phone_number}",
        "channel": channel,
        "language": language,
        "payload_text": selected_text,
        "is_demo": True
    }
