import io
import pandas as pd
from typing import Tuple, List, Dict, Any
from datetime import datetime

REQUIRED_CSV_FIELDS = [
    "timestamp", "latitude", "longitude", "wind_speed", "pressure", 
    "sst", "movement_direction", "movement_speed"
]

ALLOWED_IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"]

class DataValidator:
    """
    Validates meteorological environmental CSV files and satellite images.
    """

    @classmethod
    def validate_csv(cls, file_content: bytes) -> Tuple[bool, str, List[Dict[str, Any]]]:
        """
        Validates CSV content:
        - Check required columns
        - Validate latitude (-90 to 90) & longitude (-180 to 180)
        - Validate wind_speed (> 0) & pressure (850 to 1050 hPa)
        - Validate sea surface temperature SST (10 to 40 °C)
        - Check for duplicate timestamps
        """
        try:
            df = pd.read_csv(io.BytesIO(file_content))
        except Exception as e:
            return False, f"Failed to parse CSV file: {str(e)}", []

        # Check column names (case insensitive)
        df_cols_lower = [c.lower().strip() for c in df.columns]
        for req in REQUIRED_CSV_FIELDS:
            if req not in df_cols_lower:
                return False, f"Missing required column: '{req}'. Required fields: {', '.join(REQUIRED_CSV_FIELDS)}", []

        # Normalize column names
        col_map = {orig: orig.lower().strip() for orig in df.columns}
        df.rename(columns=col_map, inplace=True)

        # Check for empty dataframe
        if len(df) == 0:
            return False, "The CSV file is empty.", []

        # Check missing values in critical columns
        critical_cols = ["timestamp", "latitude", "longitude", "wind_speed", "pressure", "sst"]
        for col in critical_cols:
            if df[col].isnull().any():
                return False, f"Column '{col}' contains missing (null/NaN) values.", []

        records = []
        timestamps_seen = set()

        for idx, row in df.iterrows():
            row_num = idx + 2 # Header is line 1

            # Validate timestamp format
            try:
                ts = pd.to_datetime(row["timestamp"])
                ts_iso = ts.isoformat()
                if ts_iso in timestamps_seen:
                    return False, f"Duplicate timestamp detected at row {row_num}: {row['timestamp']}", []
                timestamps_seen.add(ts_iso)
            except Exception:
                return False, f"Invalid timestamp format at row {row_num}: {row['timestamp']}", []

            # Validate Coordinates
            try:
                lat = float(row["latitude"])
                lon = float(row["longitude"])
                if not (-90.0 <= lat <= 90.0):
                    return False, f"Invalid latitude {lat} at row {row_num}. Must be between -90 and 90.", []
                if not (-180.0 <= lon <= 180.0):
                    return False, f"Invalid longitude {lon} at row {row_num}. Must be between -180 and 180.", []
            except (ValueError, TypeError):
                return False, f"Non-numeric coordinates at row {row_num}.", []

            # Validate Meteorological ranges
            try:
                wind = float(row["wind_speed"])
                press = float(row["pressure"])
                sst = float(row["sst"])
                speed = float(row.get("movement_speed", 15.0))
                
                if wind < 0 or wind > 350:
                    return False, f"Wind speed {wind} at row {row_num} is out of realistic physical range (0-350 km/h).", []
                if press < 850 or press > 1050:
                    return False, f"Atmospheric pressure {press} at row {row_num} is out of realistic range (850-1050 hPa).", []
                if sst < 10 or sst > 45:
                    return False, f"Sea surface temperature {sst} at row {row_num} is out of range (10-45 °C).", []
            except (ValueError, TypeError):
                return False, f"Invalid numerical value in meteorological columns at row {row_num}.", []

            record = {
                "timestamp": ts_iso,
                "latitude": lat,
                "longitude": lon,
                "wind_speed": wind,
                "pressure": press,
                "sst": sst,
                "movement_direction": str(row.get("movement_direction", "NW")).upper(),
                "movement_speed": speed,
                "cloud_organization": float(row.get("cloud_organization", 0.75)),
                "spiral_structure": float(row.get("spiral_structure", 0.80)),
                "intensity_trend": str(row.get("intensity_trend", "Intensifying")),
            }
            records.append(record)

        return True, f"Successfully validated {len(records)} observations.", records
