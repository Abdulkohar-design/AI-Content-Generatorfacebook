@echo off
echo ========================================
echo AI Content Generator - Git Setup
echo ========================================

echo.
echo Checking Git installation...
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Git is not installed
    echo Please install Git from https://git-scm.com/
    pause
    exit /b 1
) else (
    echo ✓ Git is installed
)

echo.
echo Initializing Git repository...
git init

echo.
echo Adding files to Git...
git add .

echo.
echo Creating initial commit...
git commit -m "Initial commit: AI Content Generator v2.0.0"

echo.
echo ========================================
echo Git repository initialized successfully!
echo ========================================
echo.
echo Next steps:
echo 1. Create a new repository on GitHub
echo 2. Copy the repository URL
echo 3. Run: git remote add origin YOUR_REPOSITORY_URL
echo 4. Run: git push -u origin main
echo.
echo Repository URL example:
echo https://github.com/yourusername/ai-content-generator.git
echo.
pause 