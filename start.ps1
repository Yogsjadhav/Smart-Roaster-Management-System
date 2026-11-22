# Smart Roster Management System - Quick Start Script
# This script helps start the application quickly

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Smart Roster Management System" -ForegroundColor Cyan
Write-Host "Quick Start Script" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Check if MongoDB is running
Write-Host "Checking MongoDB..." -ForegroundColor Yellow
try {
    $mongoProcess = Get-Process mongod -ErrorAction SilentlyContinue
    if ($mongoProcess) {
        Write-Host "✓ MongoDB is running" -ForegroundColor Green
    } else {
        Write-Host "✗ MongoDB is not running" -ForegroundColor Red
        Write-Host "  Starting MongoDB..." -ForegroundColor Yellow
        Start-Process "mongod" -WindowStyle Hidden
        Start-Sleep -Seconds 3
        Write-Host "✓ MongoDB started" -ForegroundColor Green
    }
} catch {
    Write-Host "✗ Could not start MongoDB" -ForegroundColor Red
    Write-Host "  Please start MongoDB manually" -ForegroundColor Yellow
}

Write-Host ""

# Check if dependencies are installed
Write-Host "Checking dependencies..." -ForegroundColor Yellow

if (!(Test-Path "backend/node_modules")) {
    Write-Host "✗ Backend dependencies not installed" -ForegroundColor Red
    Write-Host "  Installing backend dependencies..." -ForegroundColor Yellow
    Set-Location backend
    npm install
    Set-Location ..
    Write-Host "✓ Backend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "✓ Backend dependencies installed" -ForegroundColor Green
}

if (!(Test-Path "frontend/node_modules")) {
    Write-Host "✗ Frontend dependencies not installed" -ForegroundColor Red
    Write-Host "  Installing frontend dependencies..." -ForegroundColor Yellow
    Set-Location frontend
    npm install
    Set-Location ..
    Write-Host "✓ Frontend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "✓ Frontend dependencies installed" -ForegroundColor Green
}

Write-Host ""

# Ask if user wants to seed database
$seed = Read-Host "Do you want to seed the database? (Y/N)"
if ($seed -eq "Y" -or $seed -eq "y") {
    Write-Host "Seeding database..." -ForegroundColor Yellow
    Set-Location backend
    npm run seed
    Set-Location ..
    Write-Host "✓ Database seeded" -ForegroundColor Green
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Starting servers..." -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Start backend in new window
Write-Host "Starting backend server on http://localhost:5000" -ForegroundColor Yellow
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd backend; npm run dev" -WindowStyle Normal

Start-Sleep -Seconds 2

# Start frontend in new window
Write-Host "Starting frontend server on http://localhost:5173" -ForegroundColor Yellow
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev" -WindowStyle Normal

Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "Application is starting!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "Backend:  http://localhost:5000" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "Login credentials:" -ForegroundColor Yellow
Write-Host "  Username: admin" -ForegroundColor White
Write-Host "  Password: admin123" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to exit this window..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
