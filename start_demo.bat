@echo off
echo ======================================================================
echo           CYCLONEFUSION AI - Smart India Hackathon 2026
echo     Detect. Understand. Predict. Explain. Alert. (SIH26070)
echo ======================================================================
echo.
echo Starting FastAPI Backend Server on port 8000...
start "CycloneFusion AI - Backend" cmd /k "cd backend && ..\.venv\Scripts\python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

echo Starting React + Leaflet Frontend on port 5173...
start "CycloneFusion AI - Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ======================================================================
echo Prototype is launching!
echo Frontend: http://localhost:5173
echo Backend API Docs: http://localhost:8000/docs
echo ======================================================================
