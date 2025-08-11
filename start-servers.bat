@echo off
echo ============================================
echo AI Call Center POC - Starting Servers
echo ============================================
echo.

echo Checking if Node.js is installed...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js is installed.
echo.

echo Starting backend server...
cd backend
if not exist node_modules (
    echo ERROR: Backend dependencies not installed. Please run install.bat first.
    pause
    exit /b 1
)

echo Backend starting on port 3001...
start "AI Call Center Backend" cmd /k "npm start"

echo Waiting for backend to start...
timeout /t 3 /nobreak >nul

echo.
echo Starting frontend development server...
cd ..\frontend
if not exist node_modules (
    echo ERROR: Frontend dependencies not installed. Please run install.bat first.
    pause
    exit /b 1
)

echo Frontend starting on port 5173...
start "AI Call Center Frontend" cmd /k "npm run dev"

echo.
echo ============================================
echo Servers are starting up!
echo ============================================
echo.
echo Backend API: http://localhost:3001
echo Frontend UI: http://localhost:5173
echo.
echo The frontend should open automatically in your browser.
echo If not, navigate to http://localhost:5173
echo.
echo To stop the servers, close both terminal windows or press Ctrl+C
echo.
pause
