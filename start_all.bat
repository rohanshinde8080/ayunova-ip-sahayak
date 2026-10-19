@echo off
echo ===================================================
echo   AYUNOVA (IP-SAKTI Sahayak) - Starting Full Stack
echo   Smart India Hackathon 2026 - PS SIH26045
echo ===================================================

echo [1/2] Launching Python FastAPI Backend on http://localhost:8000 ...
start "AYUNOVA Backend" cmd /k "cd backend && python run.py"

echo [2/2] Launching React Vite Frontend on http://localhost:5173 ...
start "AYUNOVA Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo Both servers are starting!
echo Frontend: http://localhost:5173/
echo Backend API Docs: http://localhost:8000/docs
echo ===================================================

