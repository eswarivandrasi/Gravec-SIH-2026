import platform
import os
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime

from app.database import get_db
from app.config import settings
from app.models.audit import AuditLog
from app.models.user import User

router = APIRouter(prefix="/api/system", tags=["System Health & Administration"])

@router.get("/status")
def get_system_status(db: Session = Depends(get_db)):
    return {
        "project": settings.PROJECT_NAME,
        "tagline": settings.TAGLINE,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "demo_mode": settings.DEMO_MODE,
        "disclaimer": "DEMO DATA MODE: All simulations and predictions are generated for Smart India Hackathon 2026 prototype evaluation. Not for operational navigation.",
        "server_time": datetime.utcnow().isoformat(),
        "os_platform": platform.platform(),
        "python_version": platform.python_version(),
        "database": "SQLite / PostgreSQL Compatible",
        "subsystems": {
            "satellite_ingestion_engine": "HEALTHY",
            "feature_fusion_pipeline": "HEALTHY",
            "xai_attribution_service": "HEALTHY",
            "similarity_vector_engine": "HEALTHY",
            "multilingual_ivr_gateway": "ONLINE (MOCK_MODE)"
        }
    }

@router.get("/audit-logs")
def get_audit_logs(limit: int = 50, db: Session = Depends(get_db)):
    return db.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(limit).all()

@router.get("/users")
def get_registered_users(db: Session = Depends(get_db)):
    users = db.query(User).all()
    return [{
        "id": u.id,
        "name": u.name,
        "phone_number": u.phone_number,
        "role": u.role,
        "preferred_language": u.preferred_language,
        "district": u.district,
        "state": u.state,
        "alert_preference": u.alert_preference,
        "created_at": u.created_at
    } for u in users]
