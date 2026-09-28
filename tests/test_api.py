import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["demo_mode"] is True

def test_get_cyclones():
    response = client.get("/api/cyclones")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert any("VAYU" in c["name"] for c in data)

def test_get_dashboard_summary():
    response = client.get("/api/dashboard/summary")
    assert response.status_code == 200
    data = response.json()
    assert "active_systems_count" in data
    assert data["active_systems_count"] >= 1
    assert data["is_demo"] is True

def test_ai_analysis():
    # Fetch first cyclone
    cycs = client.get("/api/cyclones").json()
    first_id = cycs[0]["id"]
    
    response = client.post(f"/api/cyclones/{first_id}/analyze")
    assert response.status_code == 200
    data = response.json()
    assert "cyclone_detected" in data
    assert "classification" in data
    assert "trend" in data
    assert "feature_attributions" in data
    assert "explanation_summary" in data

def test_similar_patterns():
    cycs = client.get("/api/cyclones").json()
    first_id = cycs[0]["id"]
    
    response = client.get(f"/api/cyclones/{first_id}/similar-patterns")
    assert response.status_code == 200
    data = response.json()
    assert len(data["similar_patterns"]) <= 5
    assert "disclaimer" in data
    assert "Historical similarity does not guarantee future behavior" in data["disclaimer"]

def test_ivr_flow():
    # Test IVR call initiation
    req = {
        "phone_number": "+919876543210",
        "recipient_name": "Test User",
        "language": "telugu",
        "district": "Visakhapatnam"
    }
    call_res = client.post("/api/ivr/test-call", json=req)
    assert call_res.status_code == 200
    call_data = call_res.json()
    assert "call_sid" in call_data
    
    # Test Keypad interaction: press 1 (Repeat)
    int_res = client.post("/api/ivr/interact", json={
        "call_sid": call_data["call_sid"],
        "digit": "1",
        "current_language": "telugu"
    })
    assert int_res.status_code == 200
    int_data = int_res.json()
    assert int_data["digit_received"] == "1"
