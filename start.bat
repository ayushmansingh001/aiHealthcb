@echo off
setlocal
echo ================================================
echo   AI Health Assistant - Startup Script
echo ================================================
echo.

REM Add Node.js to PATH
set "PATH=c:\Users\LENOVO.IN\nodejs\node-v20.20.0-win-x64;%PATH%"

REM Ensure .env exists in backend
if not exist "backend\.env" (
    copy "backend\.env.example" "backend\.env" >nul
    echo [INFO] Created backend\.env from template.
)

echo [INFO] Launching FastAPI Backend on port 8000...
start "AI Health Backend" cmd /k "cd /d "%~dp0backend" && call venv\Scripts\activate.bat && python main.py"

echo [INFO] Launching React Frontend on port 5173...
start "AI Health Frontend" cmd /k "cd /d "%~dp0frontend" && set "PATH=c:\Users\LENOVO.IN\nodejs\node-v20.20.0-win-x64;%%PATH%%" && npm run dev"

echo.
echo ================================================
echo   Services are starting up!
echo   Frontend : http://localhost:5173
echo   Backend  : http://localhost:8000
echo   API Docs : http://localhost:8000/docs
echo ================================================
echo.
ping 127.0.0.1 -n 4 >nul
start http://localhost:5173
