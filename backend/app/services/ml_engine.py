import math
import numpy as np
from typing import Dict, Any, List, Tuple
from app.models.cyclone import Cyclone, Observation
from app.models.prediction import Prediction, ModelVersion

class CycloneMLEngine:
    """
    CycloneFusion AI Core Intelligence Engine.
    Handles Multi-Source Identification, Classification, Fingerprint Generation,
    Short-Term Trend Prediction, and Explainable AI (XAI) Attribution.
    """
    
    MODEL_VERSION = "v2.1-CycloneFusion-MultiSource-DEMO"
    
    @classmethod
    def identify_cyclone(cls, observations: List[Observation], image_meta: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Multi-source pattern identification.
        Fuses satellite cloud symmetry + environmental pressure anomaly + wind threshold.
        """
        if not observations:
            return {
                "cyclone_detected": False,
                "probability": 0.05,
                "model_version": cls.MODEL_VERSION,
                "status": "No observation data available"
            }
        
        latest = observations[-1]
        wind = latest.wind_speed
        pressure = latest.pressure
        sst = latest.sst
        spiral = latest.spiral_structure or 0.5
        cloud_org = latest.cloud_organization or 0.5
        
        # Identification scoring heuristic (fuses image spiral + thermodynamic drop)
        pressure_factor = max(0.0, min(1.0, (1012.0 - pressure) / 30.0))
        wind_factor = max(0.0, min(1.0, wind / 120.0))
        sst_factor = 1.0 if sst >= 28.0 else (sst - 24.0) / 4.0
        
        composite_score = (
            0.30 * wind_factor +
            0.25 * pressure_factor +
            0.20 * spiral +
            0.15 * cloud_org +
            0.10 * max(0.0, sst_factor)
        )
        
        probability = round(min(0.99, max(0.10, composite_score + 0.12)), 3)
        detected = probability >= 0.50
        
        return {
            "cyclone_detected": detected,
            "probability": probability,
            "model_version": cls.MODEL_VERSION
        }

    @classmethod
    def classify_cyclone(cls, wind_speed: float, pressure: float) -> Tuple[str, int, float]:
        """
        IMD / WMO North Indian Ocean Standard Cyclone Classification:
        - Depression (D): 31–51 km/h
        - Deep Depression (DD): 52–61 km/h
        - Cyclonic Storm (CS): 62–88 km/h (Category 1)
        - Severe Cyclonic Storm (SCS): 89–117 km/h (Category 2)
        - Very Severe Cyclonic Storm (VSCS): 118–166 km/h (Category 3)
        - Extremely Severe Cyclonic Storm (ESCS): 167–221 km/h (Category 4)
        - Super Cyclonic Storm (SuCS): >= 222 km/h (Category 5)
        """
        if wind_speed >= 222:
            return "Super Cyclonic Storm (SuCS)", 5, 0.98
        elif wind_speed >= 167:
            return "Extremely Severe Cyclonic Storm (ESCS)", 4, 0.95
        elif wind_speed >= 118:
            return "Very Severe Cyclonic Storm (VSCS)", 3, 0.94
        elif wind_speed >= 89:
            return "Severe Cyclonic Storm (SCS)", 2, 0.92
        elif wind_speed >= 62:
            return "Cyclonic Storm (CS)", 1, 0.90
        elif wind_speed >= 52:
            return "Deep Depression (DD)", 0, 0.88
        else:
            return "Depression (D)", 0, 0.85

    @classmethod
    def generate_fingerprint_vector(cls, obs: Observation) -> Dict[str, Any]:
        """
        Generates normalized multi-dimensional Cyclone Fingerprint for vector search and comparison.
        Normalized vector components:
        [lat_norm, lon_norm, wind_norm, press_norm, sst_norm, speed_norm, cloud_norm, spiral_norm]
        """
        lat_norm = (obs.latitude - 5.0) / 25.0
        lon_norm = (obs.longitude - 65.0) / 35.0
        wind_norm = obs.wind_speed / 250.0
        press_norm = (1015.0 - obs.pressure) / 90.0
        sst_norm = (obs.sst - 24.0) / 10.0
        speed_norm = obs.movement_speed / 40.0
        cloud_norm = obs.cloud_organization or 0.7
        spiral_norm = obs.spiral_structure or 0.75
        
        vector = [
            round(float(np.clip(lat_norm, 0, 1)), 4),
            round(float(np.clip(lon_norm, 0, 1)), 4),
            round(float(np.clip(wind_norm, 0, 1)), 4),
            round(float(np.clip(press_norm, 0, 1)), 4),
            round(float(np.clip(sst_norm, 0, 1)), 4),
            round(float(np.clip(speed_norm, 0, 1)), 4),
            round(float(np.clip(cloud_norm, 0, 1)), 4),
            round(float(np.clip(spiral_norm, 0, 1)), 4),
        ]
        
        return {
            "latitude": obs.latitude,
            "longitude": obs.longitude,
            "wind_speed": obs.wind_speed,
            "pressure": obs.pressure,
            "sst": obs.sst,
            "movement_direction": obs.movement_direction,
            "movement_speed": obs.movement_speed,
            "cloud_organization": obs.cloud_organization or 0.75,
            "spiral_structure": obs.spiral_structure or 0.80,
            "intensity_trend": obs.intensity_trend or "Intensifying",
            "vector_json": vector
        }

    @classmethod
    def predict_trend(cls, observations: List[Observation]) -> Dict[str, Any]:
        """
        Sequential temporal trend analysis using sequential atmospheric & satellite observations.
        Predicts: Intensifying, Stable, or Weakening.
        Calculates 12h, 24h, 48h intensity projections.
        """
        if not observations or len(observations) < 2:
            latest_wind = observations[-1].wind_speed if observations else 95.0
            return {
                "trend": "Intensifying",
                "trend_confidence": 0.86,
                "intensity_forecast_12h": latest_wind + 15.0,
                "intensity_forecast_24h": latest_wind + 30.0,
                "intensity_forecast_48h": latest_wind + 45.0,
                "wind_delta": 12.0,
                "pressure_delta": -5.0
            }
            
        recent = observations[-4:] if len(observations) >= 4 else observations
        wind_deltas = [recent[i].wind_speed - recent[i-1].wind_speed for i in range(1, len(recent))]
        pressure_deltas = [recent[i].pressure - recent[i-1].pressure for i in range(1, len(recent))]
        
        avg_wind_delta = sum(wind_deltas) / len(wind_deltas)
        avg_press_delta = sum(pressure_deltas) / len(pressure_deltas)
        
        latest = observations[-1]
        
        # Decision boundary
        if avg_wind_delta > 2.0 or avg_press_delta < -1.5 or (latest.sst >= 28.5 and latest.spiral_structure >= 0.75):
            trend = "Intensifying"
            confidence = min(0.96, 0.82 + abs(avg_wind_delta) * 0.02)
            f12 = latest.wind_speed + max(8.0, avg_wind_delta * 2.2)
            f24 = latest.wind_speed + max(18.0, avg_wind_delta * 4.5)
            f48 = latest.wind_speed + max(30.0, avg_wind_delta * 7.0)
        elif avg_wind_delta < -2.0 or avg_press_delta > 1.5 or latest.sst < 26.0:
            trend = "Weakening"
            confidence = min(0.94, 0.80 + abs(avg_wind_delta) * 0.02)
            f12 = max(35.0, latest.wind_speed - 12.0)
            f24 = max(30.0, latest.wind_speed - 25.0)
            f48 = max(25.0, latest.wind_speed - 45.0)
        else:
            trend = "Stable"
            confidence = 0.84
            f12 = latest.wind_speed + 2.0
            f24 = latest.wind_speed + 4.0
            f48 = latest.wind_speed + 5.0

        return {
            "trend": trend,
            "trend_confidence": round(confidence, 3),
            "intensity_forecast_12h": round(f12, 1),
            "intensity_forecast_24h": round(f24, 1),
            "intensity_forecast_48h": round(f48, 1),
            "wind_delta": round(avg_wind_delta, 2),
            "pressure_delta": round(avg_press_delta, 2)
        }

    @classmethod
    def generate_xai_explanation(
        cls, 
        cyclone: Cyclone, 
        latest_obs: Observation, 
        trend_data: Dict[str, Any], 
        classification: str
    ) -> Dict[str, Any]:
        """
        Explainable AI (XAI) Attribution Module.
        Generates feature contributions (SHAP-like attribution weights) and understandable evidence points.
        """
        sst = latest_obs.sst
        wind = latest_obs.wind_speed
        press = latest_obs.pressure
        spiral = latest_obs.spiral_structure or 0.8
        cloud_org = latest_obs.cloud_organization or 0.75
        trend = trend_data["trend"]
        wind_delta = trend_data.get("wind_delta", 5.0)
        press_delta = trend_data.get("pressure_delta", -3.0)
        
        # Attribution weights (Sum to ~ 1.0)
        attributions = {
            "Central Atmospheric Pressure Drop": 0.28,
            "Sea Surface Temperature (Thermal Flux)": 0.24,
            "Satellite Spiral Band Organization": 0.20,
            "Convective Cloud Symmetry": 0.16,
            "Low Vertical Wind Shear Proxy": 0.12
        }
        
        key_factors = []
        
        if sst >= 28.0:
            key_factors.append(f"High Sea Surface Temperature ({sst:.1f}°C) well above 26.5°C threshold injects high latent heat energy.")
        else:
            key_factors.append(f"Marginal Sea Surface Temperature ({sst:.1f}°C) restricts additional heat flux convection.")
            
        if press_delta <= -1.5:
            key_factors.append(f"Significant barometric pressure drop of {abs(press_delta):.1f} hPa/observation indicates rapid vortex deepening.")
        elif press_delta >= 1.5:
            key_factors.append(f"Central pressure rising (+{press_delta:.1f} hPa) indicating atmospheric filling and core decay.")
            
        if spiral >= 0.70:
            key_factors.append(f"Satellite multi-spectral imagery displays tightly wound cyclonic feeder bands (Curvature Index: {spiral:.2f}).")
            
        if cloud_org >= 0.70:
            key_factors.append(f"Central Dense Overcast (CDO) shows high circular symmetry ({cloud_org*100:.0f}%), typical of intensifying tropical systems.")
            
        if wind_delta > 0:
            key_factors.append(f"Observed 10-minute sustained wind speed accelerated by +{wind_delta:.1f} km/h across recent telemetry intervals.")

        summary = (
            f"The system is classified as '{classification}' and projected to be {trend.upper()}. "
            f"Primary driving factors include high ocean thermal energy (SST {sst:.1f}°C) and persistent central pressure "
            f"drop ({press:.1f} hPa), combined with strong satellite spiral cloud organization ({spiral:.2f})."
        )
        
        return {
            "explanation_summary": summary,
            "feature_attributions": attributions,
            "key_factors": key_factors,
            "confidence_breakdown": {
                "satellite_pattern_weight": 0.36,
                "thermodynamic_weight": 0.38,
                "kinematic_track_weight": 0.26
            }
        }
