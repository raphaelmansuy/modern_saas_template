# Pulumi Deployment Guide: Modern Alternative to Terraform

## Executive Summary

This document provides a comprehensive guide for deploying the SaaS starter kit to Google Cloud Platform using **Pulumi** as a modern alternative to Terraform. Pulumi offers infrastructure as code using familiar programming languages (TypeScript, Python, Go, .NET) instead of HCL, providing better developer experience, type safety, and integration with existing application code.

**Key Benefits of Pulumi over Terraform:**
- **Programming Language Support**: Use TypeScript, Python, Go, or .NET with full IDE support
- **Type Safety**: Compile-time checking and IntelliSense for infrastructure code
- **Better Integration**: Seamless integration with application code and CI/CD pipelines
- **Flexibility**: Loops, conditionals, functions, and modular programming constructs
- **Developer Experience**: Familiar debugging, testing, and version control workflows
- **Multi-Cloud**: Same cloud provider support as Terraform

**Architecture Overview:**
- **Frontend**: Next.js 15 deployed to Cloud Run
- **Backend**: Hono.js API deployed to Cloud Run
- **Database**: PostgreSQL managed by Cloud SQL
- **Networking**: VPC with private connectivity
- **CI/CD**: GitHub Actions with Pulumi integration

## Pulumi Pricing & Licensing

### Open Source Status
✅ **Pulumi is open source** under the Apache License 2.0. The core CLI and SDKs are free and available on GitHub. Pulumi Cloud is the managed SaaS offering with paid tiers.

### Pricing Tiers

#### Individual (Free Forever)

- No credit card required
- Unlimited projects, stacks, and environments
- Unlimited updates and history
- 500 free deployment minutes
- IaC state management

#### Team ($40/month)

- Everything in Individual plus:
- Up to 10 users
- 500 resources included ($0.1825/month for additional)
- Secure collaboration and CI/CD
- AI assistance with Pulumi Copilot
- Resource search, webhooks, automatic secrets rotation
- Community support

#### Enterprise ($400/month)

- Everything in Team plus:
- Unlimited users
- 2,000 resources included ($0.365/month for additional)
- SAML/SSO and RBAC
- Internal developer platform (IDP)
- Audit logs, drift detection, time-to-live stacks
- 12x5 Enterprise Support

#### Business Critical (Custom Pricing)

- Everything in Enterprise plus:
- Self-hosting available
- Compliance policies and org-wide enforcement
- Automatic group & user sync (SCIM)
- 24x7 Enterprise Support
- Volume pricing and invoicing

### Key Limitations

#### SCIM Provisioning

- No secondary emails
- No password sync
- No bulk importing

#### Language Restrictions

- Dynamic providers not supported in Go, .NET, Java, YAML
- Components cannot be written in JavaScript
- Dynamic providers must be used in same language they're authored in
- Python lacks `getOutputDetails` functionality

#### Platform Limitations

- Nested objects in Pulumi ESC limited to depth of 1 (deeper nesting becomes stringified JSON)
- Terraform modules have limitations with transforms, targeted updates, and protecting individual resources
- Deployment queue maximum lifespan of 7 days before being skipped
- Organization-level concurrency limits determined by pricing tier

#### Resource Limits

- No hard limits on resources per stack (unlike CloudFormation's 500-resource limit)
- Free tier: 500 deployment minutes
- Team tier: 500 resources included
- Enterprise tier: 2,000 resources included

## Why Pulumi as an Alternative to Terraform

### Advantages

1. **Familiar Programming Languages**
   - Use TypeScript, Python, Go, or C# instead of learning HCL
   - Full IDE support with IntelliSense, debugging, and refactoring
   - Type checking prevents configuration errors

2. **Better Developer Experience**
   - Standard programming constructs (loops, conditionals, functions)
   - Unit testing of infrastructure code
   - Modular code organization with classes and packages

3. **Seamless Application Integration**
   - Share types and utilities between application and infrastructure code
   - Use the same language for both app and infrastructure
   - Better CI/CD integration with existing workflows

4. **Advanced Features**
   - Dynamic resource creation based on application logic
   - Complex dependency management
   - Integration with existing code libraries

### Comparison with Terraform

| Feature | Terraform | Pulumi |
|---------|-----------|--------|
| Language | HCL (declarative) | TypeScript/Python/Go/C# (imperative) |
| Learning Curve | Medium (HCL syntax) | Low (familiar languages) |
| IDE Support | Limited | Full (debugging, refactoring) |
| Type Safety | Limited | Strong (compile-time checking) |
| Testing | Limited | Full unit/integration testing |
| Code Reuse | Modules | Classes, functions, packages |
| State Management | Built-in | Built-in (similar concepts) |
| Multi-Cloud | Excellent | Excellent |
| Community | Large | Growing rapidly |

## Prerequisites

### Required Tools
- **Pulumi CLI** >= 3.0.0 (`curl -fsSL https://get.pulumi.com | sh`)
- **Google Cloud SDK** (`gcloud` CLI)
- **Node.js** >= 18 (for TypeScript projects)
- **Docker** >= 20.10
- **Bun** >= 1.0.0 (for local development)
- **Git** for version control

### Required Accounts
- **Google Cloud Platform** account with billing enabled
- **GitHub** account for CI/CD
- **Pulumi Cloud** account (free tier available)
- **Domain registrar** account (for custom domains)
- **External services**: Clerk, Stripe, Resend, Sentry, PostHog

### Required Knowledge
- Basic understanding of infrastructure as code concepts
- Familiarity with Google Cloud Platform
- Containerization concepts (Docker)
- Programming in TypeScript, Python, Go, or C#

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
   gcloud iam service-accounts create pulumi-deployer \
     --description="Service account for Pulumi deployments" \
     --display-name="Pulumi Deployer"
   ```

4. **Grant Permissions:**
   ```bash
   gcloud projects add-iam-policy-binding your-saas-project \
     --member="serviceAccount:pulumi-deployer@your-saas-project.iam.gserviceaccount.com" \
     --role="roles/editor"
   ```

5. **Create Service Account Key:**
   ```bash
   gcloud iam service-accounts keys create ~/pulumi-key.json \
     --iam-account=pulumi-deployer@your-saas-project.iam.gserviceaccount.com
   ```

## Pulumi Project Setup

### Initialize Pulumi Project

1. **Create Project Directory:**
   ```bash
   mkdir pulumi-deployment
   cd pulumi-deployment
   ```

2. **Initialize Pulumi Project:**
   ```bash
   pulumi new typescript --name saas-infrastructure --description "SaaS infrastructure deployment"
   ```

3. **Install Dependencies:**
   ```bash
   npm install @pulumi/pulumi @pulumi/gcp
   ```

4. **Configure GCP Provider:**
   ```bash
   pulumi config set gcp:project your-saas-project
   pulumi config set gcp:region us-central1
   pulumi config set --secret gcp:credentials ~/pulumi-key.json
   ```

### Project Structure

```
pulumi-deployment/
├── Pulumi.yaml                 # Pulumi project configuration
├── Pulumi.dev.yaml            # Development stack configuration
├── Pulumi.prod.yaml           # Production stack configuration
├── package.json               # Node.js dependencies
├── tsconfig.json              # TypeScript configuration
├── src/
│   ├── index.ts               # Main infrastructure code
│   ├── vpc.ts                 # VPC and networking
│   ├── database.ts            # Cloud SQL configuration
│   ├── container.ts           # Cloud Run and Artifact Registry
│   ├── security.ts            # IAM and Secret Manager
│   └── monitoring.ts          # Monitoring and logging
└── infrastructure/
    ├── dev/
    └── prod/
```

## Infrastructure Implementation

### Core Configuration Files

#### Pulumi.yaml
```yaml
name: saas-infrastructure
runtime: nodejs
description: SaaS infrastructure deployment using Pulumi
config:
  gcp:project:
    type: string
  gcp:region:
    type: string
    default: us-central1
  environment:
    type: string
    default: dev
```

#### index.ts
```typescript
import * as pulumi from "@pulumi/pulumi";
import * as gcp from "@pulumi/gcp";

// Import infrastructure modules
import { createVpc } from "./vpc";
import { createDatabase } from "./database";
import { createContainerServices } from "./container";
import { createSecurity } from "./security";
import { createMonitoring } from "./monitoring";

// Get configuration
const config = new pulumi.Config();
const environment = config.get("environment") || "dev";
const project = config.require("gcp:project");
const region = config.require("gcp:region");

// Create VPC infrastructure
const vpc = createVpc(environment, project, region);

// Create database
const database = createDatabase(environment, project, region, vpc);

// Create security resources
const security = createSecurity(environment, project);

// Create container services
const containers = createContainerServices(
  environment,
  project,
  region,
  vpc,
  database,
  security
);

// Create monitoring
const monitoring = createMonitoring(environment, project, containers);

// Export outputs
export const webServiceUrl = containers.webService.url;
export const apiServiceUrl = containers.apiService.url;
export const databaseConnectionName = database.instance.connectionName;
```

### VPC Module (vpc.ts)

```typescript
import * as pulumi from "@pulumi/pulumi";
import * as gcp from "@pulumi/gcp";

export function createVpc(
  environment: string,
  project: string,
  region: string
) {
  // Create VPC network
  const network = new gcp.compute.Network(`${environment}-vpc`, {
    name: `${environment}-vpc`,
    autoCreateSubnetworks: false,
  });

  // Create subnet
  const subnet = new gcp.compute.Subnetwork(`${environment}-subnet`, {
    name: `${environment}-subnet`,
    network: network.id,
    ipCidrRange: "10.0.0.0/24",
    region: region,
  });

  // Create VPC connector for Cloud Run
  const vpcConnector = new gcp.vpcaccess.Connector(`${environment}-vpc-connector`, {
    name: `${environment}-vpc-connector`,
    region: region,
    ipCidrRange: "10.8.0.0/28",
    network: network.name,
  });

  // Private service access for Cloud SQL
  const privateIpAddress = new gcp.compute.GlobalAddress(`${environment}-private-ip`, {
    name: `${environment}-private-ip`,
    purpose: "VPC_PEERING",
    addressType: "INTERNAL",
    prefixLength: 16,
    network: network.id,
  });

  const privateVpcConnection = new gcp.servicenetworking.Connection(`${environment}-private-vpc-connection`, {
    network: network.id,
    service: "servicenetworking.googleapis.com",
    reservedPeeringRanges: [privateIpAddress.name],
  });

  return {
    network,
    subnet,
    vpcConnector,
    privateIpAddress,
    privateVpcConnection,
  };
}
```

### Database Module (database.ts)

```typescript
import * as pulumi from "@pulumi/pulumi";
import * as gcp from "@pulumi/gcp";
import * as random from "@pulumi/random";

interface VpcResources {
  network: gcp.compute.Network;
  privateVpcConnection: gcp.servicenetworking.Connection;
}

export function createDatabase(
  environment: string,
  project: string,
  region: string,
  vpc: VpcResources
) {
  // Generate random password
  const dbPassword = new random.RandomPassword(`${environment}-db-password`, {
    length: 16,
    special: true,
  });

  // Create Cloud SQL instance
  const instance = new gcp.sql.DatabaseInstance(`${environment}-postgres`, {
    name: `${environment}-postgres`,
    databaseVersion: "POSTGRES_15",
    region: region,
    settings: {
      tier: "db-f1-micro",
      diskSize: 10,
      ipConfiguration: {
        ipv4Enabled: false,
        privateNetwork: vpc.network.id,
      },
      backupConfiguration: {
        enabled: true,
        startTime: "02:00",
      },
      maintenanceWindow: {
        day: 7,
        hour: 3,
      },
    },
  }, { dependsOn: [vpc.privateVpcConnection] });

  // Create database
  const database = new gcp.sql.Database(`${environment}-database`, {
    name: "saas_db",
    instance: instance.name,
  });

  // Create user
  const user = new gcp.sql.User(`${environment}-user`, {
    name: "saas_user",
    instance: instance.name,
    password: dbPassword.result,
  });

  return {
    instance,
    database,
    user,
    password: dbPassword,
  };
}
```

### Container Module (container.ts)

```typescript
import * as pulumi from "@pulumi/pulumi";
import * as gcp from "@pulumi/gcp";

interface VpcResources {
  vpcConnector: gcp.vpcaccess.Connector;
}

interface DatabaseResources {
  instance: gcp.sql.DatabaseInstance;
  password: pulumi.Output<string>;
}

interface SecurityResources {
  serviceAccount: gcp.serviceaccount.Account;
}

export function createContainerServices(
  environment: string,
  project: string,
  region: string,
  vpc: VpcResources,
  database: DatabaseResources,
  security: SecurityResources
) {
  // Create Artifact Registry repository
  const repository = new gcp.artifactregistry.Repository(`${environment}-containers`, {
    location: region,
    repositoryId: `${environment}-containers`,
    format: "DOCKER",
  });

  // Cloud Run service for web frontend
  const webService = new gcp.cloudrun.Service(`${environment}-web`, {
    name: `${environment}-web`,
    location: region,
    template: {
      spec: {
        containers: [{
          image: pulumi.interpolate`${region}-docker.pkg.dev/${project}/${repository.repositoryId}/web:latest`,
          env: [
            {
              name: "DATABASE_URL",
              value: pulumi.interpolate`postgresql://saas_user:${database.password}@${database.instance.privateIpAddress}/saas_db`,
            },
            {
              name: "NEXT_PUBLIC_API_URL",
              value: "", // Will be set after API service creation
            },
          ],
        }],
        serviceAccountName: security.serviceAccount.email,
      },
      metadata: {
        annotations: {
          "run.googleapis.com/vpc-access-connector": vpc.vpcConnector.name,
        },
      },
    },
    traffics: [{
      percent: 100,
      latestRevision: true,
    }],
  });

  // Cloud Run service for API backend
  const apiService = new gcp.cloudrun.Service(`${environment}-api`, {
    name: `${environment}-api`,
    location: region,
    template: {
      spec: {
        containers: [{
          image: pulumi.interpolate`${region}-docker.pkg.dev/${project}/${repository.repositoryId}/api:latest`,
          env: [
            {
              name: "DATABASE_URL",
              value: pulumi.interpolate`postgresql://saas_user:${database.password}@${database.instance.privateIpAddress}/saas_db`,
            },
          ],
        }],
        serviceAccountName: security.serviceAccount.email,
      },
      metadata: {
        annotations: {
          "run.googleapis.com/vpc-access-connector": vpc.vpcConnector.name,
        },
      },
    },
    traffics: [{
      percent: 100,
      latestRevision: true,
    }],
  });

  // Update web service with API URL
  const updatedWebService = new gcp.cloudrun.Service(`${environment}-web-updated`, {
    name: `${environment}-web`,
    location: region,
    template: {
      spec: {
        containers: [{
          image: pulumi.interpolate`${region}-docker.pkg.dev/${project}/${repository.repositoryId}/web:latest`,
          env: [
            {
              name: "DATABASE_URL",
              value: pulumi.interpolate`postgresql://saas_user:${database.password}@${database.instance.privateIpAddress}/saas_db`,
            },
            {
              name: "NEXT_PUBLIC_API_URL",
              value: apiService.statuses[0].url,
            },
          ],
        }],
        serviceAccountName: security.serviceAccount.email,
      },
      metadata: {
        annotations: {
          "run.googleapis.com/vpc-access-connector": vpc.vpcConnector.name,
        },
      },
    },
    traffics: [{
      percent: 100,
      latestRevision: true,
    }],
  }, { dependsOn: [apiService] });

  // IAM policy for public access to web service
  const webIamPolicy = new gcp.cloudrun.IamPolicy(`${environment}-web-noauth`, {
    location: updatedWebService.location,
    project: project,
    service: updatedWebService.name,
    policyData: JSON.stringify({
      bindings: [{
        role: "roles/run.invoker",
        members: ["allUsers"],
      }],
    }),
  });

  return {
    repository,
    webService: updatedWebService,
    apiService,
    webIamPolicy,
  };
}
```

### Security Module (security.ts)

```typescript
import * as gcp from "@pulumi/gcp";

export function createSecurity(environment: string, project: string) {
  // Create service account
  const serviceAccount = new gcp.serviceaccount.Account(`${environment}-app`, {
    accountId: `${environment}-app`,
    displayName: "SaaS Application Service Account",
  });

  // Grant necessary IAM roles
  const roles = [
    "roles/cloudsql.client",
    "roles/secretmanager.secretAccessor",
    "roles/monitoring.metricWriter",
    "roles/logging.logWriter",
  ];

  const iamMembers = roles.map(role =>
    new gcp.projects.IAMMember(`${environment}-${role.replace("/", "-")}`, {
      project: project,
      role: role,
      member: pulumi.interpolate`serviceAccount:${serviceAccount.email}`,
    })
  );

  return {
    serviceAccount,
    iamMembers,
  };
}
```

### Monitoring Module (monitoring.ts)

```typescript
import * as gcp from "@pulumi/gcp";

interface ContainerResources {
  webService: gcp.cloudrun.Service;
  apiService: gcp.cloudrun.Service;
}

export function createMonitoring(
  environment: string,
  project: string,
  containers: ContainerResources
) {
  // Create monitoring dashboard
  const dashboard = new gcp.monitoring.Dashboard(`${environment}-dashboard`, {
    dashboardJson: JSON.stringify({
      displayName: "SaaS Application Dashboard",
      gridLayout: {
        columns: "2",
        widgets: [
          {
            title: "Cloud Run Request Count",
            xyChart: {
              dataSets: [{
                timeSeriesQuery: {
                  timeSeriesFilter: {
                    filter: `metric.type="run.googleapis.com/request_count" resource.type="cloud_run_revision"`,
                  },
                },
              }],
            },
          },
          {
            title: "Cloud SQL CPU Utilization",
            xyChart: {
              dataSets: [{
                timeSeriesQuery: {
                  timeSeriesFilter: {
                    filter: `metric.type="cloudsql.googleapis.com/database/cpu/utilization" resource.type="cloudsql_database"`,
                  },
                },
              }],
            },
          },
        ],
      },
    }),
  });

  // Create alerting policy
  const alertPolicy = new gcp.monitoring.AlertPolicy(`${environment}-service-down`, {
    displayName: "Service Down Alert",
    combiner: "OR",
    conditions: [{
      displayName: "Cloud Run instance count is zero",
      conditionThreshold: {
        filter: `metric.type="run.googleapis.com/container/instance_count" resource.type="cloud_run_revision"`,
        duration: "300s",
        comparison: "COMPARISON_LT",
        thresholdValue: 1,
      },
    }],
    notificationChannels: [], // Add notification channels as needed
  });

  return {
    dashboard,
    alertPolicy,
  };
}
```

## Deployment Workflow

### Local Development

1. **Login to Pulumi:**
   ```bash
   pulumi login
   ```

2. **Select Stack:**
   ```bash
   pulumi stack select dev
   ```

3. **Preview Changes:**
   ```bash
   pulumi preview
   ```

4. **Deploy Infrastructure:**
   ```bash
   pulumi up
   ```

### Environment Management

#### Development Environment
```bash
# Select dev stack
pulumi stack select dev

# Deploy to dev
pulumi up
```

#### Production Environment
```bash
# Select prod stack
pulumi stack select prod

# Deploy to prod
pulumi up
```

### Container Deployment

#### Build and Push Containers
```bash
# Build web container
docker build -t gcr.io/your-project/web:latest ./apps/web

# Build API container
docker build -t gcr.io/your-project/api:latest ./apps/api

# Push containers
docker push gcr.io/your-project/web:latest
docker push gcr.io/your-project/api:latest
```

## CI/CD Integration

### GitHub Actions Workflow

#### .github/workflows/pulumi.yml
```yaml
name: Pulumi CI/CD

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
  PULUMI_VERSION: '3.0.0'
  GCP_PROJECT_ID: ${{ secrets.GCP_PROJECT_ID }}

jobs:
  pulumi:
    name: 'Pulumi'
    runs-on: ubuntu-latest
    environment: ${{ github.event.inputs.environment || 'dev' }}

    steps:
    - name: Checkout
      uses: actions/checkout@v4

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci
      working-directory: ./pulumi-deployment

    - name: Setup Pulumi
      uses: pulumi/actions@v4
      with:
        pulumi-version: ${{ env.PULUMI_VERSION }}

    - name: Authenticate to Google Cloud
      uses: google-github-actions/auth@v2
      with:
        credentials_json: ${{ secrets.GCP_SA_KEY }}

    - name: Set up Cloud SDK
      uses: google-github-actions/setup-gcloud@v2

    - name: Pulumi preview
      run: |
        pulumi stack select ${{ github.event.inputs.environment || 'dev' }}
        pulumi preview
      working-directory: ./pulumi-deployment

    - name: Pulumi up
      if: github.ref == 'refs/heads/main' && github.event_name == 'push'
      run: |
        pulumi stack select ${{ github.event.inputs.environment || 'dev' }}
        pulumi up --yes
      working-directory: ./pulumi-deployment

  build-and-deploy:
    name: 'Build and Deploy'
    runs-on: ubuntu-latest
    needs: pulumi
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
```

## Migration from Terraform

### Step-by-Step Migration Guide

1. **Analyze Current Terraform Configuration:**
   - Review your existing `.tf` files
   - Identify resources, variables, and outputs
   - Note dependencies and relationships

2. **Create Pulumi Project Structure:**
   ```bash
   mkdir pulumi-migration
   cd pulumi-migration
   pulumi new typescript
   ```

3. **Convert Resources:**
   - Map Terraform resources to Pulumi equivalents
   - Convert HCL syntax to TypeScript
   - Handle variables and locals as TypeScript variables

4. **Migrate State (Optional):**
   ```bash
   # Export Terraform state
   terraform state pull > terraform.tfstate

   # Import resources to Pulumi (manual process)
   pulumi import gcp:compute/network:Network my-network my-network
   ```

5. **Test Migration:**
   ```bash
   # Preview changes
   pulumi preview

   # Deploy and verify
   pulumi up
   ```

6. **Update CI/CD:**
   - Replace Terraform commands with Pulumi
   - Update GitHub Actions workflows
   - Update documentation

### Resource Mapping

| Terraform Resource | Pulumi Resource |
|-------------------|-----------------|
| `google_compute_network` | `gcp.compute.Network` |
| `google_compute_subnetwork` | `gcp.compute.Subnetwork` |
| `google_sql_database_instance` | `gcp.sql.DatabaseInstance` |
| `google_cloud_run_service` | `gcp.cloudrun.Service` |
| `google_service_account` | `gcp.serviceaccount.Account` |
| `google_secret_manager_secret` | `gcp.secretmanager.Secret` |

## Best Practices

### Code Organization

1. **Modular Structure:**
   - Separate concerns into different files
   - Use TypeScript interfaces for complex types
   - Export reusable functions and classes

2. **Configuration Management:**
   ```typescript
   const config = new pulumi.Config();
   const environment = config.get("environment") || "dev";
   ```

3. **Error Handling:**
   ```typescript
   try {
     const resource = new gcp.compute.Instance("my-instance", { ... });
   } catch (error) {
     console.error("Failed to create instance:", error);
   }
   ```

### Security Best Practices

1. **Secret Management:**
   ```typescript
   const dbPassword = config.requireSecret("dbPassword");
   ```

2. **IAM Least Privilege:**
   - Grant minimal required permissions
   - Use service accounts with specific roles
   - Rotate credentials regularly

3. **Network Security:**
   - Use VPC isolation
   - Configure firewall rules appropriately
   - Enable VPC Service Controls

### Performance Optimization

1. **Resource Dependencies:**
   ```typescript
   const service = new gcp.cloudrun.Service("my-service", { ... }, {
     dependsOn: [database, network],
   });
   ```

2. **Parallel Execution:**
   - Pulumi automatically parallelizes independent resources
   - Use `pulumi.all()` for dependent operations

3. **Caching:**
   - Use Pulumi's built-in caching
   - Avoid unnecessary resource recreation

## Cost Optimization

### Resource Optimization

1. **Auto-scaling Configuration:**
   ```typescript
   const service = new gcp.cloudrun.Service("my-service", {
     template: {
       metadata: {
         annotations: {
           "autoscaling.knative.dev/minScale": "0",
           "autoscaling.knative.dev/maxScale": "10",
         },
       },
     },
   });
   ```

2. **Database Optimization:**
   ```typescript
   const instance = new gcp.sql.DatabaseInstance("postgres", {
     settings: {
       tier: "db-f1-micro", // Use appropriate tier
       diskAutoresize: true,
       diskAutoresizeLimit: 100,
     },
   });
   ```

### Budget Management

```typescript
const budget = new gcp.billing.Budget("monthly-budget", {
  billingAccount: config.require("billingAccount"),
  displayName: "Monthly SaaS Budget",
  budgetFilter: {
    projects: [`projects/${project}`],
  },
  amount: {
    specifiedAmount: {
      currencyCode: "USD",
      units: "100",
    },
  },
  thresholdRules: [
    { thresholdPercent: 0.8, spendBasis: "CURRENT_SPEND" },
    { thresholdPercent: 0.9, spendBasis: "CURRENT_SPEND" },
    { thresholdPercent: 1.0, spendBasis: "CURRENT_SPEND" },
  ],
});
```

## Monitoring and Observability

### Application Monitoring

1. **Custom Metrics:**
   ```typescript
   // Add custom metrics to your application
   import { monitorEventLoopDelay } from 'perf_hooks';

   const monitor = monitorEventLoopDelay();
   monitor.enable();
   ```

2. **Logging:**
   ```typescript
   // Structured logging
   console.log(JSON.stringify({
     level: "info",
     message: "Service started",
     service: "api",
     timestamp: new Date().toISOString(),
   }));
   ```

### Infrastructure Monitoring

1. **Dashboards:**
   - Create custom dashboards for key metrics
   - Monitor Cloud Run performance
   - Track database utilization

2. **Alerting:**
   - Set up alerts for service downtime
   - Monitor resource utilization
   - Alert on budget thresholds

## Troubleshooting

### Common Issues

1. **Authentication Errors:**
   ```bash
   gcloud auth application-default login
   pulumi config set gcp:credentials <path-to-key>
   ```

2. **Resource Conflicts:**
   ```bash
   pulumi refresh  # Sync with actual cloud state
   pulumi preview  # See planned changes
   ```

3. **Dependency Issues:**
   ```typescript
   // Explicit dependencies
   const service = new gcp.cloudrun.Service("my-service", { ... }, {
     dependsOn: [database],
   });
   ```

### Debugging Tools

1. **Pulumi Logs:**
   ```bash
   pulumi logs -f  # Follow logs
   pulumi logs --since 1h  # Recent logs
   ```

2. **Stack Outputs:**
   ```bash
   pulumi stack output  # View outputs
   ```

3. **State Inspection:**
   ```bash
   pulumi stack export  # Export state
   ```

## Conclusion

Pulumi provides a modern, developer-friendly alternative to Terraform for infrastructure as code. By using familiar programming languages and providing better integration with application development workflows, Pulumi enables teams to manage infrastructure more effectively and with greater confidence.

### Key Takeaways

1. **Programming Languages**: Use TypeScript, Python, Go, or C# instead of HCL
2. **Type Safety**: Compile-time checking prevents configuration errors
3. **Developer Experience**: Full IDE support with debugging and refactoring
4. **Integration**: Seamless integration with application code and CI/CD
5. **Flexibility**: Advanced programming constructs for complex scenarios
6. **Multi-Cloud**: Same cloud provider support as Terraform

### Next Steps

1. **Start Small**: Begin with a development environment deployment
2. **Migrate Gradually**: Convert Terraform configurations incrementally
3. **Leverage Type Safety**: Use TypeScript interfaces for configuration
4. **Integrate Testing**: Add unit tests for infrastructure code
5. **Scale**: Implement production optimizations as traffic grows

### Resources

- **Pulumi Documentation**: https://www.pulumi.com/docs/
- **Pulumi GCP Provider**: https://www.pulumi.com/registry/packages/gcp/
- **Google Cloud Documentation**: https://cloud.google.com/docs
- **Pulumi Examples**: https://github.com/pulumi/examples

---

*This document provides a comprehensive alternative to Terraform deployment using Pulumi. For the latest updates, check the Pulumi documentation and examples.*
