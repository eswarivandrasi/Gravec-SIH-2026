import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

import pytest
from app.services.data_validator import DataValidator

def test_valid_csv_validation():
    valid_csv = b"""timestamp,latitude,longitude,wind_speed,pressure,sst,movement_direction,movement_speed
2026-09-26T00:00:00,15.0,85.0,120.0,980.0,30.0,NW,15.0
2026-09-26T06:00:00,15.5,84.5,135.0,974.0,30.2,NW,16.0"""

    is_valid, msg, records = DataValidator.validate_csv(valid_csv)
    assert is_valid is True
    assert len(records) == 2
    assert records[0]["wind_speed"] == 120.0

def test_invalid_csv_missing_column():
    invalid_csv = b"""timestamp,latitude,longitude,pressure,sst
2026-09-26T00:00:00,15.0,85.0,980.0,30.0"""

    is_valid, msg, records = DataValidator.validate_csv(invalid_csv)
    assert is_valid is False
    assert "Missing required column: 'wind_speed'" in msg

def test_invalid_coordinates():
    invalid_csv = b"""timestamp,latitude,longitude,wind_speed,pressure,sst,movement_direction,movement_speed
2026-09-26T00:00:00,125.0,85.0,120.0,980.0,30.0,NW,15.0"""

    is_valid, msg, records = DataValidator.validate_csv(invalid_csv)
    assert is_valid is False
    assert "Invalid latitude" in msg

def test_duplicate_timestamps():
    duplicate_csv = b"""timestamp,latitude,longitude,wind_speed,pressure,sst,movement_direction,movement_speed
2026-09-26T00:00:00,15.0,85.0,120.0,980.0,30.0,NW,15.0
2026-09-26T00:00:00,15.5,84.5,135.0,974.0,30.2,NW,16.0"""

    is_valid, msg, records = DataValidator.validate_csv(duplicate_csv)
    assert is_valid is False
    assert "Duplicate timestamp" in msg
