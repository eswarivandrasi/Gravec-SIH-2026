from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta

from app.database import get_db
from app.models.cyclone import Cyclone, Observation, SatelliteImage, CycloneFingerprint
from app.models.prediction import Prediction
from app.models.audit import AuditLog
from app.schemas.cyclone import CycloneResponse, CycloneCreate, CycloneListResponse, CycloneFingerprintResponse
from app.schemas.prediction import PredictionResponse, SimilarPatternsResponse, TrendAnalysisResponse
from app.services.ml_engine import CycloneMLEngine
from app.services.similarity_engine import HistoricalSimilarityEngine

router = APIRouter(prefix="/api/cyclones", tags=["Cyclones & AI Analytics"])

@router.get("", response_model=List[CycloneListResponse])
def get_all_cyclones(db: Session = Depends(get_db)):
    cyclones = db.query(Cyclone).all()
    results = []
    for c in cyclones:
        obs_count = db.query(Observation).filter(Observation.cyclone_id == c.id).count()
        results.append(CycloneListResponse(
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
    return results

@router.get("/{cyclone_id}", response_model=CycloneResponse)
def get_cyclone_details(cyclone_id: int, db: Session = Depends(get_db)):
    cyclone = db.query(Cyclone).filter(Cyclone.id == cyclone_id).first()
    if not cyclone:
        raise HTTPException(status_code=404, detail="Cyclone system not found")
    return cyclone

@router.post("", response_model=CycloneResponse)
def create_cyclone(data: CycloneCreate, db: Session = Depends(get_db)):
    cyclone = Cyclone(
        name=data.name,
        code=data.code or f"BOB-{datetime.utcnow().strftime('%Y%m%d%H%M')}",
        basin=data.basin,
        status=data.status,
        classification=data.classification,
        category=data.category,
        max_wind_speed=data.max_wind_speed,
        min_pressure=data.min_pressure,
        current_latitude=data.current_latitude,
        current_longitude=data.current_longitude,
        movement_direction=data.movement_direction,
        movement_speed=data.movement_speed,
        is_demo=data.is_demo
    )
    db.add(cyclone)
    db.commit()
    db.refresh(cyclone)

    # Initial Observation
    obs = Observation(
        cyclone_id=cyclone.id,
        timestamp=datetime.utcnow(),
        latitude=data.current_latitude,
        longitude=data.current_longitude,
        wind_speed=data.max_wind_speed,
        pressure=data.min_pressure,
        sst=29.5,
        movement_direction=data.movement_direction,
        movement_speed=data.movement_speed,
        cloud_organization=0.75,
        spiral_structure=0.80,
        intensity_trend="Intensifying"
    )
    db.add(obs)
    db.commit()

    return cyclone

@router.post("/{cyclone_id}/analyze", response_model=PredictionResponse)
def run_ai_analysis(cyclone_id: int, db: Session = Depends(get_db)):
    """
    Executes full multi-source AI/ML pipeline:
    1. Identification (Satellite cloud symmetry + pressure anomaly)
    2. IMD Standard Classification
    3. Temporal Trend Prediction
    4. XAI Feature Attribution & Explanation
    5. Cyclone Fingerprint Generation
    """
    cyclone = db.query(Cyclone).filter(Cyclone.id == cyclone_id).first()
    if not cyclone:
        raise HTTPException(status_code=404, detail="Cyclone system not found")

    observations = db.query(Observation).filter(Observation.cyclone_id == cyclone_id).order_by(Observation.timestamp.asc()).all()
    if not observations:
        # Create a default observation if none
        obs = Observation(
            cyclone_id=cyclone.id,
            timestamp=datetime.utcnow(),
            latitude=cyclone.current_latitude,
            longitude=cyclone.current_longitude,
            wind_speed=cyclone.max_wind_speed,
            pressure=cyclone.min_pressure,
            sst=30.2,
            movement_direction=cyclone.movement_direction,
            movement_speed=cyclone.movement_speed,
            cloud_organization=0.85,
            spiral_structure=0.88,
            intensity_trend="Intensifying"
        )
        db.add(obs)
        db.commit()
        observations = [obs]

    latest_obs = observations[-1]

    # 1. Identification
    ident_res = CycloneMLEngine.identify_cyclone(observations)
    
    # 2. Classification
    classification_name, category_num, class_confidence = CycloneMLEngine.classify_cyclone(
        latest_obs.wind_speed, latest_obs.pressure
    )

    # 3. Trend Prediction
    trend_res = CycloneMLEngine.predict_trend(observations)

    # 4. Explainability
    xai_res = CycloneMLEngine.generate_xai_explanation(
        cyclone=cyclone,
        latest_obs=latest_obs,
        trend_data=trend_res,
        classification=classification_name
    )

    # Update Cyclone current state
    cyclone.classification = classification_name
    cyclone.category = category_num
    cyclone.status = trend_res["trend"]
    cyclone.max_wind_speed = latest_obs.wind_speed
    cyclone.min_pressure = latest_obs.pressure
    cyclone.last_updated = datetime.utcnow()

    # 5. Generate / Update Cyclone Fingerprint
    fp_data = CycloneMLEngine.generate_fingerprint_vector(latest_obs)
    existing_fp = db.query(CycloneFingerprint).filter(CycloneFingerprint.cyclone_id == cyclone.id).first()
    if existing_fp:
        existing_fp.latitude = fp_data["latitude"]
        existing_fp.longitude = fp_data["longitude"]
        existing_fp.wind_speed = fp_data["wind_speed"]
        existing_fp.pressure = fp_data["pressure"]
        existing_fp.sst = fp_data["sst"]
        existing_fp.movement_direction = fp_data["movement_direction"]
        existing_fp.movement_speed = fp_data["movement_speed"]
        existing_fp.cloud_organization = fp_data["cloud_organization"]
        existing_fp.spiral_structure = fp_data["spiral_structure"]
        existing_fp.intensity_trend = fp_data["intensity_trend"]
        existing_fp.vector_json = fp_data["vector_json"]
        existing_fp.generated_at = datetime.utcnow()
    else:
        new_fp = CycloneFingerprint(
            cyclone_id=cyclone.id,
            observation_id=latest_obs.id,
            latitude=fp_data["latitude"],
            longitude=fp_data["longitude"],
            wind_speed=fp_data["wind_speed"],
            pressure=fp_data["pressure"],
            sst=fp_data["sst"],
            movement_direction=fp_data["movement_direction"],
            movement_speed=fp_data["movement_speed"],
            cloud_organization=fp_data["cloud_organization"],
            spiral_structure=fp_data["spiral_structure"],
            intensity_trend=fp_data["intensity_trend"],
            vector_json=fp_data["vector_json"]
        )
        db.add(new_fp)

    # Save Prediction Record
    prediction = Prediction(
        cyclone_id=cyclone.id,
        model_version=ident_res["model_version"],
        cyclone_detected=ident_res["cyclone_detected"],
        probability=ident_res["probability"],
        classification=classification_name,
        classification_confidence=class_confidence,
        trend=trend_res["trend"],
        trend_confidence=trend_res["trend_confidence"],
        intensity_forecast_12h=trend_res["intensity_forecast_12h"],
        intensity_forecast_24h=trend_res["intensity_forecast_24h"],
        intensity_forecast_48h=trend_res["intensity_forecast_48h"],
        predicted_landfall_eta="Within 24 to 36 Hours",
        predicted_landfall_location=f"Coasts of Andhra Pradesh & South Odisha (Vicinity: {cyclone.movement_direction} Corridor)",
        explanation_summary=xai_res["explanation_summary"],
        feature_attributions=xai_res["feature_attributions"],
        key_factors=xai_res["key_factors"],
        confidence_breakdown=xai_res["confidence_breakdown"],
        is_demo=True
    )
    db.add(prediction)

    # Audit Log
    db.add(AuditLog(
        username="analyst",
        action="AI_ANALYSIS_EXECUTED",
        target_type="Cyclone",
        target_id=str(cyclone.id),
        details={"classification": classification_name, "trend": trend_res["trend"], "probability": ident_res["probability"]}
    ))

    db.commit()
    db.refresh(prediction)

    return prediction

@router.post("/{cyclone_id}/fingerprint", response_model=CycloneFingerprintResponse)
@router.get("/{cyclone_id}/fingerprint", response_model=CycloneFingerprintResponse)
def get_or_create_fingerprint(cyclone_id: int, db: Session = Depends(get_db)):
    cyclone = db.query(Cyclone).filter(Cyclone.id == cyclone_id).first()
    if not cyclone:
        raise HTTPException(status_code=404, detail="Cyclone not found")

    fp = db.query(CycloneFingerprint).filter(CycloneFingerprint.cyclone_id == cyclone_id).order_by(CycloneFingerprint.generated_at.desc()).first()
    if fp:
        return fp

    # Generate if not exists
    latest_obs = db.query(Observation).filter(Observation.cyclone_id == cyclone_id).order_by(Observation.timestamp.desc()).first()
    if not latest_obs:
        latest_obs = Observation(
            cyclone_id=cyclone.id,
            timestamp=datetime.utcnow(),
            latitude=cyclone.current_latitude,
            longitude=cyclone.current_longitude,
            wind_speed=cyclone.max_wind_speed,
            pressure=cyclone.min_pressure,
            sst=30.0,
            movement_direction=cyclone.movement_direction,
            movement_speed=cyclone.movement_speed,
            cloud_organization=0.8,
            spiral_structure=0.85,
            intensity_trend="Intensifying"
        )
        db.add(latest_obs)
        db.commit()

    fp_data = CycloneMLEngine.generate_fingerprint_vector(latest_obs)
    new_fp = CycloneFingerprint(
        cyclone_id=cyclone.id,
        observation_id=latest_obs.id,
        latitude=fp_data["latitude"],
        longitude=fp_data["longitude"],
        wind_speed=fp_data["wind_speed"],
        pressure=fp_data["pressure"],
        sst=fp_data["sst"],
        movement_direction=fp_data["movement_direction"],
        movement_speed=fp_data["movement_speed"],
        cloud_organization=fp_data["cloud_organization"],
        spiral_structure=fp_data["spiral_structure"],
        intensity_trend=fp_data["intensity_trend"],
        vector_json=fp_data["vector_json"]
    )
    db.add(new_fp)
    db.commit()
    db.refresh(new_fp)
    return new_fp

@router.get("/{cyclone_id}/similar-patterns", response_model=SimilarPatternsResponse)
def get_similar_historical_patterns(cyclone_id: int, db: Session = Depends(get_db)):
    cyclone = db.query(Cyclone).filter(Cyclone.id == cyclone_id).first()
    if not cyclone:
        raise HTTPException(status_code=404, detail="Cyclone not found")

    # Get fingerprint vector
    fp = db.query(CycloneFingerprint).filter(CycloneFingerprint.cyclone_id == cyclone_id).order_by(CycloneFingerprint.generated_at.desc()).first()
    if not fp:
        latest_obs = db.query(Observation).filter(Observation.cyclone_id == cyclone_id).order_by(Observation.timestamp.desc()).first()
        fp_data = CycloneMLEngine.generate_fingerprint_vector(latest_obs) if latest_obs else {
            "latitude": cyclone.current_latitude,
            "longitude": cyclone.current_longitude,
            "wind_speed": cyclone.max_wind_speed,
            "pressure": cyclone.min_pressure,
            "sst": 30.2,
            "movement_direction": cyclone.movement_direction,
            "movement_speed": cyclone.movement_speed,
            "cloud_organization": 0.8,
            "spiral_structure": 0.85,
            "intensity_trend": "Intensifying",
            "vector_json": [0.6, 0.65, 0.7, 0.8, 0.85, 0.4, 0.8, 0.85]
        }
        target_vector = fp_data["vector_json"]
        target_dict = fp_data
    else:
        target_vector = fp.vector_json
        target_dict = {
            "latitude": fp.latitude,
            "longitude": fp.longitude,
            "wind_speed": fp.wind_speed,
            "pressure": fp.pressure,
            "sst": fp.sst,
            "movement_direction": fp.movement_direction,
            "movement_speed": fp.movement_speed,
            "cloud_organization": fp.cloud_organization,
            "spiral_structure": fp.spiral_structure,
            "intensity_trend": fp.intensity_trend,
            "vector_json": fp.vector_json
        }

    similar_items = HistoricalSimilarityEngine.find_top_similar_cyclones(db, target_vector, top_k=5)

    return SimilarPatternsResponse(
        cyclone_id=cyclone.id,
        cyclone_name=cyclone.name,
        target_fingerprint=target_dict,
        similar_patterns=similar_items,
        disclaimer=HistoricalSimilarityEngine.DISCLAIMER
    )

@router.get("/{cyclone_id}/trend", response_model=TrendAnalysisResponse)
def get_cyclone_trend_analysis(cyclone_id: int, db: Session = Depends(get_db)):
    cyclone = db.query(Cyclone).filter(Cyclone.id == cyclone_id).first()
    if not cyclone:
        raise HTTPException(status_code=404, detail="Cyclone not found")

    observations = db.query(Observation).filter(Observation.cyclone_id == cyclone_id).order_by(Observation.timestamp.asc()).all()
    trend_res = CycloneMLEngine.predict_trend(observations)

    series = []
    for obs in observations:
        series.append({
            "timestamp": obs.timestamp.strftime("%d %b %H:%M"),
            "wind_speed": obs.wind_speed,
            "pressure": obs.pressure,
            "sst": obs.sst,
            "cloud_organization": obs.cloud_organization,
            "spiral_structure": obs.spiral_structure
        })

    last_time = observations[-1].timestamp if observations else datetime.utcnow()
    projected = [
        {
            "timeline": "+12 Hours",
            "timestamp": (last_time + timedelta(hours=12)).strftime("%d %b %H:%M"),
            "wind_speed": trend_res["intensity_forecast_12h"],
            "type": "PROJECTED_FORECAST"
        },
        {
            "timeline": "+24 Hours",
            "timestamp": (last_time + timedelta(hours=24)).strftime("%d %b %H:%M"),
            "wind_speed": trend_res["intensity_forecast_24h"],
            "type": "PROJECTED_FORECAST"
        },
        {
            "timeline": "+48 Hours",
            "timestamp": (last_time + timedelta(hours=48)).strftime("%d %b %H:%M"),
            "wind_speed": trend_res["intensity_forecast_48h"],
            "type": "PROJECTED_FORECAST"
        }
    ]

    return TrendAnalysisResponse(
        cyclone_id=cyclone.id,
        cyclone_name=cyclone.name,
        current_trend=trend_res["trend"],
        trend_confidence=trend_res["trend_confidence"],
        historical_observations_count=len(observations),
        wind_speed_trend_delta=trend_res.get("wind_delta", 5.0),
        pressure_trend_delta=trend_res.get("pressure_delta", -3.0),
        temporal_series=series,
        projected_forecast_series=projected,
        explanation=f"Short-term sequential trend model indicates {trend_res['trend']} behavior with {trend_res['trend_confidence']*100:.1f}% confidence based on rate of pressure decrease and high sea surface temperatures."
    )
