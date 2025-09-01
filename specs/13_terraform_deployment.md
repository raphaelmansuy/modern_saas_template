# Terraform Deployment Guide for SaaS Starter Kit

## Executive Summary

This document provides a comprehensive guide for deploying the SaaS starter kit to Google Cloud Platform using Terraform. The deployment leverages Cloud Run for serverless container execution, Cloud SQL for managed PostgreSQL, and integrates with external services like Clerk, Stripe, and Sentry.

**Key Benefits:**
- **Infrastructure as Code**: Version-controlled, reproducible infrastructure
- **Cost Optimization**: Pay-per-use model with automatic scaling
- **Security**: Enterprise-grade security with VPC isolation and IAM
- **Scalability**: Automatic scaling from zero to thousands of instances
- **Maintainability**: Modular Terraform configuration with clear separation of concerns

**Architecture Overview:**
- **Frontend**: Next.js 15 deployed to Cloud Run
- **Backend**: Hono.js API deployed to Cloud Run
- **Database**: PostgreSQL managed by Cloud SQL
- **Networking**: VPC with private connectivity
- **CI/CD**: GitHub Actions with Terraform integration

## Prerequisites

### Required Tools
- **Terraform** >= 1.5.0 (open-source version)
- **Google Cloud SDK** (`gcloud` CLI)
- **Docker** >= 20.10
- **Bun** >= 1.0.0 (for local development)
- **Git** for version control

### Required Accounts
- **Google Cloud Platform** account with billing enabled
- **GitHub** account for CI/CD
- **Domain registrar** account (for custom domains)
- **External services**: Clerk, Stripe, Resend, Sentry, PostHog

### Required Knowledge
- Basic understanding of Terraform and HCL
- Familiarity with Google Cloud Platform
- Containerization concepts (Docker)
- Git and GitHub workflows

### GCP Project Setup

1. **Create GCP Project:**
   ```bash
   gcloud projects create your-saas-project
   gcloud config set project your-saas-project
   ```

2. **Enable Required APIs:**
   ```bash
   gcloud services enable run.googleapis.com
   gcloud services enable sqladmin.googleapis.com
   gcloud services enable vpcaccess.googleapis.com
   gcloud services enable artifactregistry.googleapis.com
   gcloud services enable secretmanager.googleapis.com
   gcloud services enable monitoring.googleapis.com
   gcloud services enable logging.googleapis.com
   ```

3. **Create Service Account:**
   ```bash
   gcloud iam service-accounts create terraform-deployer \
     --description="Service account for Terraform deployments" \
     --display-name="Terraform Deployer"
   ```

4. **Grant Permissions:**
   ```bash
   gcloud projects add-iam-policy-binding your-saas-project \
     --member="serviceAccount:terraform-deployer@your-saas-project.iam.gserviceaccount.com" \
     --role="roles/editor"
   ```

5. **Create Service Account Key:**
   ```bash
   gcloud iam service-accounts keys create ~/terraform-key.json \
     --iam-account=terraform-deployer@your-saas-project.iam.gserviceaccount.com
   ```

## Project Architecture Review

### Application Components

#### Frontend (Next.js 15)
- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: Zustand
- **Authentication**: Clerk integration
- **Payments**: Stripe Elements
- **Analytics**: PostHog
- **Deployment**: Cloud Run service

#### Backend (Hono.js)
- **Framework**: Hono.js with TypeScript
- **Database**: Drizzle ORM with PostgreSQL
- **Authentication**: Clerk SDK
- **Payments**: Stripe webhooks
- **Email**: Resend integration
- **Monitoring**: Sentry
- **API**: RESTful with OpenAPI specification

#### Database (PostgreSQL)
- **ORM**: Drizzle with type-safe queries
- **Schema**: Users, subscriptions, products, orders
- **Migrations**: Automated schema management
- **Connection**: Private IP through VPC

#### External Services
- **Clerk**: User authentication and management
- **Stripe**: Payment processing and subscriptions
- **Resend**: Transactional email delivery
- **Sentry**: Error tracking and performance monitoring
- **PostHog**: User analytics and behavior tracking

### Infrastructure Components

#### Networking
- **VPC Network**: Isolated network environment
- **Subnets**: Regional subnets for resource isolation
- **VPC Connector**: Serverless VPC access for Cloud Run

#### Compute
- **Cloud Run**: Serverless container platform
- **Artifact Registry**: Private container registry
- **Service Accounts**: IAM for secure service communication

#### Storage & Database
- **Cloud SQL**: Managed PostgreSQL instance
- **Secret Manager**: Secure storage for sensitive data
- **Storage Buckets**: Static asset storage (optional)

#### Security & Monitoring
- **IAM**: Identity and Access Management
- **VPC Security**: Network-level security controls
- **Cloud Monitoring**: Infrastructure and application monitoring
- **Cloud Logging**: Centralized log management

## Infrastructure Design

### Terraform Project Structure

```
terraform/
├── main.tf                 # Main infrastructure resources
├── variables.tf            # Input variables
├── outputs.tf              # Output values
├── terraform.tf            # Terraform configuration
├── backend.tf              # State backend configuration
├── terraform.tfvars.example # Example variables
├── modules/
│   ├── vpc/               # VPC and networking
│   ├── database/          # Cloud SQL configuration
│   ├── container/         # Cloud Run and Artifact Registry
│   ├── security/          # IAM and Secret Manager
│   └── monitoring/        # Monitoring and logging
└── environments/
    ├── dev/
    │   └── terraform.tfvars
    ├── staging/
    │   └── terraform.tfvars
    └── prod/
        └── terraform.tfvars
```

### Module Design

#### VPC Module
- Creates VPC network and subnets
- Configures VPC connector for Cloud Run
- Sets up firewall rules
- Manages private service access

#### Database Module
- Provisions Cloud SQL PostgreSQL instance
- Creates database and user
- Configures backup and maintenance windows
- Sets up connection pooling

#### Container Module
- Creates Artifact Registry repository
- Builds and pushes container images
- Deploys Cloud Run services
- Configures service accounts and IAM

#### Security Module
- Manages service accounts
- Configures IAM roles and permissions
- Sets up Secret Manager secrets
- Creates SSL certificates

#### Monitoring Module
- Configures Cloud Monitoring dashboards
- Sets up alerting policies
- Creates log sinks and metrics
- Configures uptime checks

## Terraform Configuration

### Core Configuration Files

#### terraform.tf
```hcl
terraform {
  required_version = ">= 1.5.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

provider "google-beta" {
  project = var.project_id
  region  = var.region
}
```

#### backend.tf
```hcl
terraform {
  backend "gcs" {
    bucket = "your-terraform-state-bucket"
    prefix = "terraform/state"
  }
}
```

#### variables.tf
```hcl
variable "project_id" {
  description = "GCP Project ID"
  type        = string
}

variable "region" {
  description = "GCP Region"
  type        = string
  default     = "us-central1"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "dev"
}

variable "domain" {
  description = "Custom domain name"
  type        = string
  default     = ""
}

variable "db_instance_tier" {
  description = "Cloud SQL instance tier"
  type        = string
  default     = "db-f1-micro"
}

variable "db_disk_size" {
  description = "Cloud SQL disk size in GB"
  type        = number
  default     = 10
}
```

#### main.tf
```hcl
# Enable required APIs
resource "google_project_service" "apis" {
  for_each = toset([
    "run.googleapis.com",
    "sqladmin.googleapis.com",
    "vpcaccess.googleapis.com",
    "artifactregistry.googleapis.com",
    "secretmanager.googleapis.com",
    "monitoring.googleapis.com",
    "logging.googleapis.com"
  ])
  service = each.key
  disable_on_destroy = false
}

# VPC Module
module "vpc" {
  source = "./modules/vpc"

  project_id  = var.project_id
  region      = var.region
  environment = var.environment
}

# Database Module
module "database" {
  source = "./modules/database"

  project_id       = var.project_id
  region           = var.region
  environment      = var.environment
  vpc_id           = module.vpc.vpc_id
  db_instance_tier = var.db_instance_tier
  db_disk_size     = var.db_disk_size

  depends_on = [google_project_service.apis]
}

# Security Module
module "security" {
  source = "./modules/security"

  project_id  = var.project_id
  environment = var.environment
}

# Container Module
module "container" {
  source = "./modules/container"

  project_id         = var.project_id
  region             = var.region
  environment        = var.environment
  vpc_connector_id   = module.vpc.vpc_connector_id
  service_account_email = module.security.service_account_email
  database_connection_name = module.database.connection_name

  depends_on = [module.database, module.security]
}

# Monitoring Module
module "monitoring" {
  source = "./modules/monitoring"

  project_id  = var.project_id
  environment = var.environment
  services    = [
    module.container.web_service_url,
    module.container.api_service_url
  ]
}
```

### Module Implementations

#### VPC Module (modules/vpc/main.tf)
```hcl
resource "google_compute_network" "vpc" {
  name                    = "${var.environment}-vpc"
  auto_create_subnetworks = false
}

resource "google_compute_subnetwork" "subnet" {
  name          = "${var.environment}-subnet"
  network       = google_compute_network.vpc.id
  ip_cidr_range = "10.0.0.0/24"
  region        = var.region
}

resource "google_vpc_access_connector" "connector" {
  name          = "${var.environment}-vpc-connector"
  region        = var.region
  ip_cidr_range = "10.8.0.0/28"
  network       = google_compute_network.vpc.name
}

# Private service access for Cloud SQL
resource "google_compute_global_address" "private_ip_address" {
  name          = "${var.environment}-private-ip"
  purpose       = "VPC_PEERING"
  address_type  = "INTERNAL"
  prefix_length = 16
  network       = google_compute_network.vpc.id
}

resource "google_service_networking_connection" "private_vpc_connection" {
  network                 = google_compute_network.vpc.id
  service                 = "servicenetworking.googleapis.com"
  reserved_peering_ranges = [google_compute_global_address.private_ip_address.name]
}
```

#### Database Module (modules/database/main.tf)
```hcl
resource "google_sql_database_instance" "postgres" {
  name             = "${var.environment}-postgres"
  database_version = "POSTGRES_15"
  region           = var.region

  settings {
    tier = var.db_instance_tier
    disk_size = var.db_disk_size

    ip_configuration {
      ipv4_enabled    = false
      private_network = var.vpc_id
    }

    backup_configuration {
      enabled = true
      start_time = "02:00"
    }

    maintenance_window {
      day  = 7
      hour = 3
    }
  }

  depends_on = [var.vpc_id]
}

resource "google_sql_database" "database" {
  name     = "saas_db"
  instance = google_sql_database_instance.postgres.name
}

resource "google_sql_user" "user" {
  name     = "saas_user"
  instance = google_sql_database_instance.postgres.name
  password = random_password.db_password.result
}

resource "random_password" "db_password" {
  length  = 16
  special = true
}
```

#### Container Module (modules/container/main.tf)
```hcl
resource "google_artifact_registry_repository" "repo" {
  location      = var.region
  repository_id = "${var.environment}-containers"
  format        = "DOCKER"
}

resource "google_cloud_run_service" "web" {
  name     = "${var.environment}-web"
  location = var.region

  template {
    spec {
      containers {
        image = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.repo.repository_id}/web:latest"

        env {
          name  = "DATABASE_URL"
          value = "postgresql://saas_user:${random_password.db_password.result}@${var.database_connection_name}/saas_db"
        }

        env {
          name  = "NEXT_PUBLIC_API_URL"
          value = google_cloud_run_service.api.status[0].url
        }

        # Add other environment variables...
      }

      service_account_name = var.service_account_email
    }

    metadata {
      annotations = {
        "run.googleapis.com/vpc-access-connector" = var.vpc_connector_id
      }
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }
}

resource "google_cloud_run_service" "api" {
  name     = "${var.environment}-api"
  location = var.region

  template {
    spec {
      containers {
        image = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.repo.repository_id}/api:latest"

        env {
          name  = "DATABASE_URL"
          value = "postgresql://saas_user:${random_password.db_password.result}@${var.database_connection_name}/saas_db"
        }

        # Add other environment variables...
      }

      service_account_name = var.service_account_email
    }

    metadata {
      annotations = {
        "run.googleapis.com/vpc-access-connector" = var.vpc_connector_id
      }
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }
}

# IAM policy for public access
resource "google_cloud_run_service_iam_policy" "web_noauth" {
  location = google_cloud_run_service.web.location
  project  = google_cloud_run_service.web.project
  service  = google_cloud_run_service.web.name

  policy_data = data.google_iam_policy.noauth.policy_data
}

data "google_iam_policy" "noauth" {
  binding {
    role = "roles/run.invoker"
    members = [
      "allUsers",
    ]
  }
}
```

## CI/CD Integration

### Enhanced GitHub Actions Workflow

#### .github/workflows/terraform.yml
```yaml
name: Terraform CI/CD

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]
  workflow_dispatch:
    inputs:
      environment:
        description: 'Environment to deploy'
        required: true
        default: 'dev'
        type: choice
        options:
        - dev
        - staging
        - prod

env:
  TF_VERSION: '1.5.0'
  TF_WORKING_DIR: './terraform'
  GCP_PROJECT_ID: ${{ secrets.GCP_PROJECT_ID }}

jobs:
  terraform:
    name: 'Terraform'
    runs-on: ubuntu-latest
    environment: ${{ github.event.inputs.environment || 'dev' }}

    steps:
    - name: Checkout
      uses: actions/checkout@v4

    - name: Setup Terraform
      uses: hashicorp/setup-terraform@v3
      with:
        terraform_version: ${{ env.TF_VERSION }}

    - name: Authenticate to Google Cloud
      uses: google-github-actions/auth@v2
      with:
        credentials_json: ${{ secrets.GCP_SA_KEY }}

    - name: Set up Cloud SDK
      uses: google-github-actions/setup-gcloud@v2

    - name: Terraform Format
      id: fmt
      run: terraform fmt -check
      continue-on-error: true

    - name: Terraform Init
      run: terraform init
      working-directory: ${{ env.TF_WORKING_DIR }}

    - name: Terraform Validate
      run: terraform validate
      working-directory: ${{ env.TF_WORKING_DIR }}

    - name: Terraform Plan
      id: plan
      run: |
        terraform plan -no-color -out=tfplan
      working-directory: ${{ env.TF_WORKING_DIR }}
      continue-on-error: true

    - name: Update Pull Request
      uses: actions/github-script@v7
      if: github.event_name == 'pull_request'
      env:
        PLAN: "terraform\n${{ steps.plan.outputs.stdout }}"
      with:
        github-token: ${{ secrets.GITHUB_TOKEN }}
        script: |
          const output = `#### Terraform Format and Validate 🖌\`${{ steps.fmt.outcome }}\`
          #### Terraform Plan 📖\`${{ steps.plan.outcome }}\`

          <details><summary>Show Plan</summary>

          \`\`\`\n
          ${process.env.PLAN}
          \`\`\`

          </details>

          *Pushed by: @${{ github.actor }}, Action: \`${{ github.event_name }}\`*`;

          github.rest.issues.createComment({
            issue_number: context.issue.number,
            owner: context.repo.owner,
            repo: context.repo.repo,
            body: output
          })

    - name: Terraform Plan Status
      if: steps.plan.outcome == 'failure'
      run: exit 1

    - name: Terraform Apply
      if: github.ref == 'refs/heads/main' && github.event_name == 'push'
      run: terraform apply -auto-approve tfplan
      working-directory: ${{ env.TF_WORKING_DIR }}

  build-and-deploy:
    name: 'Build and Deploy'
    runs-on: ubuntu-latest
    needs: terraform
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'

    steps:
    - name: Checkout
      uses: actions/checkout@v4

    - name: Authenticate to Google Cloud
      uses: google-github-actions/auth@v2
      with:
        credentials_json: ${{ secrets.GCP_SA_KEY }}

    - name: Set up Cloud SDK
      uses: google-github-actions/setup-gcloud@v2

    - name: Build and Push Web Container
      run: |
        gcloud builds submit --config cloudbuild-web.yaml .

    - name: Build and Push API Container
      run: |
        gcloud builds submit --config cloudbuild-api.yaml .

    - name: Deploy to Cloud Run
      run: |
        gcloud run deploy ${{ env.ENVIRONMENT }}-web \
          --image ${{ env.GCP_REGION }}-docker.pkg.dev/${{ env.GCP_PROJECT_ID }}/${{ env.ENVIRONMENT }}-containers/web:latest \
          --region ${{ env.GCP_REGION }} \
          --platform managed \
          --allow-unauthenticated

        gcloud run deploy ${{ env.ENVIRONMENT }}-api \
          --image ${{ env.GCP_REGION }}-docker.pkg.dev/${{ env.GCP_PROJECT_ID }}/${{ env.ENVIRONMENT }}-containers/api:latest \
          --region ${{ env.GCP_REGION }} \
          --platform managed \
          --allow-unauthenticated
```

#### Cloud Build Configuration

##### cloudbuild-web.yaml
```yaml
steps:
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/web:$COMMIT_SHA', './apps/web']
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/web:$COMMIT_SHA']
  - name: 'gcr.io/google-appengine/exec-wrapper'
    args:
      - '-c'
      - |
        gcloud run deploy web \
          --image gcr.io/$PROJECT_ID/web:$COMMIT_SHA \
          --region us-central1 \
          --platform managed \
          --allow-unauthenticated \
          --set-env-vars "DATABASE_URL=postgresql://saas_user:password@10.0.0.3/saas_db"
```

##### cloudbuild-api.yaml
```yaml
steps:
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/api:$COMMIT_SHA', './apps/api']
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/api:$COMMIT_SHA']
  - name: 'gcr.io/google-appengine/exec-wrapper'
    args:
      - '-c'
      - |
        gcloud run deploy api \
          --image gcr.io/$PROJECT_ID/api:$COMMIT_SHA \
          --region us-central1 \
          --platform managed \
          --allow-unauthenticated \
          --set-env-vars "DATABASE_URL=postgresql://saas_user:password@10.0.0.3/saas_db"
```

## Deployment Procedures

### Initial Setup

1. **Clone Repository:**
   ```bash
   git clone https://github.com/your-org/your-saas-repo.git
   cd your-saas-repo
   ```

2. **Initialize Terraform:**
   ```bash
   cd terraform
   terraform init
   ```

3. **Configure Variables:**
   ```bash
   cp terraform.tfvars.example terraform.tfvars
   # Edit terraform.tfvars with your values
   ```

4. **Plan Deployment:**
   ```bash
   terraform plan -out=tfplan
   ```

5. **Apply Infrastructure:**
   ```bash
   terraform apply tfplan
   ```

### Environment Management

#### Development Environment
```bash
# Switch to dev workspace
terraform workspace select dev

# Or create if it doesn't exist
terraform workspace new dev

# Deploy to dev
terraform apply -var-file=environments/dev/terraform.tfvars
```

#### Production Environment
```bash
# Switch to prod workspace
terraform workspace select prod

# Deploy to prod
terraform apply -var-file=environments/prod/terraform.tfvars
```

### Database Management

#### Run Migrations
```bash
# Connect to database
gcloud sql connect your-instance --user=saas_user --database=saas_db

# Run migrations
cd packages/db
bun run push
```

#### Seed Database
```bash
# Run seed script
cd packages/db
bun run seed
```

#### Backup Database
```bash
# Create manual backup
gcloud sql backups create your-instance-backup \
  --instance=your-instance \
  --description="Manual backup"
```

### Container Deployment

#### Manual Deployment
```bash
# Build and push web container
gcloud builds submit --config cloudbuild-web.yaml .

# Build and push API container
gcloud builds submit --config cloudbuild-api.yaml .

# Deploy services
gcloud run deploy dev-web --image gcr.io/your-project/web:latest --region us-central1
gcloud run deploy dev-api --image gcr.io/your-project/api:latest --region us-central1
```

#### Rollback Deployment
```bash
# List revisions
gcloud run revisions list --service=dev-web

# Rollback to previous revision
gcloud run services update-traffic dev-web \
  --to-revisions=dev-web-00001=100
```

## Security Configuration

### IAM Setup

#### Service Accounts
```hcl
resource "google_service_account" "app" {
  account_id   = "${var.environment}-app"
  display_name = "SaaS Application Service Account"
}

resource "google_project_iam_member" "app_roles" {
  for_each = toset([
    "roles/cloudsql.client",
    "roles/secretmanager.secretAccessor",
    "roles/monitoring.metricWriter",
    "roles/logging.logWriter"
  ])
  project = var.project_id
  role    = each.value
  member  = "serviceAccount:${google_service_account.app.email}"
}
```

#### Secret Management
```hcl
resource "google_secret_manager_secret" "db_password" {
  secret_id = "${var.environment}-db-password"
  replication {
    automatic = true
  }
}

resource "google_secret_manager_secret_version" "db_password" {
  secret      = google_secret_manager_secret.db_password.id
  secret_data = random_password.db_password.result
}
```

### Network Security

#### VPC Configuration
```hcl
resource "google_compute_firewall" "allow_internal" {
  name    = "${var.environment}-allow-internal"
  network = google_compute_network.vpc.name

  allow {
    protocol = "tcp"
    ports    = ["0-65535"]
  }

  allow {
    protocol = "udp"
    ports    = ["0-65535"]
  }

  source_ranges = ["10.0.0.0/24"]
}
```

#### SSL/TLS Configuration
```hcl
resource "google_compute_managed_ssl_certificate" "cert" {
  name = "${var.environment}-ssl-cert"

  managed {
    domains = [var.domain]
  }
}
```

## Monitoring & Observability

### Cloud Monitoring Setup

#### Dashboards
```hcl
resource "google_monitoring_dashboard" "saas_dashboard" {
  dashboard_json = jsonencode({
    displayName = "SaaS Application Dashboard"
    gridLayout = {
      columns = "2"
      widgets = [
        {
          title = "Cloud Run Request Count"
          xyChart = {
            dataSets = [{
              timeSeriesQuery = {
                timeSeriesFilter = {
                  filter = "metric.type=\"run.googleapis.com/request_count\" resource.type=\"cloud_run_revision\""
                }
              }
            }]
          }
        },
        {
          title = "Cloud SQL CPU Utilization"
          xyChart = {
            dataSets = [{
              timeSeriesQuery = {
                timeSeriesFilter = {
                  filter = "metric.type=\"cloudsql.googleapis.com/database/cpu/utilization\" resource.type=\"cloudsql_database\""
                }
              }
            }]
          }
        }
      ]
    }
  })
}
```

#### Alerting Policies
```hcl
resource "google_monitoring_alert_policy" "service_down" {
  display_name = "Service Down Alert"
  combiner     = "OR"

  conditions = [{
    display_name = "Cloud Run instance count is zero"
    condition_threshold = {
      filter          = "metric.type=\"run.googleapis.com/container/instance_count\" resource.type=\"cloud_run_revision\""
      duration        = "300s"
      comparison      = "COMPARISON_LT"
      threshold_value = 1
    }
  }]

  notification_channels = [google_monitoring_notification_channel.email.name]
}

resource "google_monitoring_notification_channel" "email" {
  display_name = "Email Notification Channel"
  type         = "email"
  labels = {
    email_address = var.alert_email
  }
}
```

### Application Monitoring

#### Error Tracking
```typescript
// Sentry configuration in API
import * as Sentry from '@sentry/node'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
})
```

#### Performance Monitoring
```typescript
// Custom metrics
import { monitorEventLoopDelay } from 'perf_hooks'

const monitor = monitorEventLoopDelay()
monitor.enable()

setInterval(() => {
  console.log('Event loop delay:', monitor.mean)
}, 1000)
```

## Cost Optimization

### Resource Optimization

#### Auto-scaling Configuration
```hcl
resource "google_cloud_run_service" "api" {
  # ... other configuration ...

  template {
    metadata {
      annotations = {
        "autoscaling.knative.dev/minScale" = "0"
        "autoscaling.knative.dev/maxScale" = "10"
        "run.googleapis.com/cpu-throttling" = false
      }
    }
    spec {
      containers {
        resources {
          limits = {
            cpu    = "1000m"
            memory = "512Mi"
          }
        }
      }
    }
  }
}
```

#### Database Optimization
```hcl
resource "google_sql_database_instance" "postgres" {
  # ... other configuration ...

  settings {
    tier = var.db_instance_tier

    database_flags {
      name  = "max_connections"
      value = "100"
    }

    database_flags {
      name  = "shared_preload_libraries"
      value = "pg_stat_statements"
    }
  }
}
```

### Budget Management

#### Budget Alerts
```hcl
resource "google_billing_budget" "budget" {
  billing_account = var.billing_account
  display_name    = "Monthly SaaS Budget"

  budget_filter {
    projects = ["projects/${var.project_id}"]
  }

  amount {
    specified_amount {
      currency_code = "USD"
      units         = "100"
    }
  }

  threshold_rules {
    threshold_percent = 0.8
    spend_basis       = "CURRENT_SPEND"
  }

  threshold_rules {
    threshold_percent = 0.9
    spend_basis       = "CURRENT_SPEND"
  }

  threshold_rules {
    threshold_percent = 1.0
    spend_basis       = "CURRENT_SPEND"
  }
}
```

### Cost Monitoring

#### Cost Explorer Queries
```sql
-- Monthly costs by service
SELECT
  service.description,
  SUM(cost) as total_cost,
  SUM(cost) / (SELECT SUM(cost) FROM `project.billing.gcp_billing_export_v1_xxxxxx_xxxxxx_xxxxxx`) * 100 as percentage
FROM `project.billing.gcp_billing_export_v1_xxxxxx_xxxxxx_xxxxxx`
WHERE DATE(_PARTITIONTIME) >= "2024-01-01"
GROUP BY service.description
ORDER BY total_cost DESC
```

## Maintenance Procedures

### Regular Maintenance Tasks

#### Security Updates
```bash
# Update container base images
gcloud builds submit --config cloudbuild-security-update.yaml .

# Update Terraform providers
terraform init -upgrade

# Rotate service account keys
gcloud iam service-accounts keys create new-key.json \
  --iam-account=terraform-deployer@your-project.iam.gserviceaccount.com

# Update secrets
gcloud secrets versions add db-password --data-file=new-password.txt
```

#### Database Maintenance
```bash
# Run VACUUM ANALYZE
gcloud sql connect your-instance --user=saas_user --database=saas_db \
  --command="VACUUM ANALYZE;"

# Update statistics
gcloud sql connect your-instance --user=saas_user --database=saas_db \
  --command="ANALYZE;"

# Check for long-running queries
gcloud sql connect your-instance --user=saas_user --database=saas_db \
  --command="SELECT * FROM pg_stat_activity WHERE state = 'active' AND now() - query_start > interval '1 minute';"
```

#### Performance Optimization
```bash
# Monitor Cloud Run performance
gcloud monitoring metrics list \
  --filter="metric.type=starts_with(\"run.googleapis.com\")"

# Check database performance
gcloud sql instances describe your-instance \
  --format="table(settings.tier,settings.availabilityType,diskSizeGb)"

# Optimize container resources
gcloud run services update your-service \
  --cpu=500m \
  --memory=256Mi \
  --concurrency=50
```

### Backup and Recovery

#### Automated Backups
```hcl
resource "google_sql_database_instance" "postgres" {
  # ... other configuration ...

  settings {
    backup_configuration {
      enabled    = true
      start_time = "02:00"
      location   = var.region

      backup_retention_settings {
        retained_backups = 7
        retention_unit   = "COUNT"
      }
    }
  }
}
```

#### Backup Verification
```bash
# List available backups
gcloud sql backups list --instance=your-instance

# Restore from backup
gcloud sql backups restore your-backup-id \
  --restore-instance=your-restore-instance \
  --backup-instance=your-instance
```

### Monitoring Maintenance

#### Log Retention
```hcl
resource "google_logging_project_sink" "log_sink" {
  name        = "${var.environment}-log-sink"
  destination = "storage.googleapis.com/${google_storage_bucket.logs.name}"

  filter = "resource.type=cloud_run_revision"

  exclusions {
    name        = "exclude-health-checks"
    description = "Exclude health check logs"
    filter      = "httpRequest.status=200 AND resource.labels.service_name=\"health-check\""
  }
}
```

#### Metric Cleanup
```bash
# List custom metrics
gcloud monitoring metrics list --filter="metric.type=starts_with(\"custom.googleapis.com\")"

# Delete unused metrics
gcloud monitoring metrics delete custom.googleapis.com/your-metric
```

## Troubleshooting

### Common Issues

#### Terraform State Lock
```bash
# Check for existing locks
terraform force-unlock LOCK_ID

# Or manually unlock in GCS
gsutil rm gs://your-bucket/terraform/state/default.tflock
```

#### Cloud Run Deployment Failures
```bash
# Check service status
gcloud run services describe your-service --region=us-central1

# View logs
gcloud logging read "resource.type=cloud_run_revision" --limit=50

# Check container health
gcloud run revisions describe your-revision --region=us-central1
```

#### Database Connection Issues
```bash
# Test database connectivity
gcloud sql connect your-instance --user=saas_user --database=saas_db

# Check VPC connectivity
gcloud compute networks vpc-access connectors describe your-connector --region=us-central1

# Verify service account permissions
gcloud projects get-iam-policy your-project \
  --flatten="bindings[].members" \
  --filter="bindings.role:roles/cloudsql.client"
```

#### SSL Certificate Problems
```bash
# Check certificate status
gcloud compute ssl-certificates list

# Renew certificate
gcloud compute ssl-certificates create new-cert \
  --certificate=cert.pem \
  --private-key=key.pem \
  --global

# Update load balancer
gcloud compute target-https-proxies update your-proxy \
  --ssl-certificates=new-cert
```

### Debugging Tools

#### Cloud Logging Queries
```bash
# Search for errors
gcloud logging read "severity>=ERROR" --limit=100

# Filter by service
gcloud logging read "resource.labels.service_name=your-service" --limit=50

# Search for specific text
gcloud logging read "textPayload:ERROR" --limit=20
```

#### Performance Debugging
```bash
# Check Cloud Run metrics
gcloud monitoring metrics list \
  --filter="metric.type=\"run.googleapis.com/request_latencies\""

# Database performance
gcloud sql instances describe your-instance \
  --format="table(settings.tier,settings.dataDiskSizeGb,settings.memorySizeGb)"
```

#### Network Debugging
```bash
# Test VPC connectivity
gcloud compute networks vpc-access connectors describe your-connector

# Check firewall rules
gcloud compute firewall-rules list --filter="network=your-vpc"

# Test internal connectivity
gcloud compute ssh your-instance --zone=us-central1-a --tunnel-through-iap \
  --command="curl -I http://your-service"
```

## Migration Guide

### From Local Development

1. **Export Local Data:**
   ```bash
   pg_dump -U user -h localhost saas_db > backup.sql
   ```

2. **Import to Cloud SQL:**
   ```bash
   gcloud sql import sql your-instance backup.sql --database=saas_db
   ```

3. **Update Environment Variables:**
   ```bash
   # Update DATABASE_URL and other service URLs
   export DATABASE_URL="postgresql://saas_user:password@your-instance:5432/saas_db"
   ```

4. **Test Application:**
   ```bash
   # Run locally with new environment
   bun run dev
   ```

### From Docker Compose

1. **Stop Local Services:**
   ```bash
   docker-compose down
   ```

2. **Update Docker Images:**
   ```bash
   # Build production images
   docker build -t gcr.io/your-project/web:latest ./apps/web
   docker build -t gcr.io/your-project/api:latest ./apps/api
   ```

3. **Push to Registry:**
   ```bash
   gcloud docker -- push gcr.io/your-project/web:latest
   gcloud docker -- push gcr.io/your-project/api:latest
   ```

4. **Deploy to Cloud Run:**
   ```bash
   gcloud run deploy prod-web --image gcr.io/your-project/web:latest
   gcloud run deploy prod-api --image gcr.io/your-project/api:latest
   ```

### From Vercel

1. **Export Data from Vercel Postgres:**
   ```bash
   pg_dump -U user -h vercel-db-host saas_db > vercel-backup.sql
   ```

2. **Import to Cloud SQL:**
   ```bash
   gcloud sql import sql your-instance vercel-backup.sql --database=saas_db
   ```

3. **Update DNS:**
   ```bash
   # Point domain to Cloud Run
   gcloud run domain-mappings create --service=prod-web --domain=yourdomain.com
   ```

4. **Migrate Environment Variables:**
   ```bash
   # Use Secret Manager for sensitive data
   gcloud secrets create api-keys --data-file=keys.json
   ```

## Best Practices

### Infrastructure as Code

#### Code Organization
- Use modules for reusable components
- Follow Terraform naming conventions
- Document all resources and variables
- Use consistent formatting

#### Version Control
```bash
# Commit Terraform changes
git add terraform/
git commit -m "feat: add Cloud SQL database module"

# Use conventional commits
git commit -m "fix: resolve VPC connector issue"
```

#### Code Review
- Require PR reviews for infrastructure changes
- Use automated testing for Terraform code
- Document breaking changes
- Maintain changelog

### Security Best Practices

#### Access Control
- Use least privilege principle
- Rotate service account keys regularly
- Enable audit logging
- Use separate accounts for different environments

#### Data Protection
- Encrypt sensitive data at rest
- Use HTTPS for all communications
- Implement proper backup strategies
- Regular security assessments

### Performance Optimization

#### Application Level
- Implement caching strategies
- Optimize database queries
- Use CDN for static assets
- Monitor and tune resource allocation

#### Infrastructure Level
- Use appropriate instance sizes
- Configure auto-scaling properly
- Implement load balancing
- Monitor resource utilization

### Monitoring and Alerting

#### Proactive Monitoring
- Set up comprehensive dashboards
- Configure meaningful alerts
- Regular performance reviews
- Capacity planning

#### Incident Response
- Document incident response procedures
- Maintain runbooks for common issues
- Regular incident reviews
- Continuous improvement

## Conclusion

This Terraform deployment guide provides a comprehensive framework for deploying the SaaS starter kit to Google Cloud Platform. The modular architecture ensures scalability, security, and maintainability while optimizing costs through efficient resource utilization.

### Key Takeaways

1. **Infrastructure as Code**: Terraform enables version-controlled, reproducible infrastructure deployments
2. **Cost Optimization**: Cloud Run and Cloud SQL provide cost-effective, scalable solutions
3. **Security First**: VPC isolation, IAM, and Secret Manager ensure enterprise-grade security
4. **Monitoring**: Comprehensive monitoring with Cloud Monitoring and application-level observability
5. **CI/CD Integration**: GitHub Actions with Terraform provides automated deployment pipelines

### Next Steps

1. **Start Small**: Begin with development environment deployment
2. **Iterate**: Gradually add features and optimize based on usage patterns
3. **Scale**: Implement production optimizations as traffic grows
4. **Monitor**: Continuously monitor performance and costs
5. **Improve**: Regularly review and update infrastructure based on best practices

### Support and Resources

- **Terraform Documentation**: https://developer.hashicorp.com/terraform
- **Google Cloud Documentation**: https://cloud.google.com/docs
- **Cloud Run Best Practices**: https://cloud.google.com/run/docs/best-practices
- **Terraform Registry**: https://registry.terraform.io/providers/hashicorp/google

---

*This document is maintained alongside the SaaS starter kit codebase. For the latest updates, check the repository's terraform/ directory.*
