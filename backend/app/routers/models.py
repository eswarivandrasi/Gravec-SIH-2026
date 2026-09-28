from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.prediction import ModelVersion

router = APIRouter(prefix="/api/models", tags=["AI/ML Model Registry & Evaluation"])

@router.get("/versions")
def get_model_versions(db: Session = Depends(get_db)):
    return db.query(ModelVersion).all()

@router.get("/evaluation")
def get_model_evaluation_metrics():
    """
    Returns AI/ML model performance metrics:
    - Precision, Recall, F1 Score
    - Confusion Matrix across IMD Cyclone Categories
    - ROC / AUC Curve Points
    - Sensor Fusion Feature Importance
    """
    return {
        "model_name": "CycloneFusion ResNet-XGBoost Hybrid (DEMO MODEL)",
        "version": "v2.1-MultiSource-2026",
        "overall_accuracy": 0.934,
        "f1_macro": 0.926,
        "precision_macro": 0.938,
        "recall_macro": 0.915,
        "evaluation_dataset": "IMD Best Track Data (2000-2025) + INSAT/NOAA Fused Imagery (DEMO)",
        "dataset_size_samples": 18400,
        "confusion_matrix": {
            "labels": ["Depression", "Cyclonic Storm", "Severe CS", "Very Severe CS", "Extremely Severe CS", "Super Cyclone"],
            "matrix": [
                [320,  18,   2,   0,   0,   0],
                [ 14, 295,  12,   1,   0,   0],
                [  1,  10, 310,  15,   2,   0],
                [  0,   2,  12, 280,   9,   1],
                [  0,   0,   1,   8, 245,   6],
                [  0,   0,   0,   0,   4, 192]
            ]
        },
        "roc_curve": [
            {"fpr": 0.00, "tpr": 0.00},
            {"fpr": 0.02, "tpr": 0.72},
            {"fpr": 0.05, "tpr": 0.88},
            {"fpr": 0.08, "tpr": 0.94},
            {"fpr": 0.12, "tpr": 0.97},
            {"fpr": 0.20, "tpr": 0.99},
            {"fpr": 1.00, "tpr": 1.00}
        ],
        "feature_importance": [
            {"feature": "Central Pressure Deficit (hPa)", "importance": 0.285},
            {"feature": "Sea Surface Temperature (°C)", "importance": 0.235},
            {"feature": "Satellite Spiral Curvature Index", "importance": 0.195},
            {"feature": "Cloud Top Temperature Symmetry", "importance": 0.155},
            {"feature": "850-200 hPa Vertical Wind Shear", "importance": 0.130}
        ],
        "is_demo": True,
        "disclaimer": "DEMO MODEL: Trained on historical benchmark data for hackathon demonstration purposes."
    }
