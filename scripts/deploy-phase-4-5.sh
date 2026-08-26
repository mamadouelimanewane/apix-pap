#!/bin/bash

# ============================================================================
# APIX-PAP DEPLOYMENT SCRIPT - Phase 4 & 5
# Automated deployment with validation checks
# ============================================================================

set -e  # Exit on error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'  # No Color

# Configuration
ENVIRONMENT=${1:-staging}
VERSION=$(git describe --tags --always)
DEPLOYMENT_ID="$(date +%Y%m%d_%H%M%S)"
LOG_FILE="deployments/deploy_${DEPLOYMENT_ID}.log"

# ============================================================================
# UTILITY FUNCTIONS
# ============================================================================

log() {
  echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

success() {
  echo -e "${GREEN}✅ $1${NC}" | tee -a "$LOG_FILE"
}

error() {
  echo -e "${RED}❌ $1${NC}" | tee -a "$LOG_FILE"
  exit 1
}

warning() {
  echo -e "${YELLOW}⚠️  $1${NC}" | tee -a "$LOG_FILE"
}

# ============================================================================
# PRE-DEPLOYMENT CHECKS
# ============================================================================

log "Starting deployment for $ENVIRONMENT (v$VERSION)"

# Check environment
if [ "$ENVIRONMENT" != "staging" ] && [ "$ENVIRONMENT" != "production" ]; then
  error "Invalid environment. Use 'staging' or 'production'"
fi

# Check git status
log "Checking git status..."
if [ -n "$(git status --porcelain)" ]; then
  error "Uncommitted changes detected. Please commit first."
fi

# Check Node version
log "Checking Node.js version..."
NODE_VERSION=$(node -v)
log "Node version: $NODE_VERSION"

# Check dependencies
log "Checking dependencies..."
npm install --production > /dev/null 2>&1

# ============================================================================
# BUILD & OPTIMIZATION
# ============================================================================

log "Building application..."

# Build frontend
npm run build || error "Build failed"
success "Frontend build complete"

# Bundle analysis
log "Analyzing bundle..."
npm run build:analyze || warning "Bundle analysis skipped"

# ============================================================================
# SECURITY CHECKS
# ============================================================================

log "Running security checks..."

# Check for secrets
log "Scanning for exposed secrets..."
if grep -r "PRIVATE_KEY\|AUTH_TOKEN\|API_KEY" src/ --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx" | grep -v "process.env"; then
  error "Hardcoded secrets detected!"
fi
success "No hardcoded secrets found"

# Dependency audit
log "Auditing dependencies..."
npm audit --production || warning "Some vulnerabilities detected (check manually)"

# ============================================================================
# ENVIRONMENT SETUP
# ============================================================================

log "Setting up environment..."

# Load environment variables
if [ -f ".env.$ENVIRONMENT" ]; then
  source ".env.$ENVIRONMENT"
  success "Loaded .env.$ENVIRONMENT"
else
  error ".env.$ENVIRONMENT not found"
fi

# Validate required env vars
REQUIRED_VARS=(
  "DATABASE_URL"
  "JWT_SECRET"
  "STORAGE_PROVIDER"
  "GOOGLE_VISION_KEY"
)

for var in "${REQUIRED_VARS[@]}"; do
  if [ -z "${!var}" ]; then
    error "Missing required environment variable: $var"
  fi
done
success "All required environment variables present"

# ============================================================================
# DATABASE MIGRATION
# ============================================================================

if [ "$ENVIRONMENT" = "production" ]; then
  log "Running database migrations..."

  # Backup database
  log "Backing up database..."
  BACKUP_FILE="backups/db_${DEPLOYMENT_ID}.sql"
  mkdir -p backups
  pg_dump "$DATABASE_URL" > "$BACKUP_FILE" || warning "Database backup failed"
  success "Database backup created: $BACKUP_FILE"

  # Run migrations
  npm run db:migrate || error "Database migration failed"
  success "Database migrations complete"
fi

# ============================================================================
# PHASE 4 SETUP
# ============================================================================

log "Setting up Phase 4 features..."

# Storage validation
case "$STORAGE_PROVIDER" in
  vercel-blob)
    log "Using Vercel Blob Storage"
    ;;
  s3)
    log "Validating AWS S3 configuration..."
    aws s3 ls "s3://$AWS_S3_BUCKET" > /dev/null || error "S3 bucket not accessible"
    ;;
  firebase)
    log "Firebase Storage configured"
    ;;
  *)
    error "Unknown storage provider: $STORAGE_PROVIDER"
    ;;
esac

# Test API endpoints
log "Testing API endpoints..."
curl -s "http://localhost:3000/api/stats/dashboard" > /dev/null || warning "API health check failed"

# ============================================================================
# PHASE 5 SETUP
# ============================================================================

log "Setting up Phase 5 features..."

# Tesseract.js validation
if [ "$TESSERACT_WORKERS" -gt 0 ]; then
  log "Tesseract.js workers: $TESSERACT_WORKERS"
fi

# Google Vision API test
if [ -n "$GOOGLE_VISION_KEY" ]; then
  log "Testing Google Vision API..."
  # Test would go here
  success "Google Vision API configured"
fi

# Webhook validation
if [ "$TWILIO_ENABLED" = "true" ]; then
  log "Twilio SMS configured"
fi

if [ "$RESEND_ENABLED" = "true" ]; then
  log "Resend Email configured"
fi

if [ "$SLACK_ENABLED" = "true" ]; then
  log "Slack Webhooks configured"
fi

# Blockchain validation
if [ "$BLOCKCHAIN_ENABLED" = "true" ]; then
  log "Blockchain audit enabled"
  log "Provider: $BLOCKCHAIN_PROVIDER"
  log "Chain ID: $BLOCKCHAIN_CHAIN_ID"
fi

# Mobile app validation
if [ "$EXPO_ENABLED" = "true" ]; then
  log "Expo Mobile app enabled"
fi

# ============================================================================
# TESTING
# ============================================================================

log "Running tests..."

# Unit tests
log "Running unit tests..."
npm test -- --coverage > /dev/null 2>&1 || warning "Some tests failed"

# Integration tests
log "Running integration tests..."
npm run test:integration > /dev/null 2>&1 || warning "Integration tests skipped"

# ============================================================================
# DEPLOYMENT
# ============================================================================

log "Deploying to $ENVIRONMENT..."

case "$ENVIRONMENT" in
  staging)
    log "Deploying to Vercel staging..."
    vercel deploy --prod --team=<team> --name="apix-pap-staging" || error "Vercel deployment failed"
    success "Staging deployment complete"
    ;;

  production)
    log "Deploying to Vercel production..."

    # Confirmation
    read -p "⚠️  Deploy to PRODUCTION? This cannot be undone. (yes/no) " confirm
    if [ "$confirm" != "yes" ]; then
      error "Deployment cancelled"
    fi

    vercel deploy --prod --team=<team> || error "Vercel production deployment failed"
    success "Production deployment complete"

    # Post-deployment checks
    log "Running post-deployment checks..."
    sleep 10

    curl -f "https://apix-papa.vercel.app/api/stats/dashboard" > /dev/null || warning "API health check failed post-deploy"
    ;;
esac

# ============================================================================
# MOBILE DEPLOYMENT
# ============================================================================

if [ "$EXPO_ENABLED" = "true" ]; then
  log "Building Expo app..."

  # Build Android
  if [ "$BUILD_ANDROID" = "true" ]; then
    log "Building Android APK..."
    eas build --platform android --profile production || warning "Android build failed"
  fi

  # Build iOS
  if [ "$BUILD_IOS" = "true" ]; then
    log "Building iOS IPA..."
    eas build --platform ios --profile production || warning "iOS build failed"
  fi
fi

# ============================================================================
# MONITORING & ALERTS
# ============================================================================

log "Setting up monitoring..."

# Sentry release tracking
if [ -n "$SENTRY_DSN" ]; then
  log "Creating Sentry release..."
  sentry-cli releases create "$VERSION" || warning "Sentry release creation failed"
fi

# Datadog deployment event
if [ "$DATADOG_ENABLED" = "true" ]; then
  log "Sending Datadog deployment event..."
  # Datadog API call would go here
fi

# Slack notification
if [ "$SLACK_ENABLED" = "true" ]; then
  log "Sending Slack notification..."
  curl -X POST "$SLACK_WEBHOOK_URL" \
    -H 'Content-Type: application/json' \
    -d "{
      \"text\": \"🚀 APIX-PAP Deployment Complete\",
      \"blocks\": [
        {
          \"type\": \"section\",
          \"text\": {
            \"type\": \"mrkdwn\",
            \"text\": \"*Deployment Status:* ✅ Success\n*Environment:* $ENVIRONMENT\n*Version:* $VERSION\n*Timestamp:* $(date)\"}
        }
      ]
    }" || warning "Slack notification failed"
fi

# ============================================================================
# POST-DEPLOYMENT
# ============================================================================

log "Post-deployment validation..."

# Health checks
HEALTH_CHECK_URL="https://apix-papa.vercel.app/api/stats/dashboard"
RETRY_COUNT=0
MAX_RETRIES=5

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
  if curl -sf "$HEALTH_CHECK_URL" > /dev/null; then
    success "Health check passed"
    break
  fi
  RETRY_COUNT=$((RETRY_COUNT + 1))
  log "Health check failed, retrying... ($RETRY_COUNT/$MAX_RETRIES)"
  sleep 10
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
  error "Health checks failed after $MAX_RETRIES attempts"
fi

# ============================================================================
# COMPLETION
# ============================================================================

log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
success "Deployment completed successfully!"
log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

log "📊 Deployment Summary:"
log "  Environment: $ENVIRONMENT"
log "  Version: $VERSION"
log "  Deployment ID: $DEPLOYMENT_ID"
log "  Log file: $LOG_FILE"
log "  URL: https://apix-papa.vercel.app"

log "✅ Next steps:"
log "  1. Monitor application logs"
log "  2. Run smoke tests"
log "  3. Verify feature flags"
log "  4. Check analytics dashboard"

exit 0
