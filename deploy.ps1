# AI Content Generator Deployment Script (PowerShell Version)
# Version: 2.0.0

# Colors for output
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"
$Blue = "Blue"

# Configuration
$ProjectName = "ai-content-generator"
$Version = "2.0.0"
$BuildDir = "dist"
$DeployBranch = "gh-pages"

# Functions
function Write-Header {
    param([string]$Message)
    Write-Host "`n=== $Message ===" -ForegroundColor $Blue
}

function Write-Step {
    param([string]$Message)
    Write-Host "→ $Message" -ForegroundColor $Yellow
}

function Write-Success {
    param([string]$Message)
    Write-Host "✓ $Message" -ForegroundColor $Green
}

function Write-Error {
    param([string]$Message)
    Write-Host "✗ $Message" -ForegroundColor $Red
}

function Write-Info {
    param([string]$Message)
    Write-Host "ℹ $Message" -ForegroundColor $Blue
}

# Check if required tools are installed
function Test-Dependencies {
    Write-Step "Checking dependencies..."
    
    $tools = @("node", "npm", "git")
    $missing = @()
    
    foreach ($tool in $tools) {
        try {
            $null = Get-Command $tool -ErrorAction Stop
            Write-Success "$tool is installed"
        }
        catch {
            $missing += $tool
            Write-Error "$tool is not installed"
        }
    }
    
    if ($missing.Count -gt 0) {
        Write-Error "Missing required tools: $($missing -join ', ')"
        Write-Info "Please install the missing tools and try again"
        exit 1
    }
}

# Install dependencies
function Install-Dependencies {
    Write-Step "Installing npm dependencies..."
    
    if (Test-Path "package.json") {
        try {
            npm install
            Write-Success "Dependencies installed successfully"
        }
        catch {
            Write-Error "Failed to install dependencies"
            exit 1
        }
    }
    else {
        Write-Info "No package.json found, skipping npm install"
    }
}

# Build the project
function Build-Project {
    Write-Step "Building project..."
    
    # Create build directory
    if (Test-Path $BuildDir) {
        Remove-Item $BuildDir -Recurse -Force
    }
    New-Item -ItemType Directory -Path $BuildDir | Out-Null
    
    # Copy files to build directory
    $filesToCopy = @("index.html", "styles.css", "features.js", "export.js", "advanced-features.js", "sw.js", "manifest.json")
    
    foreach ($file in $filesToCopy) {
        if (Test-Path $file) {
            Copy-Item $file $BuildDir
            Write-Success "Copied $file"
        }
    }
    
    # Copy other assets if they exist
    $assets = @("images", "icons", "assets")
    foreach ($asset in $assets) {
        if (Test-Path $asset) {
            Copy-Item $asset $BuildDir -Recurse
            Write-Success "Copied $asset directory"
        }
    }
    
    Write-Success "Project built successfully"
}

# Run tests
function Test-Project {
    Write-Step "Running tests..."
    
    if (Test-Path "package.json") {
        try {
            npm test
            Write-Success "Tests passed"
        }
        catch {
            Write-Error "Tests failed"
            exit 1
        }
    }
    else {
        Write-Info "No tests configured, skipping"
    }
}

# Lint code
function Invoke-Lint {
    Write-Step "Linting code..."
    
    if (Test-Path "package.json") {
        try {
            npm run lint
            Write-Success "Linting passed"
        }
        catch {
            Write-Error "Linting failed"
            exit 1
        }
    }
    else {
        Write-Info "No linting configured, skipping"
    }
}

# Deploy to GitHub Pages
function Deploy-GitHubPages {
    Write-Step "Deploying to GitHub Pages..."
    
    try {
        # Check if git is initialized
        if (-not (Test-Path ".git")) {
            git init
        }
        
        # Add all files
        git add .
        git commit -m "Deploy version $Version" -q
        
        # Push to GitHub Pages branch
        git push origin $DeployBranch --force
        Write-Success "Deployed to GitHub Pages"
    }
    catch {
        Write-Error "Failed to deploy to GitHub Pages"
        Write-Info "Make sure you have a GitHub repository configured"
    }
}

# Create release archive
function New-Release {
    Write-Step "Creating release archive..."
    
    $releaseName = "$ProjectName-v$Version"
    $archivePath = "$releaseName.zip"
    
    try {
        Compress-Archive -Path $BuildDir/* -DestinationPath $archivePath -Force
        Write-Success "Release archive created: $archivePath"
    }
    catch {
        Write-Error "Failed to create release archive"
    }
}

# Main deployment function
function Start-Deployment {
    param(
        [string]$Target = "build"
    )
    
    Write-Header "AI Content Generator Deployment"
    Write-Info "Version: $Version"
    Write-Info "Target: $Target"
    
    try {
        Test-Dependencies
        Install-Dependencies
        Build-Project
        
        switch ($Target.ToLower()) {
            "test" {
                Test-Project
                Invoke-Lint
            }
            "github" {
                Deploy-GitHubPages
            }
            "release" {
                New-Release
            }
            default {
                Write-Info "Build completed successfully"
                Write-Info "Run with -Target 'test' to run tests"
                Write-Info "Run with -Target 'github' to deploy to GitHub Pages"
                Write-Info "Run with -Target 'release' to create release archive"
            }
        }
        
        Write-Header "Deployment completed successfully!"
    }
    catch {
        Write-Error "Deployment failed: $($_.Exception.Message)"
        exit 1
    }
}

# Run main function with all arguments
Start-Deployment @args 