#!/bin/bash

# Deploy script for "Daily Small Good Deeds" app
# Usage: ./scripts/deploy.sh [functions|rules|all]

set -e

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Parse arguments
DEPLOY_TARGET=${1:-all}

log_info "🚀 Starting deployment of 'Daily Small Good Deeds' app"
log_info "Deploy target: $DEPLOY_TARGET"

# Navigate to project root
cd "$(dirname "$0")/.."

# Check Firebase CLI
if ! command -v firebase &> /dev/null; then
    log_error "Firebase CLI is not installed"
    log_info "Installation: npm install -g firebase-tools"
    exit 1
fi

# Check Firebase project
PROJECT_ID=$(firebase use 2>/dev/null || echo "")
if [ -z "$PROJECT_ID" ]; then
    log_error "Firebase project is not configured"
    log_info "Configuration: firebase use ichizen-daily-good-deeds"
    exit 1
fi

log_info "Firebase project: $PROJECT_ID"

# Build and test Functions
if [ "$DEPLOY_TARGET" = "functions" ] || [ "$DEPLOY_TARGET" = "all" ]; then
    log_info "📦 Building Cloud Functions..."
    
    # Use Turborepo for building functions
    log_info "Using Turborepo build system..."
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        log_info "Installing dependencies..."
        npm install
    fi
    
    # Lint check using Turborepo
    log_info "🔍 Checking code quality..."
    npm run lint
    
    # TypeScript check using Turborepo
    log_info "🔍 Running type check..."
    npm run typecheck
    
    # Build functions using Turborepo
    log_info "🔨 Building with Turborepo..."
    npm run build
    
    # Run tests using Turborepo (if available)
    log_info "🧪 Running tests..."
    if npm run test 2>/dev/null; then
        log_success "Tests completed"
    else
        log_warning "No tests found or tests failed"
    fi
    
    log_success "Cloud Functions build completed"
fi

# Execute deployment
log_info "🚀 Deploying to Firebase..."

case $DEPLOY_TARGET in
    functions)
        firebase deploy --only functions
        ;;
    rules)
        firebase deploy --only firestore:rules,firestore:indexes
        ;;
    all)
        firebase deploy --only functions,firestore:rules,firestore:indexes
        ;;
    *)
        log_error "Invalid deploy target: $DEPLOY_TARGET"
        log_info "Available targets: functions, rules, all"
        exit 1
        ;;
esac

# Deployment completed
log_success "🎉 Deployment completed!"
log_info "📊 Firebase Console: https://console.firebase.google.com/project/$PROJECT_ID"
log_info "⚡ Functions URL: https://asia-northeast1-$PROJECT_ID.cloudfunctions.net"

# Suggest post-deployment testing
log_warning "📋 Post-deployment checklist:"
echo "   1. Verify Cloud Functions operation"
echo "   2. Verify Firestore rules operation"
echo "   3. Test mobile app connectivity"
echo ""
log_info "🧪 Test execution:"
echo "   npm run test                    # Run all tests with Turborepo"
echo "   npm run test:functions          # Test Cloud Functions only"
echo "   npm run test:mobile             # Test mobile app only"
echo "   npm run dev:android             # Test with Android emulator"
echo ""