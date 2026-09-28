from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class Cyclone(Base):
    __tablename__ = "cyclones"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, index=True)
    code = Column(String(50), unique=True, index=True) # e.g. BOB-01-2026
    basin = Column(String(50), default="Bay of Bengal") # Bay of Bengal, Arabian Sea, North Indian Ocean
    status = Column(String(50), default="Active") # Active, Intensifying, Weakened, Landfall, Under Observation
    classification = Column(String(100), default="Cyclonic Storm") # Depression, Deep Depression, Cyclonic Storm, Severe Cyclonic Storm, Very Severe Cyclonic Storm, Extremely Severe Cyclonic Storm, Super Cyclone
    category = Column(Integer, default=1) # 1 to 5
    max_wind_speed = Column(Float, default=0.0) # km/h or knots
    min_pressure = Column(Float, default=1010.0) # hPa
    current_latitude = Column(Float, nullable=False)
    current_longitude = Column(Float, nullable=False)
    movement_direction = Column(String(50), default="NNW") # N, NE, E, SE, S, SW, W, NW, NNW, WNW
    movement_speed = Column(Float, default=12.0) # km/h
    is_demo = Column(Boolean, default=True)
    start_date = Column(DateTime(timezone=True), server_default=func.now())
    last_updated = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    observations = relationship("Observation", back_populates="cyclone", cascade="all, delete-orphan")
    satellite_images = relationship("SatelliteImage", back_populates="cyclone", cascade="all, delete-orphan")
    fingerprints = relationship("CycloneFingerprint", back_populates="cyclone", cascade="all, delete-orphan")
    predictions = relationship("Prediction", back_populates="cyclone", cascade="all, delete-orphan")
    alerts = relationship("Alert", back_populates="cyclone", cascade="all, delete-orphan")

class Observation(Base):
    __tablename__ = "observations"

    id = Column(Integer, primary_key=True, index=True)
    cyclone_id = Column(Integer, ForeignKey("cyclones.id"), nullable=False, index=True)
    timestamp = Column(DateTime(timezone=True), nullable=False, index=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    wind_speed = Column(Float, nullable=False) # km/h
    pressure = Column(Float, nullable=False) # hPa
    sst = Column(Float, nullable=False) # Sea Surface Temp in °C
    movement_direction = Column(String(50), default="NW")
    movement_speed = Column(Float, default=15.0) # km/h
    cloud_organization = Column(Float, default=0.75) # 0.0 to 1.0
    spiral_structure = Column(Float, default=0.8) # 0.0 to 1.0
    intensity_trend = Column(String(50), default="Intensifying") # Intensifying, Stable, Weakening
    data_source = Column(String(100), default="INSAT-3D / NOAA AVHRR Fusion (DEMO)")
    raw_metadata = Column(JSON, nullable=True)

    cyclone = relationship("Cyclone", back_populates="observations")

class SatelliteImage(Base):
    __tablename__ = "satellite_images"

    id = Column(Integer, primary_key=True, index=True)
    cyclone_id = Column(Integer, ForeignKey("cyclones.id"), nullable=False, index=True)
    observation_id = Column(Integer, ForeignKey("observations.id"), nullable=True)
    filename = Column(String(255), nullable=False)
    image_url = Column(String(500), nullable=False)
    satellite_type = Column(String(100), default="INSAT-3DR / Multi-spectral") # INSAT-3D, INSAT-3DR, Oceansat-3, Sentinel-1 SAR
    channel = Column(String(50), default="Infrared (TIR1)") # Infrared, Visible, Water Vapor, Microwave
    resolution = Column(String(50), default="4km")
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    spiral_intensity = Column(Float, default=0.82)
    eye_detected = Column(Boolean, default=False)
    is_demo = Column(Boolean, default=True)

    cyclone = relationship("Cyclone", back_populates="satellite_images")

class CycloneFingerprint(Base):
    __tablename__ = "cyclone_fingerprints"

    id = Column(Integer, primary_key=True, index=True)
    cyclone_id = Column(Integer, ForeignKey("cyclones.id"), nullable=False, index=True)
    observation_id = Column(Integer, ForeignKey("observations.id"), nullable=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    wind_speed = Column(Float, nullable=False)
    pressure = Column(Float, nullable=False)
    sst = Column(Float, nullable=False)
    movement_direction = Column(String(50), nullable=False)
    movement_speed = Column(Float, nullable=False)
    cloud_organization = Column(Float, nullable=False)
    spiral_structure = Column(Float, nullable=False)
    intensity_trend = Column(String(50), nullable=False)
    vector_json = Column(JSON, nullable=False) # Normalized 10-D feature vector
    generated_at = Column(DateTime(timezone=True), server_default=func.now())

    cyclone = relationship("Cyclone", back_populates="fingerprints")
