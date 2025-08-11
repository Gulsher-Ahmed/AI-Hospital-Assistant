# AI Call Center POC - PowerShell Installation Script

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "AI Call Center POC - Installation Script" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
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
Write-Host "Step 1: Installing backend dependencies..." -ForegroundColor Yellow
Set-Location "backend"

if (!(Test-Path "node_modules")) {
    Write-Host "Installing Node.js packages for backend..." -ForegroundColor Cyan
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Failed to install backend dependencies" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
    Write-Host "Backend dependencies installed successfully!" -ForegroundColor Green
} else {
    Write-Host "Backend dependencies already installed." -ForegroundColor Green
}

Write-Host ""
Write-Host "Step 2: Installing frontend dependencies..." -ForegroundColor Yellow
Set-Location "..\frontend"

if (!(Test-Path "node_modules")) {
    Write-Host "Installing Node.js packages for frontend..." -ForegroundColor Cyan
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Failed to install frontend dependencies" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
    Write-Host "Frontend dependencies installed successfully!" -ForegroundColor Green
} else {
    Write-Host "Frontend dependencies already installed." -ForegroundColor Green
}

Write-Host ""
Write-Host "Step 3: Setting up environment configuration..." -ForegroundColor Yellow
Set-Location "..\backend"

if (!(Test-Path ".env")) {
    Write-Host "Creating .env file from template..." -ForegroundColor Cyan
    Copy-Item ".env.example" ".env"
    Write-Host ""
    Write-Host "IMPORTANT: Please edit backend\.env file to add your OpenAI API key" -ForegroundColor Red
    Write-Host "You can also set USE_MOCK_LLM=true to use mock responses for testing" -ForegroundColor Yellow
} else {
    Write-Host "Environment file already exists." -ForegroundColor Green
}

Set-Location ".."

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Installation completed successfully!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Edit backend\.env file if you want to use OpenAI API" -ForegroundColor White
Write-Host "2. Run 'start-servers.ps1' to start both backend and frontend" -ForegroundColor White
Write-Host "3. Open http://localhost:5173 in your browser" -ForegroundColor White
Write-Host ""
Write-Host "For mock mode (no API key needed): Set USE_MOCK_LLM=true in backend\.env" -ForegroundColor Cyan
Write-Host ""
Read-Host "Press Enter to continue"
