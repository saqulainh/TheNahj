$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

Write-Host ""
Write-Host " TheNahj - Starting development server" -ForegroundColor Cyan
Write-Host " =====================================" -ForegroundColor Cyan
Write-Host ""

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Write-Host "[ERROR] Node.js is not installed. Get it from https://nodejs.org/" -ForegroundColor Red
  exit 1
}

if (-not (Test-Path "node_modules\next\package.json")) {
  Write-Host "Installing dependencies (first run may take a few minutes)..." -ForegroundColor Yellow
  npm install
}

Write-Host ""
Write-Host "Open: http://localhost:3000" -ForegroundColor Green
Write-Host "Admin: http://localhost:3000/admin/login (password in .env.local)" -ForegroundColor Green
Write-Host ""

npm run dev
