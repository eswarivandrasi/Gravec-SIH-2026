from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    phone_number: str = Field(..., min_length=10, max_length=20)
    email: Optional[str] = None
    preferred_language: str = "english" # telugu, hindi, english
    state: str = "Andhra Pradesh"
    district: str
    area: Optional[str] = None
    alert_preference: str = "ALL"

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)
    role: Optional[str] = "citizen"

class UserLogin(BaseModel):
    phone_number: str
    password: str

class UserResponse(UserBase):
    id: int
    role: str
    is_active: bool
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
