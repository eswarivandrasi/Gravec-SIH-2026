import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager

from app.config import settings
from app.database import engine, init_db, SessionLocal
from app.services.seed_data import seed_database
from app.routers import auth, cyclones, data, alerts, ivr, safety, dashboard, system, models

# Initialize DB tables and seed data immediately on start
init_db()
db = SessionLocal()
try:
    seed_database(db)
finally:
    db.close()

@asynccontextmanager
async def lifespan(app: FastAPI):
    yield

app = FastAPI(
    title=f"{settings.PROJECT_NAME} - SIH2026 Prototype",
    description="AI/ML Based Identification, Classification and Prediction of Tropical Cyclone Patterns Using Multi-Source Satellite Data with Inclusive Voice Alert System.",
    version=settings.VERSION,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Uploads directory for satellite images
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Health check
@app.get("/api/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "demo_mode": settings.DEMO_MODE,
        "disclaimer": "DEMO DATA MODE"
    }

# Include Routers
app.include_router(auth.router)
app.include_router(cyclones.router)
app.include_router(data.router)
app.include_router(alerts.router)
app.include_router(ivr.router)
app.include_router(safety.router)
app.include_router(dashboard.router)
app.include_router(system.router)
app.include_router(models.router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
