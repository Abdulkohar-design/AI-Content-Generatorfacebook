#!/bin/bash

# AI Content Generator Deployment Script
# Version: 2.0.0

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="ai-content-generator"
VERSION="2.0.0"
BUILD_DIR="dist"
DEPLOY_BRANCH="gh-pages"

# Functions
print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}  AI Content Generator v${VERSION}${NC}"
    echo -e "${BLUE}  Deployment Script${NC}"
    echo -e "${BLUE}================================${NC}"
}

print_step() {
    echo -e "${YELLOW}[STEP]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

# Check if required tools are installed
check_dependencies() {
    print_step "Checking dependencies..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed"
        exit 1
    fi
    
    if ! command -v git &> /dev/null; then
        print_error "Git is not installed"
        exit 1
    fi
    
    print_success "All dependencies are installed"
}

# Install dependencies
install_dependencies() {
    print_step "Installing dependencies..."
    
    if [ -f "package.json" ]; then
        npm install
        print_success "Dependencies installed"
    else
        print_error "package.json not found"
        exit 1
    fi
}

# Build the project
build_project() {
    print_step "Building project..."
    
    # Clean build directory
    if [ -d "$BUILD_DIR" ]; then
        rm -rf "$BUILD_DIR"
    fi
    
    # Create build directory
    mkdir -p "$BUILD_DIR"
    
    # Copy static files
    cp index.html "$BUILD_DIR/"
    cp styles.css "$BUILD_DIR/"
    cp features.js "$BUILD_DIR/"
    cp export.js "$BUILD_DIR/"
    cp advanced-features.js "$BUILD_DIR/"
    cp sw.js "$BUILD_DIR/"
    cp manifest.json "$BUILD_DIR/"
    
    # Copy documentation
    cp README.md "$BUILD_DIR/"
    cp CHANGELOG.md "$BUILD_DIR/"
    cp LICENSE "$BUILD_DIR/"
    
    # Create icons directory if it doesn't exist
    mkdir -p "$BUILD_DIR/icons"
    
    # Copy icons if they exist
    if [ -d "icons" ]; then
        cp -r icons/* "$BUILD_DIR/icons/"
    fi
    
    # Copy screenshots if they exist
    if [ -d "screenshots" ]; then
        mkdir -p "$BUILD_DIR/screenshots"
        cp -r screenshots/* "$BUILD_DIR/screenshots/"
    fi
    
    print_success "Project built successfully"
}

# Run tests
run_tests() {
    print_step "Running tests..."
    
    if [ -f "package.json" ] && grep -q "test" package.json; then
        npm test
        print_success "Tests passed"
    else
        print_info "No tests configured, skipping"
    fi
}

# Lint code
lint_code() {
    print_step "Linting code..."
    
    if [ -f "package.json" ] && grep -q "lint" package.json; then
        npm run lint
        print_success "Linting passed"
    else
        print_info "No linting configured, skipping"
    fi
}

# Deploy to GitHub Pages
deploy_github_pages() {
    print_step "Deploying to GitHub Pages..."
    
    # Check if we're in a git repository
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        print_error "Not in a git repository"
        exit 1
    fi
    
    # Check if gh-pages is installed
    if ! npm list gh-pages &> /dev/null; then
        print_step "Installing gh-pages..."
        npm install --save-dev gh-pages
    fi
    
    # Deploy
    npx gh-pages -d "$BUILD_DIR"
    print_success "Deployed to GitHub Pages"
}

# Deploy to Netlify
deploy_netlify() {
    print_step "Deploying to Netlify..."
    
    # Check if Netlify CLI is installed
    if ! command -v netlify &> /dev/null; then
        print_step "Installing Netlify CLI..."
        npm install -g netlify-cli
    fi
    
    # Deploy
    netlify deploy --dir="$BUILD_DIR" --prod
    print_success "Deployed to Netlify"
}

# Deploy to Vercel
deploy_vercel() {
    print_step "Deploying to Vercel..."
    
    # Check if Vercel CLI is installed
    if ! command -v vercel &> /dev/null; then
        print_step "Installing Vercel CLI..."
        npm install -g vercel
    fi
    
    # Deploy
    vercel --prod
    print_success "Deployed to Vercel"
}

# Create Docker image
create_docker_image() {
    print_step "Creating Docker image..."
    
    # Create Dockerfile if it doesn't exist
    if [ ! -f "Dockerfile" ]; then
        cat > Dockerfile << EOF
FROM nginx:alpine
COPY $BUILD_DIR /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
EOF
        print_info "Created Dockerfile"
    fi
    
    # Build Docker image
    docker build -t "$PROJECT_NAME:$VERSION" .
    print_success "Docker image created: $PROJECT_NAME:$VERSION"
}

# Create release
create_release() {
    print_step "Creating release..."
    
    # Create release directory
    RELEASE_DIR="release-v$VERSION"
    mkdir -p "$RELEASE_DIR"
    
    # Copy built files
    cp -r "$BUILD_DIR"/* "$RELEASE_DIR/"
    
    # Create zip file
    zip -r "${PROJECT_NAME}-v${VERSION}.zip" "$RELEASE_DIR"
    
    # Clean up
    rm -rf "$RELEASE_DIR"
    
    print_success "Release created: ${PROJECT_NAME}-v${VERSION}.zip"
}

# Main deployment function
main() {
    print_header
    
    # Parse command line arguments
    DEPLOY_TARGET=${1:-"github"}
    
    case $DEPLOY_TARGET in
        "github")
            check_dependencies
            install_dependencies
            lint_code
            run_tests
            build_project
            deploy_github_pages
            ;;
        "netlify")
            check_dependencies
            install_dependencies
            lint_code
            run_tests
            build_project
            deploy_netlify
            ;;
        "vercel")
            check_dependencies
            install_dependencies
            lint_code
            run_tests
            build_project
            deploy_vercel
            ;;
        "docker")
            check_dependencies
            install_dependencies
            lint_code
            run_tests
            build_project
            create_docker_image
            ;;
        "release")
            check_dependencies
            install_dependencies
            lint_code
            run_tests
            build_project
            create_release
            ;;
        "build")
            check_dependencies
            install_dependencies
            lint_code
            run_tests
            build_project
            print_success "Build completed successfully"
            ;;
        *)
            print_error "Invalid deployment target: $DEPLOY_TARGET"
            echo "Available targets: github, netlify, vercel, docker, release, build"
            exit 1
            ;;
    esac
    
    print_success "Deployment completed successfully!"
}

# Run main function with all arguments
main "$@" 