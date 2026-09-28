import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

import pytest
from datetime import datetime
from app.models.cyclone import Cyclone, Observation
from app.services.ml_engine import CycloneMLEngine
from app.services.similarity_engine import HistoricalSimilarityEngine

def test_imd_classification_thresholds():
    # Depression: < 62 km/h
    cls_name, cat, conf = CycloneMLEngine.classify_cyclone(55.0, 1004.0)
    assert "Depression" in cls_name
    assert cat == 0

    # Cyclonic Storm: 62 - 88 km/h
    cls_name, cat, conf = CycloneMLEngine.classify_cyclone(75.0, 995.0)
    assert cls_name == "Cyclonic Storm (CS)"
    assert cat == 1

    # Severe Cyclonic Storm: 89 - 117 km/h
    cls_name, cat, conf = CycloneMLEngine.classify_cyclone(105.0, 985.0)
    assert cls_name == "Severe Cyclonic Storm (SCS)"
    assert cat == 2

    # Very Severe Cyclonic Storm: 118 - 166 km/h
    cls_name, cat, conf = CycloneMLEngine.classify_cyclone(145.0, 968.0)
    assert cls_name == "Very Severe Cyclonic Storm (VSCS)"
    assert cat == 3

    # Extremely Severe Cyclonic Storm: 167 - 221 km/h
    cls_name, cat, conf = CycloneMLEngine.classify_cyclone(195.0, 935.0)
    assert cls_name == "Extremely Severe Cyclonic Storm (ESCS)"
    assert cat == 4

    # Super Cyclone: >= 222 km/h
    cls_name, cat, conf = CycloneMLEngine.classify_cyclone(250.0, 910.0)
    assert cls_name == "Super Cyclonic Storm (SuCS)"
    assert cat == 5

def test_fingerprint_generation():
    obs = Observation(
        id=1,
        cyclone_id=1,
        timestamp=datetime.utcnow(),
        latitude=15.8,
        longitude=84.2,
        wind_speed=145.0,
        pressure=968.0,
        sst=30.5,
        movement_direction="NNW",
        movement_speed=16.0,
        cloud_organization=0.88,
        spiral_structure=0.92,
        intensity_trend="Intensifying"
    )
    fp = CycloneMLEngine.generate_fingerprint_vector(obs)
    assert "vector_json" in fp
    assert len(fp["vector_json"]) == 8
    # All values in normalized range [0.0, 1.0]
    for v in fp["vector_json"]:
        assert 0.0 <= v <= 1.0

def test_trend_prediction():
    obs_seq = [
        Observation(id=1, cyclone_id=1, timestamp=datetime.utcnow(), latitude=14.0, longitude=85.0, wind_speed=100.0, pressure=985.0, sst=30.2, movement_direction="NNW", movement_speed=15.0),
        Observation(id=2, cyclone_id=1, timestamp=datetime.utcnow(), latitude=14.5, longitude=84.5, wind_speed=120.0, pressure=978.0, sst=30.4, movement_direction="NNW", movement_speed=15.5),
        Observation(id=3, cyclone_id=1, timestamp=datetime.utcnow(), latitude=15.0, longitude=84.0, wind_speed=140.0, pressure=970.0, sst=30.5, movement_direction="NNW", movement_speed=16.0),
    ]
    trend_res = CycloneMLEngine.predict_trend(obs_seq)
    assert trend_res["trend"] == "Intensifying"
    assert trend_res["intensity_forecast_24h"] > 140.0
    assert trend_res["intensity_forecast_48h"] > trend_res["intensity_forecast_24h"]

def test_cosine_similarity_calculation():
    vec_a = [0.5, 0.6, 0.7, 0.8, 0.9, 0.4, 0.8, 0.85]
    vec_b = [0.5, 0.6, 0.7, 0.8, 0.9, 0.4, 0.8, 0.85] # Identical
    sim = HistoricalSimilarityEngine.calculate_cosine_similarity(vec_a, vec_b)
    assert sim >= 0.99
