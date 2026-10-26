@echo off
title RELOOP - MongoDB Database Inspection GUI
color 0A

echo ====================================================================
echo   RELOOP Refurbished Electronics Platform - Database Inspection
echo ====================================================================
echo.
echo Target Connection : mongodb://127.0.0.1:27017
echo Target Database   : reloop
echo Active Collections:
echo   - products         (Certified refurbished device catalogue)
echo   - orders           (Customer orders, pricing & fulfillment stages)
echo   - users            (Admin and customer accounts)
echo   - tradeinrequests  (Provisional trade-in hardware quotes)
echo   - digitalpassports (Cryptographic device passports & diagnostics)
echo.

set COMPASS_PATH=%LOCALAPPDATA%\MongoDBCompass\MongoDBCompass.exe

if exist "%COMPASS_PATH%" (
    echo [OK] Found MongoDB Compass at:
    echo      %COMPASS_PATH%
    echo.
    echo Launching MongoDB Compass...
    start "" "%COMPASS_PATH%" "mongodb://127.0.0.1:27017"
    echo [OK] MongoDB Compass launched successfully.
    echo      Connect to: mongodb://127.0.0.1:27017 and open the "reloop" database.
) else (
    echo [NOTICE] MongoDB Compass was not found in the standard user path:
    echo          %COMPASS_PATH%
    echo.
    echo If Compass is installed elsewhere or you use mongosh / VS Code:
    echo   Connection URI : mongodb://127.0.0.1:27017
    echo   Database Name  : reloop
)

echo.
echo ====================================================================
echo Press any key to close this launcher window...
pause >nul
