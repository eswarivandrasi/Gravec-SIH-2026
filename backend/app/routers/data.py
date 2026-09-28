import os
import shutil
import uuid
from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
from typing import Optional

from app.database import get_db
from app.config import settings
from app.models.cyclone import Cyclone, Observation, SatelliteImage
from app.models.audit import AuditLog
from app.services.data_validator import DataValidator, ALLOWED_IMAGE_EXTENSIONS
from app.services.ml_engine import CycloneMLEngine

router = APIRouter(prefix="/api/data", tags=["Data Ingestion & Uploads"])

@router.post("/upload")
async def upload_cyclone_data(
    file: UploadFile = File(...),
    cyclone_id: Optional[int] = Form(None),
    cyclone_name: Optional[str] = Form(None),
    basin: Optional[str] = Form("Bay of Bengal"),
    satellite_type: Optional[str] = Form("INSAT-3DR Multi-spectral"),
    channel: Optional[str] = Form("Infrared (TIR1)"),
    db: Session = Depends(get_db)
):
    """
    Multi-source ingestion pipeline:
    - Ingests CSV environmental time-series data with strict validation
    - Ingests JPG / PNG satellite images with metadata tagging
    """
    filename = file.filename or "uploaded_file"
    ext = os.path.splitext(filename)[1].lower()

    # Determine or create target cyclone
    target_cyclone = None
    if cyclone_id:
        target_cyclone = db.query(Cyclone).filter(Cyclone.id == cyclone_id).first()
    elif cyclone_name:
        target_cyclone = db.query(Cyclone).filter(Cyclone.name == cyclone_name).first()
        if not target_cyclone:
            target_cyclone = Cyclone(
                name=cyclone_name,
                code=f"BOB-UPL-{uuid.uuid4().hex[:4].upper()}",
                basin=basin or "Bay of Bengal",
                status="Under Observation",
                classification="Depression",
                category=0,
                max_wind_speed=55.0,
                min_pressure=1004.0,
                current_latitude=14.5,
                current_longitude=86.0,
                movement_direction="NW",
                movement_speed=15.0,
                is_demo=True
            )
            db.add(target_cyclone)
            db.commit()
            db.refresh(target_cyclone)
    else:
        # Fallback to first cyclone or create a new upload cyclone
        target_cyclone = db.query(Cyclone).first()
        if not target_cyclone:
            target_cyclone = Cyclone(
                name="System-Observation-Upload",
                code="BOB-99-2026",
                basin="Bay of Bengal",
                status="Under Observation",
                current_latitude=15.0,
                current_longitude=85.0,
                max_wind_speed=60.0,
                min_pressure=1000.0,
                is_demo=True
            )
            db.add(target_cyclone)
            db.commit()
            db.refresh(target_cyclone)

    # 1. Process CSV File
    if ext == ".csv":
        content = await file.read()
        is_valid, msg, records = DataValidator.validate_csv(content)
        if not is_valid:
            raise HTTPException(status_code=400, detail=msg)

        # Ingest records
        added_count = 0
        for rec in records:
            obs = Observation(
                cyclone_id=target_cyclone.id,
                timestamp=datetime.fromisoformat(rec["timestamp"]),
                latitude=rec["latitude"],
                longitude=rec["longitude"],
                wind_speed=rec["wind_speed"],
                pressure=rec["pressure"],
                sst=rec["sst"],
                movement_direction=rec["movement_direction"],
                movement_speed=rec["movement_speed"],
                cloud_organization=rec["cloud_organization"],
                spiral_structure=rec["spiral_structure"],
                intensity_trend=rec["intensity_trend"],
                data_source="CSV Telemetry Ingestion (Validated)"
            )
            db.add(obs)
            added_count += 1

        # Update latest cyclone position and intensity from latest row
        latest = records[-1]
        target_cyclone.current_latitude = latest["latitude"]
        target_cyclone.current_longitude = latest["longitude"]
        target_cyclone.max_wind_speed = latest["wind_speed"]
        target_cyclone.min_pressure = latest["pressure"]
        target_cyclone.movement_direction = latest["movement_direction"]
        target_cyclone.movement_speed = latest["movement_speed"]
        target_cyclone.last_updated = datetime.utcnow()

        db.add(AuditLog(
            username="data_ingestion",
            action="CSV_OBSERVATIONS_INGESTED",
            target_type="Cyclone",
            target_id=str(target_cyclone.id),
            details={"filename": filename, "records_count": added_count}
        ))
        db.commit()

        return {
            "status": "success",
            "message": f"Successfully validated and ingested {added_count} environmental observations.",
            "cyclone_id": target_cyclone.id,
            "cyclone_name": target_cyclone.name,
            "records_count": added_count,
            "is_demo": True
        }

    # 2. Process Satellite Image
    elif ext in ALLOWED_IMAGE_EXTENSIONS:
        unique_name = f"sat_{uuid.uuid4().hex[:8]}_{filename}"
        save_path = os.path.join(settings.UPLOAD_DIR, "satellites", unique_name)
        
        with open(save_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        image_url = f"/uploads/satellites/{unique_name}"

        # Create SatelliteImage record
        sat_image = SatelliteImage(
            cyclone_id=target_cyclone.id,
            filename=unique_name,
            image_url=image_url,
            satellite_type=satellite_type or "INSAT-3DR / Multi-spectral",
            channel=channel or "Infrared (TIR1)",
            resolution="4.0 km Multi-channel",
            spiral_intensity=0.85,
            eye_detected=True if target_cyclone.max_wind_speed > 120 else False,
            is_demo=True
        )
        db.add(sat_image)
        db.add(AuditLog(
            username="data_ingestion",
            action="SATELLITE_IMAGE_UPLOADED",
            target_type="SatelliteImage",
            target_id=unique_name,
            details={"cyclone_id": target_cyclone.id, "filename": filename}
        ))
        db.commit()
        db.refresh(sat_image)

        return {
            "status": "success",
            "message": "Satellite imagery successfully uploaded and registered in multi-source fusion database.",
            "cyclone_id": target_cyclone.id,
            "image_id": sat_image.id,
            "image_url": image_url,
            "is_demo": True
        }

    else:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format '{ext}'. Only CSV, JPG, JPEG, and PNG files are supported."
        )
