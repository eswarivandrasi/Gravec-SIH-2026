from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class HistoricalSimilarityItem(BaseModel):
    id: int
    name: str
    year: int
    basin: str
    category: str
    max_wind_speed: float
    min_pressure: float
    similarity_score: float # 0.0 to 1.0 (or percentage)
    landfall_location: str
    landfall_date: Optional[str] = None
    context_description: str
    casualties_impact: Optional[str] = None
    similarity_factors: Dict[str, float] = {}

class SimilarPatternsResponse(BaseModel):
    cyclone_id: int
    cyclone_name: str
    target_fingerprint: Dict[str, Any]
    similar_patterns: List[HistoricalSimilarityItem]
    disclaimer: str = "Historical similarity does not guarantee future behavior. Always adhere to official IMD/NDRF emergency directives."

class PredictionResponse(BaseModel):
    id: int
    cyclone_id: int
    model_version: str
    cyclone_detected: bool
    probability: float
    classification: str
    classification_confidence: float
    trend: str # Intensifying, Stable, Weakening
    trend_confidence: float
    intensity_forecast_12h: float
    intensity_forecast_24h: float
    intensity_forecast_48h: float
    predicted_landfall_eta: Optional[str] = None
    predicted_landfall_location: Optional[str] = None
    explanation_summary: str
    feature_attributions: Dict[str, float]
    key_factors: List[str]
    confidence_breakdown: Optional[Dict[str, Any]] = None
    is_demo: bool = True
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class TrendAnalysisResponse(BaseModel):
    cyclone_id: int
    cyclone_name: str
    current_trend: str
    trend_confidence: float
    historical_observations_count: int
    wind_speed_trend_delta: float
    pressure_trend_delta: float
    temporal_series: List[Dict[str, Any]]
    projected_forecast_series: List[Dict[str, Any]]
    explanation: str
