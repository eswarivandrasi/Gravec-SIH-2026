from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime

from app.database import get_db
from app.models.cyclone import Cyclone, Observation
from app.models.alert import Alert, IVRCall
from app.models.user import User
from app.models.prediction import Prediction
from app.schemas.dashboard import DashboardSummaryResponse
from app.schemas.cyclone import CycloneListResponse
from app.schemas.alert import AlertResponse

router = APIRouter(prefix="/api/dashboard", tags=["Disaster Management Dashboard"])

@router.get("/summary", response_model=DashboardSummaryResponse)
def get_dashboard_summary(db: Session = Depends(get_db)):
    cyclones = db.query(Cyclone).all()
    active_count = len(cyclones)
    intensifying_count = sum(1 for c in cyclones if c.status.lower() in ["intensifying", "active"])
    observation_count = sum(1 for c in cyclones if "observation" in c.status.lower())
    
    total_alerts = db.query(Alert).count()
    total_citizens = db.query(User).count()
    total_ivr = db.query(IVRCall).count()

    primary = cyclones[0] if cyclones else None
    primary_dict = None
    if primary:
        primary_pred = db.query(Prediction).filter(Prediction.cyclone_id == primary.id).order_by(Prediction.created_at.desc()).first()
        primary_dict = {
            "id": primary.id,
            "name": primary.name,
            "code": primary.code,
            "basin": primary.basin,
            "classification": primary.classification,
            "category": primary.category,
            "max_wind_speed": primary.max_wind_speed,
            "min_pressure": primary.min_pressure,
            "current_latitude": primary.current_latitude,
            "current_longitude": primary.current_longitude,
            "movement_direction": primary.movement_direction,
            "movement_speed": primary.movement_speed,
            "status": primary.status,
            "probability": primary_pred.probability if primary_pred else 0.94,
            "trend": primary_pred.trend if primary_pred else "Intensifying",
            "prediction": {
                "probability": primary_pred.probability,
                "classification": primary_pred.classification,
                "trend": primary_pred.trend,
                "explanation_summary": primary_pred.explanation_summary,
                "key_factors": primary_pred.key_factors,
                "feature_attributions": primary_pred.feature_attributions,
                "intensity_forecast_24h": primary_pred.intensity_forecast_24h
            } if primary_pred else None
        }

    active_list = []
    for c in cyclones:
        obs_count = db.query(Observation).filter(Observation.cyclone_id == c.id).count()
        active_list.append(CycloneListResponse(
            id=c.id,
            name=c.name,
            code=c.code,
            basin=c.basin,
            status=c.status,
            classification=c.classification,
            category=c.category,
            max_wind_speed=c.max_wind_speed,
            min_pressure=c.min_pressure,
            current_latitude=c.current_latitude,
            current_longitude=c.current_longitude,
            movement_direction=c.movement_direction,
            movement_speed=c.movement_speed,
            is_demo=c.is_demo,
            start_date=c.start_date,
            last_updated=c.last_updated,
            observation_count=obs_count
        ))

    recent_alerts = db.query(Alert).order_by(Alert.created_at.desc()).limit(5).all()

    return DashboardSummaryResponse(
        active_systems_count=active_count,
        intensifying_systems_count=intensifying_count,
        systems_under_observation_count=observation_count,
        total_alerts_issued=total_alerts,
        total_citizens_registered=total_citizens,
        total_ivr_calls_dispatched=total_ivr,
        system_status="CRITICAL_HIGH_RISK" if intensifying_count > 0 else "OPERATIONAL",
        primary_cyclone=primary_dict,
        active_cyclones=active_list,
        recent_alerts=recent_alerts,
        weather_stations_online=48,
        doppler_radars_active=19,
        is_demo=True
    )
