@echo off
setlocal
title Pinjaman Wang Berlesen - Internal System
cd /d "%~dp0"

rem Use the Node.js runtime bundled in the "runtime" folder, if present, so
rem staff never have to install anything separately. Falls back to a
rem system-wide Node.js install only if the bundled copy is missing.
set "NODE_DIR="
for /d %%D in ("%~dp0runtime\node-*-win-x64") do (
    if exist "%%D\node.exe" set "NODE_DIR=%%D"
)

if defined NODE_DIR (
    set "PATH=%NODE_DIR%;%PATH%"
) else (
    where node >nul 2>nul
    if errorlevel 1 (
        echo.
        echo ============================================================
        echo   Node.js was not found.
        echo   The bundled copy in the "runtime" folder is missing, and no
        echo   system-wide Node.js install was found either.
        echo.
        echo   Please re-download the application folder ^(make sure the
        echo   "runtime" folder is included^), or install Node.js LTS
        echo   yourself from https://nodejs.org, then double-click
        echo   run.bat again.
        echo ============================================================
        echo.
        pause
        exit /b 1
    )
)

for /f "delims=." %%v in ('node -p "process.versions.node"') do set NODE_MAJOR=%%v
if %NODE_MAJOR% LSS 22 (
    echo.
    echo ============================================================
    echo   This app requires Node.js version 22 or newer ^(found %NODE_MAJOR%^).
    echo   Please install the latest LTS version from https://nodejs.org
    echo   then double-click run.bat again.
    echo ============================================================
    echo.
    pause
    exit /b 1
)

if not exist "node_modules" (
    echo Installing dependencies for the first time. This may take a few minutes...
    call npm install
    if errorlevel 1 (
        echo.
        echo [ERROR] npm install failed. Check your internet connection and try again.
        pause
        exit /b 1
    )
)

if not exist ".next" (
    echo Building the application for the first time...
    call npm run build
    if errorlevel 1 (
        echo.
        echo [ERROR] Build failed. See the messages above.
        pause
        exit /b 1
    )
)

if not exist "data" mkdir "data"

echo.
echo Starting the internal system...
start "Pinjaman System Server" cmd /k npm run start

timeout /t 5 /nobreak >nul
start "" http://localhost:3000

echo.
echo The server is running in the "Pinjaman System Server" window.
echo Close that window to stop the system. You can close this window now.
echo.
echo NOTE: If you update the application files later, delete the ".next"
echo folder before running run.bat again so the changes are rebuilt.
timeout /t 8 >nul
exit /b 0
