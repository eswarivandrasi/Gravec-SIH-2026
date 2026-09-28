from pydantic import BaseModel, Field
from typing import Optional, List, Any
from datetime import datetime

class ObservationBase(BaseModel):
    timestamp: datetime
    latitude: float
    longitude: float
    wind_speed: float
    pressure: float
    sst: float
    movement_direction: str = "NW"
    movement_speed: float = 15.0
    cloud_organization: Optional[float] = 0.75
    spiral_structure: Optional[float] = 0.8
    intensity_trend: Optional[str] = "Intensifying"
    data_source: Optional[str] = "INSAT-3D / Multi-source Fusion (DEMO)"

class ObservationCreate(ObservationBase):
    cyclone_id: Optional[int] = None

class ObservationResponse(ObservationBase):
    id: int
    cyclone_id: int

    class Config:
        from_attributes = True

class SatelliteImageResponse(BaseModel):
    id: int
    cyclone_id: int
    observation_id: Optional[int] = None
    filename: str
    image_url: str
    satellite_type: str
    channel: str
    resolution: str
    timestamp: Optional[datetime] = None
    spiral_intensity: float
    eye_detected: bool
    is_demo: bool

    class Config:
        from_attributes = True

class CycloneFingerprintResponse(BaseModel):
    id: int
    cyclone_id: int
    latitude: float
    longitude: float
    wind_speed: float
    pressure: float
    sst: float
    movement_direction: str
    movement_speed: float
    cloud_organization: float
    spiral_structure: float
    intensity_trend: str
    vector_json: List[float]
    generated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class CycloneBase(BaseModel):
    name: str
    code: Optional[str] = None
    basin: str = "Bay of Bengal"
    status: str = "Active"
    classification: str = "Cyclonic Storm"
    category: int = 1
    max_wind_speed: float
    min_pressure: float
    current_latitude: float
    current_longitude: float
    movement_direction: str = "NW"
    movement_speed: float = 15.0
    is_demo: bool = True

class CycloneCreate(CycloneBase):
    pass

class CycloneResponse(CycloneBase):
    id: int
    start_date: Optional[datetime] = None
    last_updated: Optional[datetime] = None
    observations: List[ObservationResponse] = []
    satellite_images: List[SatelliteImageResponse] = []

    class Config:
        from_attributes = True

class CycloneListResponse(CycloneBase):
    id: int
    start_date: Optional[datetime] = None
    last_updated: Optional[datetime] = None
    observation_count: int = 0

    class Config:
        from_attributes = True
