# AI Call Center POC - PowerShell Server Startup Script

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "AI Call Center POC - Starting Servers" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
Write-Host "Checking if Node.js is installed..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Node.js is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""

# Check backend dependencies
Write-Host "Checking backend setup..." -ForegroundColor Yellow
if (!(Test-Path "backend\node_modules")) {
    Write-Host "ERROR: Backend dependencies not installed. Please run install.ps1 first." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Check frontend dependencies  
Write-Host "Checking frontend setup..." -ForegroundColor Yellow
if (!(Test-Path "frontend\node_modules")) {
    Write-Host "ERROR: Frontend dependencies not installed. Please run install.ps1 first." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "All dependencies are installed." -ForegroundColor Green
Write-Host ""

# Start backend server
Write-Host "Starting backend server..." -ForegroundColor Yellow
Set-Location "backend"
Write-Host "Backend starting on port 3001..." -ForegroundColor Cyan
Start-Process PowerShell -ArgumentList "-NoExit", "-Command", "npm start" -WindowStyle Normal
Set-Location ".."

# Wait a moment for backend to start
Write-Host "Waiting for backend to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# Start frontend server
Write-Host ""
Write-Host "Starting frontend development server..." -ForegroundColor Yellow
Set-Location "frontend"
Write-Host "Frontend starting on port 5173..." -ForegroundColor Cyan
Start-Process PowerShell -ArgumentList "-NoExit", "-Command", "npm run dev" -WindowStyle Normal
Set-Location ".."

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Servers are starting up!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Backend API: http://localhost:3001" -ForegroundColor White
Write-Host "Frontend UI: http://localhost:5173" -ForegroundColor White
Write-Host ""
Write-Host "The frontend should open automatically in your browser." -ForegroundColor Yellow
Write-Host "If not, navigate to http://localhost:5173" -ForegroundColor Yellow
Write-Host ""
Write-Host "To stop the servers, close both PowerShell windows or press Ctrl+C" -ForegroundColor Cyan
Write-Host ""

# Wait a bit more and try to open browser
Write-Host "Opening browser..." -ForegroundColor Yellow
Start-Sleep -Seconds 2
try {
    Start-Process "http://localhost:5173"
} catch {
    Write-Host "Could not open browser automatically. Please navigate to http://localhost:5173" -ForegroundColor Yellow
}

Read-Host "Press Enter to continue"
