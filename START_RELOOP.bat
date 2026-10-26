@echo off
title RELOOP Refurbished Electronics Platform
cd /d "%~dp0"

echo ====================================================================
echo   RELOOP -- Refurbished Electronics Marketplace Launcher
echo   Double-Click Startup System
echo ====================================================================
echo.

:: Verify Node.js is installed and available
where node >nul 2>nul
if errorlevel 1 goto NoNode

:: Execute the launcher script in start mode
node scripts\launcher.js start
goto Done

:NoNode
echo [ERROR] Node.js is not detected in your system PATH!
echo Please install Node.js version 18 or higher from https://nodejs.org
echo Once installed, restart your terminal or computer and retry.
echo.
pause
exit /b 1

:Done
if errorlevel 1 (
    echo.
    echo [RELOOP] Launcher terminated with error code %errorlevel%.
    echo Please review the diagnostic log above.
    echo.
    pause
    exit /b %errorlevel%
)

echo.
echo ====================================================================
echo   RELOOP platform session ended.
echo ====================================================================
echo.
pause
