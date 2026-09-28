from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, JSON, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class HistoricalCyclone(Base):
    __tablename__ = "historical_cyclones"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, index=True)
    code = Column(String(50), nullable=True)
    year = Column(Integer, nullable=False, index=True)
    basin = Column(String(50), default="Bay of Bengal")
    max_wind_speed = Column(Float, nullable=False) # km/h
    min_pressure = Column(Float, nullable=False) # hPa
    category = Column(String(100), nullable=False) # IMD category
    landfall_location = Column(String(200), nullable=False)
    landfall_date = Column(String(50), nullable=True)
    context_description = Column(Text, nullable=False)
    casualties_impact = Column(Text, nullable=True)
    fingerprint_vector = Column(JSON, nullable=False) # Mean normalized fingerprint vector
    sample_track_geojson = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    cyclone_id = Column(Integer, ForeignKey("cyclones.id"), nullable=False, index=True)
    model_version = Column(String(50), default="v1.4-ResNet-FUSION-DEMO")
    cyclone_detected = Column(Boolean, default=True)
    probability = Column(Float, default=0.94) # Confidence score 0.0 to 1.0
    classification = Column(String(100), default="Severe Cyclonic Storm")
    classification_confidence = Column(Float, default=0.91)
    trend = Column(String(50), default="Intensifying") # Intensifying, Stable, Weakening
    trend_confidence = Column(Float, default=0.88)
    intensity_forecast_12h = Column(Float, default=115.0) # km/h
    intensity_forecast_24h = Column(Float, default=135.0) # km/h
    intensity_forecast_48h = Column(Float, default=160.0) # km/h
    predicted_landfall_eta = Column(String(100), nullable=True)
    predicted_landfall_location = Column(String(200), nullable=True)
    
    # Explainable AI fields
    explanation_summary = Column(Text, nullable=False)
    feature_attributions = Column(JSON, nullable=False) # SHAP / Rule breakdown: {"sst": 0.28, "pressure_drop": 0.32, ...}
    key_factors = Column(JSON, nullable=False) # List of textual bullet points
    confidence_breakdown = Column(JSON, nullable=True)
    
    is_demo = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    cyclone = relationship("Cyclone", back_populates="predictions")

class ModelVersion(Base):
    __tablename__ = "model_versions"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    model_type = Column(String(100), nullable=False) # "Pattern Identifier", "Category Classifier", "Trend Predictor"
    version = Column(String(50), nullable=False)
    accuracy = Column(Float, default=0.924)
    f1_score = Column(Float, default=0.918)
    precision = Column(Float, default=0.932)
    recall = Column(Float, default=0.905)
    training_dataset_size = Column(Integer, default=14500)
    parameters_count = Column(String(50), default="24.8M")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
