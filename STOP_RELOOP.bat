@echo off
title RELOOP Refurbished Electronics Platform -- Clean Shutdown
cd /d "%~dp0"

echo ====================================================================
echo   RELOOP -- Refurbished Electronics Marketplace Shutdown
echo   Dedicated Process Termination System
echo ====================================================================
echo.

:: Verify Node.js is installed
where node >nul 2>nul
if errorlevel 1 goto NoNode

:: Execute the launcher script in stop mode
node scripts\launcher.js stop
goto Done

:NoNode
echo [ERROR] Node.js is not detected in your system PATH!
echo.
pause
exit /b 1

:Done
echo.
echo Window will close automatically in 3 seconds...
ping 127.0.0.1 -n 4 >nul 2>nul
exit /b 0
