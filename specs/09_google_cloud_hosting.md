# Google Cloud Hosting Strategy for SaaS Starter Kit

## Executive Summary

This report analyzes the optimal Google Cloud hosting strategy for the monorepo SaaS starter kit, consisting of a Next.js 15 frontend, Hono.js API backend, and PostgreSQL database. The recommended architecture leverages Cloud Run for serverless container deployment and Cloud SQL for managed PostgreSQL hosting, providing excellent scalability, cost efficiency, and operational simplicity.

**Key Findings:**
- **Monthly Cost Range**: $15-100 depending on traffic and resource allocation
- **Recommended Setup**: Cloud Run + Cloud SQL PostgreSQL (shared core)
- **Scalability**: Automatic scaling from zero to thousands of instances
- **Operational Overhead**: Minimal with fully managed services

## Architecture Overview

### Current Application Structure
- **Frontend**: Next.js 15 with App Router (apps/web/) using Bun
- **Backend**: Hono.js API server (apps/api/) using Bun
- **Database**: PostgreSQL with Drizzle ORM (packages/db/)
- **Package Manager**: Bun for fast dependency management and builds
- **External Services**: Clerk (auth), Stripe (payments), Email Service (SendGrid/Mailgun/Resend), Sentry (monitoring), PostHog (analytics)

### Next.js 15 and Bun Considerations

**Next.js 15 Benefits for Cloud Run:**
- **Improved Performance**: Better caching and optimization features
- **Enhanced App Router**: More robust server components and streaming
- **Turbopack Integration**: Faster development builds (though Docker uses production builds)
- **React 18+ Features**: Full support for concurrent features and Suspense

**Bun Advantages:**
- **Faster Installs**: 3-5x faster than npm for dependency installation
- **Native TypeScript**: Built-in TypeScript execution without transpilation
- **Better DX**: Improved development experience with faster cold starts
- **Docker Compatibility**: Works seamlessly in containerized environments

**Deployment Optimizations:**
- Use multi-stage Docker builds to leverage Bun's speed during build time
- Configure proper Node.js runtime in Cloud Run (Bun transpiles to Node.js)
- Take advantage of Next.js 15's improved static generation for better performance

### Recommended Google Cloud Architecture

```mermaid
graph TB
    %% External Users
    User[👥 Users] --> CLB[🌐 Cloud Load Balancing]
    
    %% Frontend Layer
    CLB --> CRWeb[🚀 Cloud Run<br/>Frontend<br/>Next.js 15]
    
    %% API Layer
    CLB --> CRAPI1[🚀 Cloud Run<br/>API Service 1<br/>Hono.js]
    CLB --> CRAPI2[🚀 Cloud Run<br/>API Service 2<br/>Hono.js]
    
    %% Database Layer
    CRAPI1 --> CloudSQL[(🗄️ Cloud SQL<br/>PostgreSQL<br/>Private IP)]
    CRAPI2 --> CloudSQL
    
    %% External Services
    CRAPI1 --> Clerk[🔐 Clerk<br/>Authentication]
    CRAPI2 --> Stripe[💳 Stripe<br/>Payments]
    CRAPI1 --> Email[📧 Email Service<br/>SendGrid/Mailgun/Resend]
    CRAPI2 --> Sentry[📊 Sentry<br/>Monitoring]
    CRAPI1 --> PostHog[📈 PostHog<br/>Analytics]
    
    %% Networking
    CRWeb -.->|Internal| CRAPI1
    CRWeb -.->|Internal| CRAPI2
    CRAPI1 -.->|VPC| CloudSQL
    CRAPI2 -.->|VPC| CloudSQL
    
    %% Styling
    classDef frontend fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef api fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
    classDef database fill:#e8f5e8,stroke:#1b5e20,stroke-width:2px
    classDef external fill:#fff3e0,stroke:#e65100,stroke-width:2px
    classDef network fill:#fafafa,stroke:#424242,stroke-width:1px
    
    class CRWeb frontend
    class CRAPI1,CRAPI2 api
    class CloudSQL database
    class Clerk,Stripe,Email,Sentry,PostHog external
    class CLB network
```

**Architecture Components:**
- **Cloud Load Balancing**: Global load balancer for distributing traffic
- **Cloud Run (Frontend)**: Serverless container for Next.js application
- **Cloud Run (API)**: Serverless containers for Hono.js API services
- **Cloud SQL**: Managed PostgreSQL database with private IP connectivity
- **VPC Network**: Private network for secure service communication
- **External Services**: Third-party integrations for auth, payments, email, monitoring, and analytics

## Email Service Alternatives

For detailed analysis of email service alternatives to Resend, including cost comparisons and migration strategies, see the dedicated document: **[10_mail_alternative.md](10_mail_alternative.md)**

This analysis covers:

- SendGrid (Google's primary email service with native GCP integration)
- Mailgun (Google Cloud compatible alternative)
- Gmail API (limited option for low-volume use)
- Cost comparisons across different email volumes
- Migration strategies and implementation considerations

## Monitoring Service Alternatives

For detailed analysis of monitoring service alternatives to Sentry, including cost comparisons and migration strategies, see the dedicated document: **[11_sentry_alternative.md](11_sentry_alternative.md)**

This analysis covers:

- Google Cloud Monitoring (native GCP monitoring platform)
- Cloud Error Reporting (automatic error grouping and analysis)
- Cloud Trace (distributed tracing for performance monitoring)
- Cloud Logging (centralized log management)
- Cost comparisons showing 96% potential savings vs Sentry Business plan
- Migration strategies and implementation code for Next.js/Hono.js integration

### Service Configuration

#### Cloud Run Services

- **Frontend Service**: Next.js application with static asset serving
- **API Service**: Hono.js API with database connectivity
- **Networking**: Shared VPC for internal service communication
- **Scaling**: 0-100 instances (configurable)

#### Cloud SQL PostgreSQL

- **Instance Type**: db-f1-micro (shared core) for cost optimization
- **Storage**: 10GB SSD (expandable)
- **Connectivity**: Private IP through VPC
- **High Availability**: Optional (doubles cost)

## Cost Analysis

### Pricing Breakdown (us-central1 region)

#### Cloud Run Pricing

**Instance-based billing (recommended for cost control):**

- CPU: $0.000018 per vCPU-second
- Memory: $0.000002 per GiB-second
- Free tier: 240,000 vCPU-seconds + 450,000 GiB-seconds per month

**Request-based billing (for high-throughput apps):**

- CPU: $0.000024 per vCPU-second (active time)
- Memory: $0.0000025 per GiB-second
- Requests: $0.40 per million requests

#### Cloud SQL PostgreSQL Pricing

**Enterprise Edition (cheapest option):**

- db-f1-micro instance: $0.0105/hour ($7.56/month)
- Storage (10GB): $0.17/month
- Backup storage: $0.08/month
- **Total**: ~$8/month

### Monthly Cost Scenarios

#### Scenario 1: Low Traffic (100 daily active users)

- **Cloud Run Frontend**: $2-5/month (free tier covers most usage)
- **Cloud Run API**: $3-8/month
- **Cloud SQL**: $8/month
- **Network Egress**: $1-3/month
- **Total**: **$14-24/month**

#### Scenario 2: Moderate Traffic (1,000 daily active users)

- **Cloud Run Frontend**: $8-15/month
- **Cloud Run API**: $12-25/month
- **Cloud SQL**: $8/month (upgrade to db-g1-small: +$25/month)
- **Network Egress**: $5-10/month
- **Total**: **$33-58/month**

#### Scenario 3: High Traffic (10,000 daily active users)

- **Cloud Run Frontend**: $50-100/month
- **Cloud Run API**: $80-150/month
- **Cloud SQL**: $50-100/month (dedicated cores)
- **Network Egress**: $20-50/month
- **Total**: **$200-400/month**

### Cost Optimization Strategies

1. **Free Tier Utilization**
   - Cloud Run provides generous free tier (2 million vCPU-seconds/month)
   - Optimize for request-based billing if traffic is bursty

2. **Committed Use Discounts (CUDs)**
   - 1-year commitment: 20-30% savings
   - 3-year commitment: 40-50% savings
   - Best for predictable, high-traffic applications

3. **Instance Optimization**
   - Use minimal CPU/memory allocation (0.2 vCPU, 512MB)
   - Configure appropriate concurrency limits
   - Enable minimum instances only if needed for latency

4. **Database Optimization**
   - Start with shared-core instance (db-f1-micro)
   - Use connection pooling to reduce database load
   - Implement proper indexing for query optimization

## Advanced Cost Optimizations

### High-Impact, Low-Effort Optimizations

#### 1. Cloud CDN for Static Assets

**Cost Savings**: 40-60% reduction in Cloud Run requests
**Implementation**: Enable Cloud CDN on Cloud Storage bucket

```bash
# Create Cloud Storage bucket
gsutil mb -p your-project -c standard -l us-central1 gs://your-saas-assets

# Enable CDN
gcloud compute backend-buckets create saas-assets-backend \
  --gcs-bucket-name=your-saas-assets

gcloud compute url-maps create saas-url-map \
  --default-backend-bucket=saas-assets-backend

gcloud compute target-http-proxies create saas-http-proxy \
  --url-map=saas-url-map

gcloud compute forwarding-rules create saas-cdn-rule \
  --target-http-proxy=saas-http-proxy \
  --ports=80 \
  --global
```

**Monthly Cost**: $0.08/GB for CDN egress (vs $0.19/GB for Cloud Run)

#### 2. Redis for Caching (Memorystore)

**Cost Savings**: 30-50% reduction in database queries
**Implementation**: Use Memorystore for Redis

```bash
# Create Redis instance
gcloud redis instances create saas-cache \
  --size=1 \
  --region=us-central1 \
  --tier=basic \
  --redis-version=redis_7_0

# Connect from Cloud Run
gcloud run services update saas-api \
  --add-env-vars=REDIS_URL=redis://10.0.0.4:6379 \
  --vpc-connector=saas-connector
```

**Monthly Cost**: $25-50 for basic tier (1GB)
**Savings**: Reduces Cloud SQL load by 40-60%

#### 3. Database Connection Pooling

**Cost Savings**: 20-30% reduction in database CPU usage
**Implementation**: Use PgBouncer or connection pooling

```javascript
// In your API code, implement connection pooling
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10, // Maximum connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})
```

**Monthly Cost**: Free (code change only)
**Savings**: Allows smaller database instance size

### Medium-Impact Optimizations

#### 4. Cold Start Optimization

**Cost Savings**: 15-25% reduction in Cloud Run costs for bursty traffic
**Implementation**: Strategic minimum instances

```bash
# Set minimum instances for critical paths
gcloud run services update saas-api \
  --min-instances=1 \
  --max-instances=10 \
  --concurrency=50
```

**Monthly Cost**: Additional $5-15 for minimum instance
**Trade-off**: Higher baseline cost vs faster response times

#### 5. Request-Based Billing Optimization

**Cost Savings**: 20-40% for applications with idle periods
**Implementation**: Switch to request-based billing

```bash
# Enable request-based billing
gcloud run services update saas-web \
  --cpu-throttling \
  --concurrency=1

gcloud run services update saas-api \
  --cpu-throttling \
  --concurrency=10
```

**Monthly Cost**: Lower for bursty traffic patterns
**Best For**: Applications with variable traffic

#### 6. Storage Optimization

**Cost Savings**: 50-70% on storage costs
**Implementation**: Use Cloud Storage for large files

```bash
# Create multi-class bucket
gsutil mb -p your-project -c standard -l us-central1 gs://your-saas-data

# Set lifecycle policy for cost optimization
gsutil lifecycle set lifecycle.json gs://your-saas-data

# lifecycle.json
{
  "rule": [
    {
      "action": {"type": "SetStorageClass", "storageClass": "NEARLINE"},
      "condition": {"age": 30}
    },
    {
      "action": {"type": "SetStorageClass", "storageClass": "COLDLINE"},
      "condition": {"age": 90}
    }
  ]
}
```

**Monthly Cost**: $0.01/GB for Nearline (vs $0.17/GB for SSD)

### Advanced Optimizations

#### 7. Auto-Scaling Intelligence

**Cost Savings**: 25-35% through predictive scaling
**Implementation**: Custom metrics-based scaling

```yaml
# Use Cloud Monitoring custom metrics
scaling:
  minInstances: 0
  maxInstances: 50
  targetCpuUtilization: 0.7
  targetConcurrency: 100
  customMetrics:
    - metric: custom.googleapis.com/active_users
      target: 1000
```

#### 8. Database Read Replicas

**Cost Savings**: 30-50% for read-heavy workloads
**Implementation**: Cloud SQL read replicas

```bash
# Create read replica
gcloud sql instances create saas-db-replica \
  --master-instance-name=saas-db \
  --region=us-central1 \
  --tier=db-f1-micro

# Use replica for read queries
const readPool = new Pool({
  connectionString: process.env.DATABASE_REPLICA_URL,
  max: 20,
})
```

**Monthly Cost**: $7-15 for replica instance
**Savings**: Offloads read traffic from primary database

#### 9. Advanced Monitoring & Cost Alerts

**Cost Savings**: 15-25% through proactive optimization
**Implementation**: Sophisticated monitoring

```bash
# Create budget alerts
gcloud billing budgets create monthly-budget \
  --billing-account=your-billing-account \
  --amount=100 \
  --threshold-rule=percent=50 \
  --threshold-rule=percent=90 \
  --threshold-rule=percent=100

# Set up custom dashboards
gcloud monitoring dashboards create \
  --config-from-file=dashboard.json
```

### Optimization Priority Matrix

| Optimization | Implementation Effort | Cost Savings | Priority |
|-------------|----------------------|--------------|----------|
| Cloud CDN | Low | High (40-60%) | ⭐⭐⭐ |
| Redis Caching | Medium | High (30-50%) | ⭐⭐⭐ |
| Connection Pooling | Low | Medium (20-30%) | ⭐⭐⭐ |
| Request-Based Billing | Low | Medium (20-40%) | ⭐⭐ |
| Storage Classes | Low | High (50-70%) | ⭐⭐ |
| Cold Start Optimization | Medium | Medium (15-25%) | ⭐⭐ |
| Read Replicas | High | High (30-50%) | ⭐ |
| Auto-Scaling Intelligence | High | Medium (25-35%) | ⭐ |

### Updated Cost Projections with Optimizations

#### Optimized Low Traffic Scenario (100 DAU)

- **Base Cost**: $14-24/month
- **With Optimizations**: $8-15/month
- **Savings**: 40-50%

#### Optimized Moderate Traffic Scenario (1K DAU)

- **Base Cost**: $33-58/month
- **With Optimizations**: $20-35/month
- **Savings**: 35-45%

#### Optimized High Traffic Scenario (10K DAU)

- **Base Cost**: $200-400/month
- **With Optimizations**: $120-250/month
- **Savings**: 30-40%

### Implementation Roadmap

#### Phase 1: Quick Wins (1-2 weeks)

1. ✅ Enable Cloud CDN for static assets
2. ✅ Implement basic Redis caching
3. ✅ Add connection pooling
4. ✅ Switch to request-based billing

#### Phase 2: Medium Impact (2-4 weeks)

1. Optimize storage classes
2. Implement cold start optimizations
3. Set up advanced monitoring
4. Configure cost alerts

#### Phase 3: Advanced (4-8 weeks)

1. Implement read replicas
2. Add predictive auto-scaling
3. Optimize database queries
4. Implement advanced caching strategies

### Monitoring Optimization Success

Track these metrics to measure optimization effectiveness:

```bash
# Key metrics to monitor
- Cloud Run: CPU utilization, request latency, cold start frequency
- Cloud SQL: Query performance, connection count, CPU usage
- Redis: Hit rate, memory usage, eviction rate
- CDN: Cache hit ratio, bandwidth savings
- Overall: Total monthly cost, cost per request
```

### Cost Optimization Checklist

- [ ] Cloud CDN enabled for static assets
- [ ] Redis caching implemented for database queries
- [ ] Connection pooling configured
- [ ] Request-based billing enabled
- [ ] Storage lifecycle policies set
- [ ] Cost alerts configured
- [ ] Minimum instances optimized
- [ ] Database queries optimized
- [ ] CDN cache hit ratio > 80%
- [ ] Redis hit rate > 85%
- [ ] Database connection pool utilization < 80%

These advanced optimizations can reduce your Google Cloud costs by 30-50% while maintaining or improving performance. The key is implementing them incrementally, starting with the highest-impact, lowest-effort changes.

## Deployment Strategy

### Prerequisites

1. Google Cloud Project with billing enabled
2. gcloud CLI installed and configured
3. Docker installed locally
4. Bun installed (for local development and faster builds)
5. Next.js 15 compatible Node.js version (18.17+ recommended)
6. Artifact Registry enabled

### Step-by-Step Deployment

#### 1. Project Setup

```bash
# Create new project or use existing
gcloud projects create your-saas-project
gcloud config set project your-saas-project

# Enable required APIs
gcloud services enable run.googleapis.com
gcloud services enable sqladmin.googleapis.com
gcloud services enable vpcaccess.googleapis.com
gcloud services enable artifactregistry.googleapis.com
```

#### 2. Container Registry Setup

```bash
# Create Artifact Registry repository
gcloud artifacts repositories create containers \
  --repository-format=docker \
  --location=us-central1 \
  --description="Container registry for SaaS app"
```

#### 3. VPC Network Setup

```bash
# Create VPC network
gcloud compute networks create saas-network --subnet-mode=custom

# Create subnet
gcloud compute networks subnets create saas-subnet \
  --network=saas-network \
  --region=us-central1 \
  --range=10.0.0.0/24
```

#### 4. Cloud SQL Setup

```bash
# Create PostgreSQL instance
gcloud sql instances create saas-db \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=us-central1 \
  --network=saas-network \
  --no-assign-ip

# Create database
gcloud sql databases create saas_db --instance=saas-db

# Create user
gcloud sql users create saas_user \
  --instance=saas-db \
  --password=your-secure-password
```

#### 5. Build and Deploy Containers

**Build API Container:**
```bash
cd apps/api
docker build -t us-central1-docker.pkg.dev/your-project/containers/saas-api:latest .
docker push us-central1-docker.pkg.dev/your-project/containers/saas-api:latest
```

**Build Frontend Container:**
```bash
cd apps/web
docker build -t us-central1-docker.pkg.dev/your-project/containers/saas-web:latest .
docker push us-central1-docker.pkg.dev/your-project/containers/saas-web:latest
```

#### 6. Deploy to Cloud Run

**Deploy API Service:**
```bash
gcloud run deploy saas-api \
  --image=us-central1-docker.pkg.dev/your-project/containers/saas-api:latest \
  --platform=managed \
  --region=us-central1 \
  --vpc-connector=saas-connector \
  --set-env-vars="DATABASE_URL=postgresql://saas_user:password@10.0.0.3/saas_db" \
  --allow-unauthenticated \
  --port=3001
```

**Deploy Frontend Service:**
```bash
gcloud run deploy saas-web \
  --image=us-central1-docker.pkg.dev/your-project/containers/saas-web:latest \
  --platform=managed \
  --region=us-central1 \
  --set-env-vars="NEXT_PUBLIC_API_URL=https://saas-api-url" \
  --allow-unauthenticated \
  --port=3000
```

### CI/CD Pipeline (Optional)

#### Cloud Build Configuration

```yaml
# cloudbuild.yaml
steps:
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'us-central1-docker.pkg.dev/$PROJECT_ID/containers/saas-api', './apps/api']
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'us-central1-docker.pkg.dev/$PROJECT_ID/containers/saas-api']
  - name: 'gcr.io/cloud-builders/gcloud'
    args: ['run', 'deploy', 'saas-api', '--image=us-central1-docker.pkg.dev/$PROJECT_ID/containers/saas-api', '--region=us-central1']
```

### Migration from Local Development

### Database Migration

1. Export local database schema and data
2. Import to Cloud SQL instance
3. Update connection strings in environment variables
4. Test database connectivity

### Environment Variables Update

```env
# Update these for production
DATABASE_URL=postgresql://saas_user:password@10.0.0.3/saas_db
NEXT_PUBLIC_API_URL=https://saas-api-[hash]-uc.a.run.app
```

### CI/CD Pipeline Setup (Optional)

#### Cloud Build Configuration

```yaml
# cloudbuild.yaml
steps:
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'us-central1-docker.pkg.dev/$PROJECT_ID/containers/saas-api', './apps/api']
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'us-central1-docker.pkg.dev/$PROJECT_ID/containers/saas-api']
  - name: 'gcr.io/cloud-builders/gcloud'
    args: ['run', 'deploy', 'saas-api', '--image=us-central1-docker.pkg.dev/$PROJECT_ID/containers/saas-api', '--region=us-central1']
```

## Migration from Local Development

### Database Migration

1. Export local database schema and data
2. Import to Cloud SQL instance
3. Update connection strings in environment variables
4. Test database connectivity

### Environment Variables Update

```env
# Update these for production
DATABASE_URL=postgresql://saas_user:password@10.0.0.3/saas_db
NEXT_PUBLIC_API_URL=https://saas-api-[hash]-uc.a.run.app
```

### Domain Configuration

1. Purchase domain through Google Domains or preferred registrar
2. Configure Cloud DNS
3. Set up SSL certificates (automatic with Cloud Run)
4. Configure custom domain in Cloud Run

## Migration from Local Development

### Database Migration
1. Export local database schema and data
2. Import to Cloud SQL instance
3. Update connection strings in environment variables
4. Test database connectivity

### Environment Variables Update
```env
# Update these for production
DATABASE_URL=postgresql://saas_user:password@10.0.0.3/saas_db
NEXT_PUBLIC_API_URL=https://saas-api-[hash]-uc.a.run.app
```

### Domain Configuration
1. Purchase domain through Google Domains or preferred registrar
2. Configure Cloud DNS
3. Set up SSL certificates (automatic with Cloud Run)
4. Configure custom domain in Cloud Run

## SSL Configuration for Custom Domains

Google Cloud Run provides **automatic SSL certificate provisioning** for custom domains. This section explains how to configure SSL for domains purchased from external providers like Gandi, Namecheap, or GoDaddy.

### Prerequisites
- Domain purchased from external registrar (e.g., Gandi)
- Google Cloud project with billing enabled
- Cloud Run services deployed
- Domain ownership verification completed

### Step-by-Step SSL Configuration

#### Step 1: Add Custom Domain to Cloud Run

```bash
# Add custom domain to your Cloud Run service
gcloud run domain-mappings create \
  --service=saas-web \
  --domain=yourdomain.com

# For API subdomain (optional)
gcloud run domain-mappings create \
  --service=saas-api \
  --domain=api.yourdomain.com
```

#### Step 2: Verify Domain Ownership

Cloud Run will provide DNS records that you need to add to your domain registrar (Gandi):

```bash
# Check the DNS records needed for verification
gcloud run domain-mappings describe \
  --domain=yourdomain.com \
  --region=us-central1
```

This command will output something like:
```
TXT Record: google-site-verification=abc123def456
CNAME Record: ghs.googlehosted.com
```

#### Step 3: Configure DNS Records at Your Registrar

**For Gandi (or similar registrars):**

1. **Log in to your Gandi account**
2. **Go to Domain Management**
3. **Select your domain** (yourdomain.com)
4. **Navigate to DNS Records** or **Zone File**

**Add these DNS records:**

| Type | Name | Value | TTL |
|------|------|-------|-----|
| TXT | @ | google-site-verification=abc123def456 | 10800 |
| CNAME | @ | ghs.googlehosted.com | 10800 |
| CNAME | www | ghs.googlehosted.com | 10800 |

**For API subdomain (if using):**
| Type | Name | Value | TTL |
|------|------|-------|-----|
| CNAME | api | ghs.googlehosted.com | 10800 |

#### Step 4: SSL Certificate Provisioning

**Automatic SSL (Recommended):**
- Google Cloud Run automatically provisions SSL certificates
- Certificates are from Let's Encrypt (free)
- Automatic renewal handled by Google
- No additional configuration required

**Custom SSL Certificate (Optional):**
If you prefer to use your own certificate:

```bash
# Upload custom SSL certificate
gcloud compute ssl-certificates create custom-ssl \
  --certificate=certificate.crt \
  --private-key=private.key \
  --global

# Attach to load balancer (if using custom load balancer)
gcloud compute target-https-proxies update your-proxy \
  --ssl-certificates=custom-ssl
```

#### Step 5: Verify SSL Configuration

```bash
# Check domain mapping status
gcloud run domain-mappings list

# Verify SSL certificate
curl -I https://yourdomain.com

# Check certificate details
openssl s_client -connect yourdomain.com:443 -servername yourdomain.com
```

### DNS Configuration Examples

#### For Root Domain (yourdomain.com)
```
Type: CNAME
Name: @
Value: ghs.googlehosted.com
TTL: 10800 (3 hours)
```

#### For WWW Subdomain (www.yourdomain.com)
```
Type: CNAME
Name: www
Value: ghs.googlehosted.com
TTL: 10800 (3 hours)
```

#### For API Subdomain (api.yourdomain.com)
```
Type: CNAME
Name: api
Value: ghs.googlehosted.com
TTL: 10800 (3 hours)
```

### Troubleshooting SSL Issues

#### Issue: SSL Certificate Not Provisioning
**Symptoms:** HTTPS not working, browser shows "Not Secure"

**Solutions:**
1. **Wait for DNS propagation** (can take 24-48 hours)
2. **Verify DNS records** are correctly configured
3. **Check domain mapping status:**
   ```bash
   gcloud run domain-mappings describe --domain=yourdomain.com
   ```

#### Issue: Mixed Content Warnings
**Symptoms:** Browser shows mixed HTTP/HTTPS content

**Solutions:**
1. **Update all internal links** to use HTTPS
2. **Configure Content Security Policy** headers
3. **Use protocol-relative URLs** or HTTPS-only URLs

#### Issue: SSL Certificate Expired
**Symptoms:** Browser shows certificate expired

**Solutions:**
- **Automatic certificates:** Google handles renewal automatically
- **Custom certificates:** Upload new certificate before expiration
- **Check certificate status:**
  ```bash
  gcloud compute ssl-certificates list
  ```

### Advanced SSL Configuration

#### HTTP to HTTPS Redirect
Configure automatic redirect using Cloud Load Balancing:

```bash
# Create HTTP load balancer for redirect
gcloud compute url-maps create redirect-map \
  --default-url-redirect \
  --redirect-response-code=301 \
  --https-redirect

# Create target HTTP proxy
gcloud compute target-http-proxies create redirect-proxy \
  --url-map=redirect-map

# Create forwarding rule
gcloud compute forwarding-rules create redirect-rule \
  --target-http-proxy=redirect-proxy \
  --ports=80 \
  --global
```

#### Custom SSL Policies
For enhanced security:

```bash
# Create custom SSL policy
gcloud compute ssl-policies create custom-ssl-policy \
  --profile=MODERN \
  --min-tls-version=1.2

# Attach to load balancer
gcloud compute target-https-proxies update your-proxy \
  --ssl-policy=custom-ssl-policy
```

### SSL Certificate Management

#### Monitoring Certificate Status
```bash
# List all SSL certificates
gcloud compute ssl-certificates list

# Check certificate details
gcloud compute ssl-certificates describe your-certificate

# Monitor certificate expiration
gcloud compute ssl-certificates list \
  --filter="expireTime.date('%Y-%m-%d', Z) < '2025-12-01'"
```

#### Certificate Renewal
- **Automatic certificates:** Handled by Google Cloud
- **Custom certificates:** Set up renewal alerts
- **Backup certificates:** Store certificates securely

### Security Best Practices

1. **Use HTTPS Everywhere**
   - Redirect all HTTP traffic to HTTPS
   - Update all internal links to use HTTPS

2. **SSL/TLS Configuration**
   - Use modern TLS versions (1.2+)
   - Enable HSTS headers
   - Configure secure cipher suites

3. **Certificate Monitoring**
   - Set up alerts for certificate expiration
   - Regularly audit certificate usage
   - Monitor for SSL/TLS vulnerabilities

### Cost Considerations

- **SSL Certificates:** Free with automatic provisioning
- **Custom Certificates:** No additional cost for upload/management
- **Load Balancer:** Required for advanced SSL features ($18/month)
- **DNS:** No additional cost for basic DNS configuration

### Common DNS Providers Configuration

#### Gandi
1. Login to Gandi.net
2. Go to Domain → DNS Records
3. Add CNAME records as specified above
4. Save changes (propagation takes 1-24 hours)

#### Namecheap
1. Login to Namecheap
2. Go to Domain List → Manage
3. Go to Advanced DNS
4. Add CNAME records
5. Save changes

#### GoDaddy
1. Login to GoDaddy
2. Go to Domain Settings
3. Click DNS
4. Add CNAME records
5. Save changes

### Verification Steps

After DNS configuration:

1. **Wait for propagation** (1-48 hours)
2. **Test HTTPS access:** `https://yourdomain.com`
3. **Check SSL certificate** in browser
4. **Verify domain mapping:**
   ```bash
   gcloud run domain-mappings list
   ```
5. **Test API endpoints** if using subdomains

### Support and Resources

- **Google Cloud Run Documentation:** https://cloud.google.com/run/docs/mapping-custom-domains
- **SSL Certificate Troubleshooting:** https://cloud.google.com/load-balancing/docs/ssl-certificates/troubleshooting
- **DNS Propagation Checker:** https://dnschecker.org/
- **SSL Certificate Checker:** https://www.sslshopper.com/ssl-checker.html

This SSL configuration ensures secure HTTPS access for your SaaS application with minimal maintenance overhead, as Google Cloud handles certificate provisioning and renewal automatically.

## Monitoring and Observability

### Recommended Tools
- **Cloud Monitoring**: Built-in metrics and alerting
- **Cloud Logging**: Centralized log management
- **Cloud Trace**: Performance monitoring
- **Error Reporting**: Automatic error tracking

### Key Metrics to Monitor
- Cloud Run: Request latency, error rates, instance count
- Cloud SQL: CPU usage, memory usage, connection count
- Network: Egress traffic, latency

## Security Considerations

### Network Security
- Use VPC for private communication between services
- Enable Cloud SQL private IP connectivity
- Configure firewall rules appropriately

### Access Control
- Use IAM for service account management
- Implement least privilege principle
- Enable Cloud Run authentication for API endpoints

### Data Security
- Enable Cloud SQL automated backups
- Configure encryption at rest and in transit
- Implement proper database access controls

## Scaling Strategy

### Horizontal Scaling
- Cloud Run automatically scales based on traffic
- Configure maximum instances to control costs
- Use load balancer for distributing traffic

### Database Scaling
- Start with shared-core instance
- Upgrade to dedicated cores as needed
- Implement read replicas for read-heavy workloads

### Cost Monitoring
- Set up billing alerts for budget control
- Use cost optimization recommendations from GCP
- Monitor usage patterns to optimize resource allocation

## Comparison with Alternatives

### vs. Vercel (Current Setup)
- **Cost**: Similar for low traffic, cheaper for high traffic
- **Scalability**: Better automatic scaling
- **Database**: More control over database configuration
- **Vendor Lock-in**: Less dependent on single provider

### vs. AWS (ECS/Fargate + RDS)
- **Cost**: 10-20% cheaper for similar configurations
- **Simplicity**: Easier to manage with fewer services
- **Integration**: Better Google service integration

### vs. Self-hosted (Kubernetes)
- **Cost**: Significantly cheaper for small applications
- **Maintenance**: Much lower operational overhead
- **Scalability**: Automatic scaling without cluster management

## Recommendations

### For MVP/Prototype
- Use shared-core Cloud SQL instance
- Start with minimal Cloud Run configuration
- Leverage free tiers extensively
- **Estimated Cost**: $15-25/month

### For Production Launch
- Upgrade to dedicated Cloud SQL instance
- Implement monitoring and alerting
- Set up CI/CD pipeline
- Configure custom domain
- **Estimated Cost**: $50-100/month

### For Scale-up
- Implement committed use discounts
- Use Cloud SQL read replicas
- Optimize container resource allocation
- **Estimated Cost**: $100-300/month

## Conclusion

Google Cloud Run with Cloud SQL PostgreSQL provides an excellent hosting solution for this SaaS starter kit, offering:

- **Cost Efficiency**: $15-100/month depending on scale
- **Scalability**: Automatic scaling from zero to thousands of instances
- **Operational Simplicity**: Fully managed services with minimal maintenance
- **Performance**: Global CDN capabilities and low-latency database access
- **Security**: Enterprise-grade security with VPC isolation

The recommended architecture balances cost optimization with scalability, making it ideal for SaaS applications at any stage of growth. The containerized nature of the application makes migration straightforward, and the pay-per-use model ensures costs remain proportional to usage.

**Next Steps:**
1. Set up Google Cloud project and billing
2. Deploy to Cloud Run following the step-by-step guide
3. Configure monitoring and alerting
4. Optimize costs based on actual usage patterns

---

*Report generated on: September 1, 2025*
*Based on Google Cloud pricing as of Q3 2025*
*Assumes us-central1 region for cost calculations*
