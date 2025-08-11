@echo off
echo ============================================
echo AI Call Center POC - Installation Script
echo ============================================
echo.

echo Step 1: Installing backend dependencies...
cd backend
if not exist node_modules (
    echo Installing Node.js packages for backend...
    npm install
    if errorlevel 1 (
        echo ERROR: Failed to install backend dependencies
        pause
        exit /b 1
    )
    echo Backend dependencies installed successfully!
) else (
    echo Backend dependencies already installed.
)

echo.
echo Step 2: Installing frontend dependencies...
cd ..\frontend
if not exist node_modules (
    echo Installing Node.js packages for frontend...
    npm install
    if errorlevel 1 (
        echo ERROR: Failed to install frontend dependencies
        pause
        exit /b 1
    )
    echo Frontend dependencies installed successfully!
) else (
    echo Frontend dependencies already installed.
)

echo.
echo Step 3: Setting up environment configuration...
cd ..\backend
if not exist .env (
    echo Creating .env file from template...
    copy .env.example .env
    echo.
    echo IMPORTANT: Please edit backend\.env file to add your OpenAI API key
    echo You can also set USE_MOCK_LLM=true to use mock responses for testing
) else (
    echo Environment file already exists.
)

echo.
echo ============================================
echo Installation completed successfully!
echo ============================================
echo.
echo Next steps:
echo 1. Edit backend\.env file if you want to use OpenAI API
echo 2. Run 'start-servers.bat' to start both backend and frontend
echo 3. Open http://localhost:5173 in your browser
echo.
echo For mock mode (no API key needed): Set USE_MOCK_LLM=true in backend\.env
echo.
pause
