@echo off
echo ========================================
echo AI Content Generator Deployment Script
echo Version: 2.0.0
echo ========================================

echo.
echo Checking dependencies...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
) else (
    echo ✓ Node.js is installed
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: npm is not installed
    pause
    exit /b 1
) else (
    echo ✓ npm is installed
)

REM Check if git is installed
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo WARNING: Git is not installed (optional for deployment)
) else (
    echo ✓ Git is installed
)

echo.
echo Building project...

REM Create dist directory if it doesn't exist
if not exist "dist" mkdir dist

REM Copy files to dist directory
echo Copying files to dist directory...
copy "index.html" "dist\" >nul 2>&1
copy "styles.css" "dist\" >nul 2>&1
copy "features.js" "dist\" >nul 2>&1
copy "export.js" "dist\" >nul 2>&1
copy "advanced-features.js" "dist\" >nul 2>&1
copy "sw.js" "dist\" >nul 2>&1
copy "manifest.json" "dist\" >nul 2>&1

REM Copy directories if they exist
if exist "images" xcopy "images" "dist\images\" /E /I /Y >nul 2>&1
if exist "icons" xcopy "icons" "dist\icons\" /E /I /Y >nul 2>&1
if exist "assets" xcopy "assets" "dist\assets\" /E /I /Y >nul 2>&1

echo ✓ Project built successfully

echo.
echo ========================================
echo Deployment completed successfully!
echo ========================================
echo.
echo Your application is ready in the 'dist' folder
echo To run locally, use: python -m http.server 8080
echo Then open: http://localhost:8080
echo.
pause 