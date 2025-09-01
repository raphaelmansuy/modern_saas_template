#!/bin/bash

# Database Deployment Script
# This script ensures schema and seed data are properly deployed
# Can be used in development, staging, or production environments

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if DATABASE_URL is set
check_database_url() {
    if [ -z "$DATABASE_URL" ]; then
        log_error "DATABASE_URL environment variable is not set"
        exit 1
    fi
    log_info "Database URL is configured"
}

# Wait for database to be ready
wait_for_database() {
    log_info "Waiting for database to be ready..."

    local max_attempts=30
    local attempt=1

    while [ $attempt -le $max_attempts ]; do
        if pg_isready "$DATABASE_URL" >/dev/null 2>&1; then
            log_success "Database is ready!"
            return 0
        fi

        log_info "Attempt $attempt/$max_attempts - Database not ready yet..."
        sleep 2
        ((attempt++))
    done

    log_error "Database failed to become ready after $max_attempts attempts"
    exit 1
}

# Run database migrations
run_migrations() {
    log_info "Running database migrations..."

    if cd packages/db && bun run migrate; then
        log_success "Migrations completed successfully"
    else
        log_error "Migration failed"
        exit 1
    fi
}

# Run database seeding
run_seeding() {
    log_info "Running database seeding..."

    if cd packages/db && bun run seed; then
        log_success "Seeding completed successfully"
    else
        log_error "Seeding failed"
        exit 1
    fi
}

# Validate database state
validate_database() {
    log_info "Validating database state..."

    # Check if required tables exist
    local required_tables=("users" "products" "orders" "subscriptions")
    local missing_tables=()

    for table in "${required_tables[@]}"; do
        if ! psql "$DATABASE_URL" -c "SELECT 1 FROM $table LIMIT 1;" >/dev/null 2>&1; then
            missing_tables+=("$table")
        fi
    done

    if [ ${#missing_tables[@]} -gt 0 ]; then
        log_error "Missing required tables: ${missing_tables[*]}"
        exit 1
    fi

    log_success "All required tables exist"

    # Check if seed data exists
    local product_count
    product_count=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM products;" | tr -d ' ')

    if [ "$product_count" -eq 0 ]; then
        log_warning "No products found in database. Consider running seeding."
    else
        log_success "Found $product_count products in database"
    fi
}

# Main deployment function
deploy_database() {
    log_info "Starting database deployment..."

    check_database_url
    wait_for_database
    run_migrations
    run_seeding
    validate_database

    log_success "Database deployment completed successfully! 🎉"
}

# Handle command line arguments
case "${1:-deploy}" in
    "deploy")
        deploy_database
        ;;
    "migrate")
        check_database_url
        wait_for_database
        run_migrations
        ;;
    "seed")
        check_database_url
        wait_for_database
        run_seeding
        ;;
    "validate")
        check_database_url
        wait_for_database
        validate_database
        ;;
    "reset")
        log_warning "Resetting database..."
        # This would typically be done via docker-compose or direct SQL
        log_info "Please run: docker-compose down -v && docker-compose up -d db"
        log_info "Then run this script again to redeploy"
        ;;
    *)
        echo "Usage: $0 [deploy|migrate|seed|validate|reset]"
        echo ""
        echo "Commands:"
        echo "  deploy   - Full deployment (migrate + seed + validate)"
        echo "  migrate  - Run migrations only"
        echo "  seed     - Run seeding only"
        echo "  validate - Validate database state"
        echo "  reset    - Show instructions for database reset"
        exit 1
        ;;
esac
