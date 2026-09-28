# CycloneFusion AI - PowerShell Start Script
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "          CYCLONEFUSION AI - Smart India Hackathon 2026" -ForegroundColor Cyan
Write-Host "    Detect. Understand. Predict. Explain. Alert. (SIH26070)" -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan

$rootPath = "C:\Users\satya\Downloads\Gravec\Gravec"
$backendPath = Join-Path $rootPath "backend"
$frontendPath = Join-Path $rootPath "frontend"
$backendPython = Join-Path $backendPath ".venv\Scripts\python.exe"

Write-Host "Starting Backend FastAPI on http://localhost:8000 ..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-Command", "Set-Location '$backendPath'; & '$backendPython' -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

Write-Host "Starting Frontend React + Leaflet on http://localhost:5173 ..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-Command", "Set-Location '$frontendPath'; npm run dev -- --host 0.0.0.0"

Write-Host "CycloneFusion AI services started!" -ForegroundColor Green
Write-Host "Disaster Dashboard: http://localhost:5173" -ForegroundColor Green
Write-Host "FastAPI Swagger Docs: http://localhost:8000/docs" -ForegroundColor Green
