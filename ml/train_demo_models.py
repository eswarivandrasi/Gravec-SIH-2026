"""
CycloneFusion AI - Demo ML Training & Benchmarking Script
Trains and evaluates baseline scikit-learn models on synthetic IMD historical observation sets.
"""

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier, GradientBoostingRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix, r2_score

def generate_synthetic_cyclone_dataset(num_samples=2500):
    np.random.seed(42)
    
    # Atmospheric & Satellite Features
    lat = np.random.uniform(8.0, 22.0, num_samples)
    lon = np.random.uniform(80.0, 92.0, num_samples)
    sst = np.random.uniform(25.0, 31.5, num_samples)
    pressure = np.random.uniform(910.0, 1008.0, num_samples)
    spiral_index = np.random.uniform(0.3, 0.98, num_samples)
    cdo_symmetry = np.random.uniform(0.4, 0.99, num_samples)
    
    # Physical relationship: lower pressure & high SST -> higher wind speed
    wind_speed = 3.5 * (1015.0 - pressure) + 2.8 * (sst - 26.0) + 25.0 * spiral_index + np.random.normal(0, 4, num_samples)
    wind_speed = np.clip(wind_speed, 35.0, 265.0)
    
    # IMD Category mapping
    def map_category(w):
        if w >= 222: return 5 # SuCS
        elif w >= 167: return 4 # ESCS
        elif w >= 118: return 3 # VSCS
        elif w >= 89: return 2 # SCS
        elif w >= 62: return 1 # CS
        else: return 0 # D/DD

    categories = [map_category(w) for w in wind_speed]
    
    df = pd.DataFrame({
        "latitude": lat,
        "longitude": lon,
        "sst": sst,
        "pressure": pressure,
        "spiral_index": spiral_index,
        "cdo_symmetry": cdo_symmetry,
        "wind_speed": wind_speed,
        "category": categories
    })
    return df

def train_models():
    print("Generating synthetic multi-source cyclone benchmark data...")
    df = generate_synthetic_cyclone_dataset(3000)
    
    X = df[["latitude", "longitude", "sst", "pressure", "spiral_index", "cdo_symmetry"]]
    y_cat = df["category"]
    y_wind = df["wind_speed"]
    
    X_train, X_test, y_train_cat, y_test_cat, y_train_wind, y_test_wind = train_test_split(
        X, y_cat, y_wind, test_size=0.2, random_state=42
    )
    
    # 1. Classification Model
    clf = RandomForestClassifier(n_estimators=100, max_depth=8, random_state=42)
    clf.fit(X_train, y_train_cat)
    pred_cat = clf.predict(X_test)
    
    print("\n--- IMD Classification Performance ---")
    print(classification_report(y_test_cat, pred_cat))
    
    # 2. Wind Intensity Regressor
    reg = GradientBoostingRegressor(n_estimators=100, learning_rate=0.1, random_state=42)
    reg.fit(X_train, y_train_wind)
    pred_wind = reg.predict(X_test)
    
    r2 = r2_score(y_test_wind, pred_wind)
    print(f"\n--- Wind Intensity Regression R² Score: {r2:.4f} ---")
    
    print("\nFeature Importances:")
    for feat, imp in zip(X.columns, clf.feature_importances_):
        print(f"  - {feat}: {imp*100:.1f}%")
        
    print("\nCycloneFusion AI models successfully trained and verified in DEMO MODE.")

if __name__ == "__main__":
    train_models()
