# Deployment Guide

This guide covers various deployment options for the Modern SaaS Template, from development to production environments.

## Table of Contents

1. [Overview](#overview)
2. [Environment Configuration](#environment-configuration)
3. [Vercel Deployment (Recommended)](#vercel-deployment-recommended)
4. [Docker Deployment](#docker-deployment)
5. [Manual Deployment](#manual-deployment)
6. [Database Deployment](#database-deployment)
7. [Environment Variables](#environment-variables)
8. [SSL/TLS Configuration](#ssltls-configuration)
9. [Monitoring Setup](#monitoring-setup)
10. [Troubleshooting](#troubleshooting)

## Overview

The Modern SaaS Template supports multiple deployment strategies:

- **Vercel (Recommended)**: Optimal for Next.js applications with serverless functions
- **Docker**: Containerized deployment for any cloud provider
- **Manual**: Traditional server deployment with PM2 or similar process managers

### Deployment Architecture

```
┌─────────────────────────────────────────────────────────┐
│                Production Environment                    │
├─────────────────────────────────────────────────────────┤
│  Frontend (Vercel)   │  API (Serverless)  │  Database   │
│  ├─ Static Assets    │  ├─ API Functions  │  (Managed)  │
│  ├─ SSR Pages        │  ├─ Webhooks       │  PostgreSQL │
│  └─ Edge Functions   │  └─ Background     │             │
│                      │     Jobs           │             │
└─────────────────────────────────────────────────────────┘
```

## Environment Configuration

### Development Environment
```bash
# Development URLs
FRONTEND_URL=http://localhost:3000
API_URL=http://localhost:3001
DATABASE_URL=postgresql://user:password@db:5432/saas_db
```

### Production Environment
```bash
# Production URLs
FRONTEND_URL=https://your-domain.com
API_URL=https://your-domain.com/api
DATABASE_URL=postgresql://user:password@prod-db:5432/saas_db
```

## Vercel Deployment (Recommended)

Vercel provides the best deployment experience for Next.js applications with built-in support for serverless functions.

### Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Code must be in a GitHub repository
3. **Database**: Managed PostgreSQL database (Vercel Postgres, Supabase, etc.)

### Step 1: Prepare Repository

Ensure your repository has the correct structure:

```
project-root/
├── apps/
│   ├── web/          # Next.js frontend
│   └── api/          # Hono.js API (for serverless functions)
├── packages/
│   └── db/           # Database package
├── package.json      # Root package.json
├── turbo.json        # Turbo configuration
└── vercel.json       # Vercel configuration
```

### Step 2: Create Vercel Configuration

Create `vercel.json` in the project root:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "apps/web/package.json",
      "use": "@vercel/next"
    },
    {
      "src": "apps/api/src/index.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "apps/api/src/index.ts"
    },
    {
      "src": "/(.*)",
      "dest": "apps/web/$1"
    }
  ],
  "env": {
    "DATABASE_URL": "@database_url",
    "CLERK_SECRET_KEY": "@clerk_secret_key",
    "STRIPE_SECRET_KEY": "@stripe_secret_key",
    "STRIPE_WEBHOOK_SECRET": "@stripe_webhook_secret"
  }
}
```

### Step 3: Deploy to Vercel

#### Option A: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Set production environment variables
vercel env add DATABASE_URL production
vercel env add CLERK_SECRET_KEY production
vercel env add STRIPE_SECRET_KEY production
```

#### Option B: GitHub Integration

1. Visit [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Configure build settings:
   - **Framework Preset**: Next.js
   - **Root Directory**: `apps/web`
   - **Build Command**: `cd ../.. && npm run build`
   - **Output Directory**: `apps/web/.next`

### Step 4: Configure Environment Variables

In Vercel Dashboard > Project Settings > Environment Variables:

```bash
# Database
DATABASE_URL=postgresql://...

# Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Payments
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email
RESEND_API_KEY=re_...

# Monitoring
SENTRY_DSN=https://...
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# API Configuration
API_URL=https://your-domain.com/api
NEXT_PUBLIC_API_URL=https://your-domain.com/api
CORS_ORIGINS=https://your-domain.com
```

### Step 5: Configure Custom Domain

1. Go to Project Settings > Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Vercel will automatically provision SSL certificates

## Docker Deployment

Docker deployment provides flexibility for any cloud provider or on-premise deployment.

### Production Docker Setup

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  web:
    build:
      context: .
      dockerfile: ./apps/web/Dockerfile.prod
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
      - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=${NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      - CLERK_SECRET_KEY=${CLERK_SECRET_KEY}
    depends_on:
      - api
    restart: unless-stopped

  api:
    build:
      context: .
      dockerfile: ./apps/api/Dockerfile.prod
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - CLERK_SECRET_KEY=${CLERK_SECRET_KEY}
      - STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}
      - STRIPE_WEBHOOK_SECRET=${STRIPE_WEBHOOK_SECRET}
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=${POSTGRES_DB}
      - POSTGRES_USER=${POSTGRES_USER}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./db-init:/docker-entrypoint-initdb.d
    ports:
      - "5432:5432"
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - web
      - api
    restart: unless-stopped

volumes:
  postgres_data:
```

### Production Dockerfiles

#### Frontend Dockerfile (`apps/web/Dockerfile.prod`)

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
COPY apps/web/package.json ./apps/web/
COPY packages/db/package.json ./packages/db/
RUN npm ci --only=production

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "apps/web/server.js"]
```

#### API Dockerfile (`apps/api/Dockerfile.prod`)

```dockerfile
FROM node:18-alpine AS base

# Install dependencies
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
COPY apps/api/package.json ./apps/api/
COPY packages/db/package.json ./packages/db/
RUN npm ci --only=production

# Build the application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 api
RUN adduser --system --uid 1001 api

COPY --from=builder --chown=api:api /app/apps/api/dist ./dist
COPY --from=builder --chown=api:api /app/node_modules ./node_modules
COPY --from=builder --chown=api:api /app/packages ./packages

USER api

EXPOSE 3001

CMD ["node", "dist/index.js"]
```

### Nginx Configuration

Create `nginx.conf`:

```nginx
events {
    worker_connections 1024;
}

http {
    upstream frontend {
        server web:3000;
    }

    upstream api {
        server api:3001;
    }

    server {
        listen 80;
        server_name your-domain.com;
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name your-domain.com;

        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;

        # Frontend routes
        location / {
            proxy_pass http://frontend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }

        # API routes
        location /api/ {
            proxy_pass http://api/api/;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Health check
        location /health {
            proxy_pass http://api/health;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
        }
    }
}
```

### Deployment Commands

```bash
# Create production environment file
cp .env.example .env.prod

# Edit production environment variables
nano .env.prod

# Deploy with Docker Compose
docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Update deployment
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d
```

## Manual Deployment

For traditional server deployment using a VPS or dedicated server.

### Prerequisites

1. **Server**: Ubuntu 20.04+ or similar Linux distribution
2. **Node.js**: Version 18 or higher
3. **PostgreSQL**: Version 13 or higher
4. **Nginx**: For reverse proxy and SSL termination
5. **PM2**: For process management

### Step 1: Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Install Nginx
sudo apt install nginx -y

# Install PM2
sudo npm install -g pm2
```

### Step 2: Database Setup

```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE saas_prod;
CREATE USER saas_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE saas_prod TO saas_user;
\q
```

### Step 3: Application Deployment

```bash
# Clone repository
git clone https://github.com/your-repo/modern-saas-template.git
cd modern-saas-template

# Install dependencies
npm install

# Build application
npm run build

# Create production environment file
cp .env.example .env.production
```

### Step 4: PM2 Configuration

Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [
    {
      name: 'saas-frontend',
      script: 'npm',
      args: 'start',
      cwd: './apps/web',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    },
    {
      name: 'saas-api',
      script: 'npm',
      args: 'start',
      cwd: './apps/api',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      }
    }
  ]
};
```

### Step 5: Start Applications

```bash
# Start applications with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 startup script
pm2 startup
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $USER --hp $HOME
```

### Step 6: Nginx Configuration

Create `/etc/nginx/sites-available/saas`:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /api/ {
        proxy_pass http://localhost:3001/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/saas /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## Database Deployment

### Managed Database Options

#### Vercel Postgres
```bash
# Install Vercel CLI
npm i -g vercel

# Create database
vercel postgres create

# Get connection string
vercel postgres connect
```

#### Supabase
```bash
# Create project at https://supabase.com
# Get connection string from project settings
DATABASE_URL="postgresql://postgres:[password]@[host]:5432/postgres"
```

#### AWS RDS
```bash
# Create RDS instance
aws rds create-db-instance \
    --db-instance-identifier saas-prod \
    --db-instance-class db.t3.micro \
    --engine postgres \
    --master-username saasuser \
    --master-user-password SecurePassword123 \
    --allocated-storage 20
```

### Database Migration

```bash
# Run migrations
cd packages/db
npm run push

# Seed production data
npm run seed
```

## Environment Variables

### Required Variables

```bash
# Database
DATABASE_URL=postgresql://user:password@host:port/database

# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Payments (Stripe)
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email (Resend)
RESEND_API_KEY=re_...

# Monitoring
SENTRY_DSN=https://...
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# API Configuration
API_URL=https://your-domain.com/api
NEXT_PUBLIC_API_URL=https://your-domain.com/api
CORS_ORIGINS=https://your-domain.com
```

### Environment-Specific Variables

#### Development
```bash
DATABASE_URL=postgresql://user:password@localhost:5432/saas_dev
API_URL=http://localhost:3001
NEXT_PUBLIC_API_URL=http://localhost:3001
CORS_ORIGINS=http://localhost:3000
```

#### Production
```bash
DATABASE_URL=postgresql://user:password@prod-host:5432/saas_prod
API_URL=https://your-domain.com/api
NEXT_PUBLIC_API_URL=https://your-domain.com/api
CORS_ORIGINS=https://your-domain.com
```

## SSL/TLS Configuration

### Let's Encrypt (Free SSL)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Custom SSL Certificate

```bash
# Copy certificates
sudo cp your-cert.pem /etc/ssl/certs/
sudo cp your-key.pem /etc/ssl/private/

# Set permissions
sudo chmod 644 /etc/ssl/certs/your-cert.pem
sudo chmod 600 /etc/ssl/private/your-key.pem
```

## Monitoring Setup

### Application Monitoring

```bash
# PM2 Monitoring
pm2 install pm2-server-monit

# System monitoring
sudo apt install htop iotop nethogs -y
```

### Log Management

```bash
# Configure log rotation
sudo nano /etc/logrotate.d/saas

# Content:
/var/log/saas/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 saas saas
}
```

## Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Find process using port
sudo lsof -i :3000
sudo lsof -i :3001

# Kill process
sudo kill -9 <PID>
```

#### Database Connection Issues
```bash
# Test database connection
psql -h localhost -U saas_user -d saas_prod

# Check PostgreSQL status
sudo systemctl status postgresql
sudo systemctl restart postgresql
```

#### Nginx Configuration Issues
```bash
# Test configuration
sudo nginx -t

# Check logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

#### SSL Certificate Issues
```bash
# Check certificate expiry
openssl x509 -in /etc/letsencrypt/live/your-domain.com/cert.pem -text -noout

# Renew certificate
sudo certbot renew --dry-run
```

### Health Checks

#### Application Health
```bash
# Check API health
curl https://your-domain.com/health

# Check frontend
curl https://your-domain.com

# Check PM2 status
pm2 status
pm2 logs
```

#### System Health
```bash
# Check disk space
df -h

# Check memory usage
free -h

# Check CPU usage
top
```

### Backup and Recovery

#### Database Backup
```bash
# Create backup
pg_dump -h localhost -U saas_user saas_prod > backup_$(date +%Y%m%d).sql

# Restore from backup
psql -h localhost -U saas_user saas_prod < backup_20240101.sql
```

#### Application Backup
```bash
# Backup application files
tar -czf app_backup_$(date +%Y%m%d).tar.gz /path/to/app

# Backup environment files
cp .env.production .env.backup
```

This deployment guide covers the most common deployment scenarios for the Modern SaaS Template. Choose the option that best fits your infrastructure requirements and technical expertise.