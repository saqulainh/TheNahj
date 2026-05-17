@echo off
title TheNahj Dev Server
cd /d "%~dp0"

echo.
echo  TheNahj - Starting development server
echo  =====================================
echo.

where node >nul 2>&1
if errorlevel 1 (
  echo [ERROR] Node.js is not installed.
  echo Download from https://nodejs.org/ and run this file again.
  pause
  exit /b 1
)

if not exist "node_modules\next\package.json" (
  echo Installing dependencies... first time may take 2-5 minutes.
  echo.
  call npm install
  if errorlevel 1 (
    echo [ERROR] npm install failed.
    pause
    exit /b 1
  )
)

echo.
echo Starting server at http://localhost:3000
echo Keep this window open. Press Ctrl+C to stop.
echo.

call npm run dev

pause
