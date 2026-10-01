@echo off
echo ============================================
echo Starting Expense Tracker Application
echo ============================================
echo.

start "Expense Tracker - Backend" cmd /k "cd /d %~dp0backend && npm start"
timeout /t 2 /nobreak >nul
start "Expense Tracker - Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

timeout /t 2 /nobreak >nul
echo Opening application in your default browser...
start http://localhost:5173
