from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.alert import SafetyInstruction, Shelter
from app.schemas.alert import SafetyInstructionResponse, ShelterResponse

router = APIRouter(prefix="/api/safety", tags=["Safety Guidelines & Shelters"])

@router.get("/instructions", response_model=List[SafetyInstructionResponse])
def get_safety_instructions(db: Session = Depends(get_db)):
    return db.query(SafetyInstruction).order_by(SafetyInstruction.priority.asc()).all()

@router.get("/shelters", response_model=List[ShelterResponse])
def get_shelters(db: Session = Depends(get_db)):
    return db.query(Shelter).all()
