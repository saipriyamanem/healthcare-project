@echo off
title PulseCare - Healthcare Management System
cd /d "%~dp0"

echo ==========================================
echo        PULSECARE STARTUP
echo ==========================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is not installed. Install Node.js LTS first.
  pause
  exit /b 1
)

echo Installing/checking project dependencies...
call npm install
if errorlevel 1 goto :error
call npm run install-all
if errorlevel 1 goto :error

echo.
echo Starting PulseCare backend...
start "PulseCare Backend" cmd /k "cd /d %~dp0backend && npm start"

timeout /t 3 /nobreak >nul

echo Starting PulseCare frontend...
start "PulseCare Frontend" cmd /k "cd /d %~dp0frontend && npm start"

echo.
echo PulseCare is starting.
echo Frontend: http://localhost:3000
echo Backend : http://localhost:5000
echo.
echo IMPORTANT: MongoDB must be running locally.
echo Demo doctor password: doctor123
pause
exit /b 0

:error
echo.
echo Installation failed. Check the error above.
pause
exit /b 1
