import os
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "CYCLONEFUSION AI"
    TAGLINE: str = "Detect. Understand. Predict. Explain. Alert."
    VERSION: str = "1.0.0-SIH26070-DEMO"
    ENVIRONMENT: str = "demo"
    DEMO_MODE: bool = True
    
    # Security
    SECRET_KEY: str = "cyclonefusion-sih2026-super-secret-key-change-in-production-min32char"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 # 24 hours
    
    # Database
    DATABASE_URL: str = "sqlite:///./cyclonefusion.db"
    
    # Twilio Telephony (Optional - for real carrier phone calls)
    TWILIO_ACCOUNT_SID: Optional[str] = None
    TWILIO_AUTH_TOKEN: Optional[str] = None
    TWILIO_PHONE_NUMBER: Optional[str] = None
    
    # Storage
    UPLOAD_DIR: str = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "uploads")
    
    # CORS
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ]

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()

# Ensure uploads directory exists
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
os.makedirs(os.path.join(settings.UPLOAD_DIR, "satellites"), exist_ok=True)
os.makedirs(os.path.join(settings.UPLOAD_DIR, "csv"), exist_ok=True)
