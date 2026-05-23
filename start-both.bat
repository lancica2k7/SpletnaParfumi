@echo off
echo Starting Parfumerija CICKO - Backend and Frontend
echo.

REM Start backend in new window
start "Backend Server" cmd /k "cd backend && npm run dev"

REM Wait 3 seconds for backend to start
timeout /t 3 /nobreak > nul

REM Start frontend in new window
start "Frontend App" cmd /k "cd frontend && npm start"

echo.
echo Both servers starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Close this window after both servers are running.
pause




