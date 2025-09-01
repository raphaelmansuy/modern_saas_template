# Database Schema and Seed Deployment Guide

This guide explains how to ensure your database schema and seed data are properly deployed when rebuilding databases in different environments.

## Quick Start

### Development Setup

```bash
# Start Docker environment (includes database)
make dev

# Or manually:
docker-compose up -d db
make db-setup
```

### Database Management

```bash
# Full setup (migrations + seeding)
make db-setup

# Individual operations
make db-migrate          # Run migrations only
make db-seed            # Run seeding only
make db-generate        # Generate new migrations
make db-push           # Push schema directly (development)
make db-studio         # Open Drizzle Studio UI (runs on https://local.drizzle.studio)
make db-reset          # Reset database (removes all data)
```

## Drizzle Studio

**Important**: Drizzle Studio runs on `https://local.drizzle.studio` (not localhost) for security and accessibility reasons.

To open Drizzle Studio:

```bash
make db-studio
```

Or manually:

```bash
cd packages/db && DATABASE_URL="postgresql://user:password@db:5432/saas_db" bun run studio
```

The studio will open in your default browser at `https://local.drizzle.studio` where you can:

- View your database schema
- Browse and edit data
- Run SQL queries
- Manage migrations

## Environment Variables

Required environment variables:

```bash
# Database connection (Docker)
DATABASE_URL="postgresql://user:password@db:5432/saas_db"

# Database connection (Local)
DATABASE_URL="postgresql://user:password@localhost:5432/saas_db"
```

## Troubleshooting

### Drizzle Studio Issues

1. **"Driver param required" error**
   - Update `drizzle.config.ts` to use `driver: 'pg'` instead of `dialect: 'postgresql'`

2. **"Connection string required" error**
   - Ensure `DATABASE_URL` environment variable is set
   - For Docker: `postgresql://user:password@db:5432/saas_db`
   - For local: `postgresql://user:password@localhost:5432/saas_db`

3. **Studio not loading**
   - Check that the database is running: `docker-compose ps`
   - Verify database connectivity: `docker-compose exec db pg_isready -U user -d saas_db`

### Database Connection Issues

```bash
# Check database status
docker-compose ps

# View database logs
docker-compose logs db

# Test connection
docker-compose exec db psql -U user -d saas_db -c "SELECT version();"
```

## Migration Workflow

### Schema Changes

1. Modify `packages/db/schema.ts`
2. Generate migrations: `make db-generate`
3. Review generated files in `packages/db/drizzle/`
4. Apply migrations: `make db-migrate`

### Seed Data Changes

1. Modify `packages/db/seed.ts`
2. Run seeding: `make db-seed`

## Production Deployment

For production deployments, use the deployment script:

```bash
# Full deployment
./deploy-db.sh deploy

# Individual steps
./deploy-db.sh migrate
./deploy-db.sh seed
./deploy-db.sh validate
```

This deployment system ensures your database is always in a consistent, migratable state across all environments.
