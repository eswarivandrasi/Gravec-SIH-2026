from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from app.schemas.cyclone import CycloneListResponse
from app.schemas.alert import AlertResponse

class DashboardSummaryResponse(BaseModel):
    active_systems_count: int
    intensifying_systems_count: int
    systems_under_observation_count: int
    total_alerts_issued: int
    total_citizens_registered: int
    total_ivr_calls_dispatched: int
    system_status: str # "OPERATIONAL", "ELEVATED_RISK", "CRITICAL"
    primary_cyclone: Optional[Dict[str, Any]] = None
    active_cyclones: List[CycloneListResponse] = []
    recent_alerts: List[AlertResponse] = []
    weather_stations_online: int = 42
    doppler_radars_active: int = 18
    is_demo: bool = True
