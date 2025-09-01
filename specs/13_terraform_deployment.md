# Terraform Deployment Guide for SaaS Starter Kit

## Terraform Overview

### Open Source Foundation

This deployment guide utilizes **Terraform Open Source**, the free and open-source version of HashiCorp's infrastructure as code tool. Terraform CLI is licensed under the Mozilla Public License (MPL) 2.0 and is available for download from the official HashiCorp GitHub repository.

**Key Characteristics:**

- **Free to use**: No licensing fees or subscription costs
- **Community-driven**: Active development and contributions from the global community
- **Vendor-neutral**: Supports multiple cloud providers and infrastructure platforms
- **Declarative syntax**: Define infrastructure as code using HCL (HashiCorp Configuration Language)

### Open Source Version Limitations

While Terraform Open Source provides powerful infrastructure automation capabilities, it has certain limitations compared to the commercial Terraform Cloud and Terraform Enterprise offerings:

#### Collaboration & Team Features

- **No built-in team management**: Manual coordination required for multi-user environments
- **No shared workspaces**: Each user maintains their own state and configuration
- **No access controls**: No granular permissions for different team members
- **No audit trails**: Limited visibility into who made what changes when

#### Remote State Management

- **Manual backend configuration**: Must manually set up and manage remote state backends (S3, GCS, etc.)
- **No hosted state storage**: No HashiCorp-hosted state management service
- **State locking**: Requires manual implementation of locking mechanisms
- **No state history**: Limited ability to track state changes over time

#### Web Interface & Automation

- **No web UI**: All operations performed via command line
- **No visual plan/review**: Plans and changes viewed as text output only
- **No automated runs**: No triggered runs based on VCS changes
- **No API access**: No REST API for integration with other tools

#### Governance & Security

- **No policy enforcement**: No Sentinel policy as code capabilities
- **No cost estimation**: No built-in cost analysis for infrastructure changes
- **No SSO integration**: No single sign-on or enterprise authentication
- **Limited audit logging**: No centralized audit trails for infrastructure changes

#### Enterprise Features

- **No private module registry**: No hosted registry for sharing private modules
- **No agent support**: No support for running in isolated environments
- **No advanced networking**: Limited support for complex network topologies
- **No compliance reporting**: No built-in compliance and governance reporting

### When to Use Terraform Open Source

Terraform Open Source is ideal for:

- **Individual developers**: Solo projects or personal infrastructure
- **Small teams**: Teams that can coordinate manually
- **Learning and experimentation**: Understanding infrastructure as code concepts
- **CI/CD integration**: Automated deployments via pipelines
- **Cost-conscious organizations**: Avoiding subscription fees
- **Vendor-neutral deployments**: Multi-cloud or hybrid cloud scenarios

### Alternatives for Enterprise Needs

If your organization requires the features listed above, consider:

#### Terraform Cloud (SaaS)

- Hosted service with web UI
- Team collaboration features
- Remote state management
- Policy enforcement
- Cost estimation
- Free tier available with limitations

#### Terraform Enterprise (Self-hosted)

- All Terraform Cloud features
- Self-hosted deployment
- Advanced security and compliance
- Custom integrations
- Enterprise support

### Migration Considerations

When starting with Terraform Open Source, consider:

- **State management strategy**: Plan for remote state from day one
- **Team coordination**: Establish processes for collaboration
- **CI/CD integration**: Automate as much as possible
- **Module sharing**: Use Git repositories for module distribution
- **Future scaling**: Design with enterprise migration in mind

This guide focuses on Terraform Open Source while providing guidance that can scale to enterprise deployments when needed.

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

## Architecture Diagrams

This section provides a comprehensive architectural overview of the SaaS starter kit, organized from high-level concepts down to detailed implementation schemas. Each diagram builds upon the previous one, providing increasing levels of detail and technical specificity.

### Level 1: High-Level System Overview

#### System Context Diagram

```mermaid
graph TB
    subgraph "External Environment"
        U[End Users<br/>Web Browsers]
        EXT[External Systems<br/>Payment Processors<br/>Email Services<br/>Analytics]
    end
    
    subgraph "SaaS Platform Boundary"
        WEB[Web Application<br/>Next.js Frontend]
        API[API Backend<br/>Hono.js Services]
        DB[(Database<br/>PostgreSQL)]
        INF[Infrastructure<br/>Google Cloud Platform]
    end
    
    subgraph "Supporting Services"
        AUTH[Authentication<br/>Clerk]
        PAY[Payments<br/>Stripe]
        EMAIL[Email<br/>Resend]
        MON[Monitoring<br/>Sentry + PostHog]
    end
    
    U --> WEB
    WEB --> API
    API --> DB
    API --> AUTH
    API --> PAY
    API --> EMAIL
    API --> MON
    EXT --> API
    
    WEB --> INF
    API --> INF
    DB --> INF
    
    style U fill:#E3F2FD,stroke:#1976D2,stroke-width:2px,color:#0D47A1
    style WEB fill:#E8F5E8,stroke:#2E7D32,stroke-width:2px,color:#1B5E20
    style API fill:#FFF3E0,stroke:#EF6C00,stroke-width:2px,color:#BF360C
    style DB fill:#FCE4EC,stroke:#C2185B,stroke-width:2px,color:#880E4F
    style INF fill:#F3E5F5,stroke:#8E24AA,stroke-width:2px,color:#4A148C
    style AUTH fill:#FFF8E1,stroke:#F57F17,stroke-width:2px,color:#E65100
    style PAY fill:#E3F2FD,stroke:#0277BD,stroke-width:2px,color:#01579B
    style EMAIL fill:#F3E5F5,stroke:#7B1FA2,stroke-width:2px,color:#4A148C
    style MON fill:#E8F5E8,stroke:#558B2F,stroke-width:2px,color:#2E7D32
    style EXT fill:#FFEBEE,stroke:#D32F2F,stroke-width:2px,color:#B71C1C
```

#### Technology Stack Overview

```mermaid
graph LR
    subgraph "Frontend Layer"
        NX[Next.js 15<br/>React Framework]
        TW[Tailwind CSS<br/>Styling]
        ZU[Zustand<br/>State Management]
        SH[shadcn/ui<br/>Component Library]
    end
    
    subgraph "Backend Layer"
        HO[Hono.js<br/>API Framework]
        DR[Drizzle ORM<br/>Database Layer]
        TS[TypeScript<br/>Type Safety]
    end
    
    subgraph "Infrastructure Layer"
        TF[Terraform<br/>IaC]
        GC[Google Cloud<br/>Platform]
        DC[Docker<br/>Containers]
    end
    
    subgraph "External Services"
        CL[Clerk<br/>Authentication]
        ST[Stripe<br/>Payments]
        RE[Resend<br/>Email]
        SE[Sentry<br/>Monitoring]
        PH[PostHog<br/>Analytics]
    end
    
    NX --> HO
    HO --> DR
    DR --> GC
    TF --> GC
    DC --> GC
    
    HO --> CL
    HO --> ST
    HO --> RE
    HO --> SE
    HO --> PH
    
    style NX fill:#E8F5E8,stroke:#2E7D32,stroke-width:2px,color:#1B5E20
    style HO fill:#FFF3E0,stroke:#EF6C00,stroke-width:2px,color:#BF360C
    style TF fill:#E8F5E8,stroke:#388E3C,stroke-width:2px,color:#1B5E20
    style GC fill:#E3F2FD,stroke:#1976D2,stroke-width:2px,color:#0D47A1
    style CL fill:#FFF8E1,stroke:#F57F17,stroke-width:2px,color:#E65100
    style ST fill:#E3F2FD,stroke:#0277BD,stroke-width:2px,color:#01579B
    style SE fill:#E8F5E8,stroke:#558B2F,stroke-width:2px,color:#2E7D32
```

### Level 2: Application Architecture

#### Application Component Architecture

```mermaid
graph TB
    subgraph "User Interface Layer"
        WEB[Next.js Web App<br/>Port 3000]
        DASH[Dashboard<br/>User Portal]
        AUTH[Authentication<br/>Clerk Integration]
        PAY[Payment UI<br/>Stripe Elements]
    end
    
    subgraph "API Layer"
        API[Hono.js API<br/>Port 3001]
        ROUTES[REST Routes<br/>/api/*]
        MW[Middleware<br/>Auth, CORS, Validation]
        CTRL[Controllers<br/>Business Logic]
    end
    
    subgraph "Data Layer"
        ORM[Drizzle ORM<br/>Type-Safe Queries]
        SCHEMA[Database Schema<br/>Users, Products, Orders]
        MIGR[Migrations<br/>Schema Evolution]
    end
    
    subgraph "Integration Layer"
        CLERK[Clerk SDK<br/>User Management]
        STRIPE[Stripe SDK<br/>Payment Processing]
        RESEND[Resend SDK<br/>Email Delivery]
        SENTRY[Sentry SDK<br/>Error Tracking]
        POSTHOG[PostHog SDK<br/>Analytics]
    end
    
    WEB --> API
    DASH --> AUTH
    AUTH --> CLERK
    PAY --> STRIPE
    
    API --> ROUTES
    ROUTES --> MW
    MW --> CTRL
    CTRL --> ORM
    
    ORM --> SCHEMA
    SCHEMA --> MIGR
    
    CTRL --> CLERK
    CTRL --> STRIPE
    CTRL --> RESEND
    CTRL --> SENTRY
    CTRL --> POSTHOG
    
    style WEB fill:#E8F5E8,stroke:#2E7D32,stroke-width:2px,color:#1B5E20
    style API fill:#FFF3E0,stroke:#EF6C00,stroke-width:2px,color:#BF360C
    style ORM fill:#FCE4EC,stroke:#C2185B,stroke-width:2px,color:#880E4F
    style CLERK fill:#FFF8E1,stroke:#F57F17,stroke-width:2px,color:#E65100
    style STRIPE fill:#E3F2FD,stroke:#0277BD,stroke-width:2px,color:#01579B
    style SENTRY fill:#E8F5E8,stroke:#558B2F,stroke-width:2px,color:#2E7D32
```

#### Application Data Flow Architecture

```mermaid
sequenceDiagram
    participant U as User
    participant W as Next.js Frontend
    participant A as Hono.js API
    participant DB as PostgreSQL Database
    participant C as Clerk Auth
    participant S as Stripe Payments
    participant R as Resend Email
    participant SE as Sentry Monitoring
    participant P as PostHog Analytics
    
    U->>W: Access Application
    W->>C: Check Authentication
    C-->>W: User Session/Token
    
    W->>A: API Request (Authenticated)
    A->>C: Validate Token
    C-->>A: User Context
    
    A->>DB: Database Query
    DB-->>A: Query Results
    
    alt Payment Required
        A->>S: Process Payment
        S-->>A: Payment Confirmation
    end
    
    alt Email Required
        A->>R: Send Email
        R-->>A: Email Sent
    end
    
    A->>SE: Log Events/Errors
    A->>P: Track User Actions
    
    A-->>W: API Response
    W-->>U: Rendered Page
    
    Note over U,P: Complete request-response cycle with all integrations
    
    rect rgb(240, 248, 255)
        Note over W,A: Frontend-Backend Communication
    end
    
    rect rgb(255, 248, 220)
        Note over A,DB: Data Access Layer
    end
    
    rect rgb(255, 240, 245)
        Note over A,S: Payment Integration
    end
    
    rect rgb(248, 255, 248)
        Note over A,R: Email Integration
    end
    
    rect rgb(255, 250, 240)
        Note over A,SE: Monitoring Integration
    end
```

### Level 3: Infrastructure Architecture

#### Google Cloud Platform Architecture

```mermaid
graph TB
    subgraph "Global Resources"
        PROJ[Google Cloud Project<br/>your-saas-project]
        BILL[Billing Account<br/>Cost Management]
        ORG[Organization<br/>Resource Hierarchy]
    end
    
    subgraph "Regional Resources"
        REGION[us-central1 Region<br/>Primary Region]
        ZONE[Zone Configuration<br/>Multi-zone Setup]
    end
    
    subgraph "Compute Resources"
        CRW[Cloud Run Web Service<br/>Frontend Container]
        CRA[Cloud Run API Service<br/>Backend Container]
        AR[Artifact Registry<br/>Container Images]
        BUILD[Cloud Build<br/>CI/CD Pipeline]
    end
    
    subgraph "Data Resources"
        SQL[Cloud SQL PostgreSQL<br/>Managed Database]
        SM[Secret Manager<br/>Encrypted Secrets]
        GS[Cloud Storage<br/>File Storage]
    end
    
    subgraph "Network Resources"
        VPC[VPC Network<br/>Private Networking]
        SUB[Subnets<br/>Regional Isolation]
        LB[Cloud Load Balancer<br/>Traffic Distribution]
        CERT[SSL Certificates<br/>HTTPS Encryption]
    end
    
    subgraph "Security & Identity"
        IAM[IAM Service Accounts<br/>Access Control]
        SA[Service Accounts<br/>Application Identity]
        KEYS[Service Account Keys<br/>Authentication]
    end
    
    subgraph "Monitoring & Logging"
        CM[Cloud Monitoring<br/>Metrics & Alerts]
        CL[Cloud Logging<br/>Centralized Logs]
        TRACE[Cloud Trace<br/>Performance Monitoring]
    end
    
    PROJ --> REGION
    REGION --> CRW
    REGION --> CRA
    REGION --> SQL
    REGION --> VPC
    
    CRW --> AR
    CRA --> AR
    AR --> BUILD
    
    SQL --> VPC
    VPC --> SUB
    SUB --> LB
    LB --> CERT
    
    CRW --> IAM
    CRA --> IAM
    IAM --> SA
    SA --> KEYS
    
    CRW --> CM
    CRA --> CM
    SQL --> CM
    VPC --> CM
    
    CRW --> CL
    CRA --> CL
    SQL --> CL
    IAM --> CL
    
    style PROJ fill:#E3F2FD,stroke:#1976D2,stroke-width:3px,color:#0D47A1
    style REGION fill:#E3F2FD,stroke:#1976D2,stroke-width:2px,color:#0D47A1
    style CRW fill:#E8F5E8,stroke:#2E7D32,stroke-width:2px,color:#1B5E20
    style CRA fill:#FFF3E0,stroke:#EF6C00,stroke-width:2px,color:#BF360C
    style SQL fill:#FCE4EC,stroke:#C2185B,stroke-width:2px,color:#880E4F
    style VPC fill:#F3E5F5,stroke:#8E24AA,stroke-width:2px,color:#4A148C
    style IAM fill:#FFF8E1,stroke:#F57F17,stroke-width:2px,color:#E65100
    style CM fill:#E8F5E8,stroke:#388E3C,stroke-width:2px,color:#1B5E20
    style CL fill:#E8F5E8,stroke:#388E3C,stroke-width:2px,color:#1B5E20
```

#### Detailed Infrastructure Components

```mermaid
graph TB
    subgraph "Google Cloud Project"
        subgraph "Networking Infrastructure"
            VPC[VPC Network<br/>10.0.0.0/24]
            SUBNET[Regional Subnet<br/>10.0.0.0/24]
            CONNECTOR[VPC Connector<br/>10.8.0.0/28]
            PSA[Private Service Access<br/>VPC Peering]
            NAT[Cloud NAT<br/>Outbound Traffic]
            ROUTER[Cloud Router<br/>Network Routing]
        end
        
        subgraph "Compute Infrastructure"
            WEB_SERVICE[Cloud Run Web<br/>Frontend Service]
            API_SERVICE[Cloud Run API<br/>Backend Service]
            ARTIFACT_REGISTRY[Artifact Registry<br/>Container Repository]
            CLOUD_BUILD[Cloud Build<br/>Build Pipeline]
        end
        
        subgraph "Database Infrastructure"
            CLOUD_SQL[Cloud SQL Instance<br/>PostgreSQL 15]
            DATABASE[saas_db<br/>Application Database]
            DATABASE_USER[saas_user<br/>Application User]
            BACKUP[Automated Backups<br/>Daily @ 02:00]
            MAINTENANCE[Maintenance Window<br/>Weekly Updates]
        end
        
        subgraph "Security Infrastructure"
            SERVICE_ACCOUNT[terraform-deployer<br/>Deployment SA]
            SECRET_MANAGER[Secret Manager<br/>API Keys & Secrets]
            IAM_ROLES[IAM Roles<br/>Least Privilege]
            FIREWALL_RULES[VPC Firewall<br/>Traffic Control]
        end
        
        subgraph "Storage & Monitoring"
            GCS_BUCKET[GCS Bucket<br/>Terraform State]
            CLOUD_MONITORING[Cloud Monitoring<br/>Dashboards & Alerts]
            CLOUD_LOGGING[Cloud Logging<br/>Centralized Logs]
            CLOUD_TRACE[Cloud Trace<br/>Performance Tracing]
        end
    end
    
    VPC --> SUBNET
    SUBNET --> CONNECTOR
    CONNECTOR --> WEB_SERVICE
    CONNECTOR --> API_SERVICE
    CONNECTOR --> PSA
    PSA --> CLOUD_SQL
    
    ARTIFACT_REGISTRY --> WEB_SERVICE
    ARTIFACT_REGISTRY --> API_SERVICE
    CLOUD_BUILD --> ARTIFACT_REGISTRY
    
    CLOUD_SQL --> DATABASE
    DATABASE --> DATABASE_USER
    CLOUD_SQL --> BACKUP
    CLOUD_SQL --> MAINTENANCE
    
    SERVICE_ACCOUNT --> WEB_SERVICE
    SERVICE_ACCOUNT --> API_SERVICE
    SERVICE_ACCOUNT --> CLOUD_SQL
    SECRET_MANAGER --> WEB_SERVICE
    SECRET_MANAGER --> API_SERVICE
    
    GCS_BUCKET --> TF[(Terraform<br/>Remote State)]
    
    WEB_SERVICE --> CLOUD_MONITORING
    API_SERVICE --> CLOUD_MONITORING
    CLOUD_SQL --> CLOUD_MONITORING
    
    WEB_SERVICE --> CLOUD_LOGGING
    API_SERVICE --> CLOUD_LOGGING
    CLOUD_SQL --> CLOUD_LOGGING
    
    style VPC fill:#E3F2FD,stroke:#1976D2,stroke-width:2px,color:#0D47A1
    style SUBNET fill:#E3F2FD,stroke:#1976D2,stroke-width:2px,color:#0D47A1
    style CONNECTOR fill:#E3F2FD,stroke:#1976D2,stroke-width:2px,color:#0D47A1
    style PSA fill:#E3F2FD,stroke:#1976D2,stroke-width:2px,color:#0D47A1
    style WEB_SERVICE fill:#E8F5E8,stroke:#2E7D32,stroke-width:2px,color:#1B5E20
    style API_SERVICE fill:#FFF3E0,stroke:#EF6C00,stroke-width:2px,color:#BF360C
    style ARTIFACT_REGISTRY fill:#F3E5F5,stroke:#8E24AA,stroke-width:2px,color:#4A148C
    style CLOUD_SQL fill:#FCE4EC,stroke:#C2185B,stroke-width:2px,color:#880E4F
    style DATABASE fill:#FCE4EC,stroke:#C2185B,stroke-width:2px,color:#880E4F
    style DATABASE_USER fill:#FCE4EC,stroke:#C2185B,stroke-width:2px,color:#880E4F
    style SERVICE_ACCOUNT fill:#FFF8E1,stroke:#F57F17,stroke-width:2px,color:#E65100
    style SECRET_MANAGER fill:#FFF8E1,stroke:#F57F17,stroke-width:2px,color:#E65100
    style IAM_ROLES fill:#FFF8E1,stroke:#F57F17,stroke-width:2px,color:#E65100
    style GCS_BUCKET fill:#E8F5E8,stroke:#388E3C,stroke-width:2px,color:#1B5E20
    style CLOUD_MONITORING fill:#E8F5E8,stroke:#388E3C,stroke-width:2px,color:#1B5E20
    style CLOUD_LOGGING fill:#E8F5E8,stroke:#388E3C,stroke-width:2px,color:#1B5E20
    style TF fill:#E8F5E8,stroke:#388E3C,stroke-width:2px,color:#1B5E20
```

### Level 4: Network Architecture

#### VPC Network Architecture

```mermaid
graph TB
    subgraph "Internet"
        INTERNET[Public Internet<br/>External Traffic]
    end
    
    subgraph "Google Cloud Load Balancer"
        CLB[Cloud Load Balancer<br/>Global Load Balancer]
        SSL[SSL/TLS Termination<br/>Certificate Management]
        CDN[CDN Distribution<br/>Global Edge Network]
    end
    
    subgraph "VPC Network (10.0.0.0/24)"
        IGW[Internet Gateway<br/>Public Access]
        NATGW[Cloud NAT Gateway<br/>Outbound Traffic]
        ROUTES[Route Tables<br/>Traffic Routing]
        
        subgraph "Public Subnet"
            PUBLIC_SUB[Public Subnet<br/>10.0.1.0/24]
            WEB_SERVICE[Cloud Run Web<br/>Public Access]
        end
        
        subgraph "Private Subnet"
            PRIVATE_SUB[Private Subnet<br/>10.0.2.0/24]
            API_SERVICE[Cloud Run API<br/>Private Access]
            CLOUD_SQL[Cloud SQL<br/>Database Access]
        end
        
        subgraph "Serverless VPC Access"
            VPC_CONNECTOR[VPC Connector<br/>10.8.0.0/28]
            SERVERLESS_BRIDGE[Serverless Bridge<br/>Cloud Run Access]
        end
    end
    
    subgraph "Private Service Access"
        PSA_NETWORK[Private Service Access<br/>VPC Peering]
        GOOGLE_SERVICES[Google Managed Services<br/>Cloud SQL, etc.]
    end
    
    INTERNET --> CLB
    CLB --> SSL
    SSL --> IGW
    IGW --> PUBLIC_SUB
    PUBLIC_SUB --> WEB_SERVICE
    
    IGW --> NATGW
    NATGW --> PRIVATE_SUB
    PRIVATE_SUB --> API_SERVICE
    PRIVATE_SUB --> CLOUD_SQL
    
    API_SERVICE --> VPC_CONNECTOR
    VPC_CONNECTOR --> SERVERLESS_BRIDGE
    SERVERLESS_BRIDGE --> PRIVATE_SUB
    
    PRIVATE_SUB --> PSA_NETWORK
    PSA_NETWORK --> GOOGLE_SERVICES
    
    style INTERNET fill:#FFEBEE,stroke:#D32F2F,stroke-width:2px,color:#B71C1C
    style CLB fill:#E3F2FD,stroke:#1976D2,stroke-width:2px,color:#0D47A1
    style SSL fill:#E3F2FD,stroke:#1976D2,stroke-width:2px,color:#0D47A1
    style IGW fill:#F3E5F5,stroke:#8E24AA,stroke-width:2px,color:#4A148C
    style NATGW fill:#F3E5F5,stroke:#8E24AA,stroke-width:2px,color:#4A148C
    style PUBLIC_SUB fill:#E8F5E8,stroke:#2E7D32,stroke-width:2px,color:#1B5E20
    style PRIVATE_SUB fill:#FFF3E0,stroke:#EF6C00,stroke-width:2px,color:#BF360C
    style VPC_CONNECTOR fill:#F3E5F5,stroke:#8E24AA,stroke-width:2px,color:#4A148C
    style PSA_NETWORK fill:#FCE4EC,stroke:#C2185B,stroke-width:2px,color:#880E4F
    style WEB_SERVICE fill:#E8F5E8,stroke:#2E7D32,stroke-width:2px,color:#1B5E20
    style API_SERVICE fill:#FFF3E0,stroke:#EF6C00,stroke-width:2px,color:#BF360C
    style CLOUD_SQL fill:#FCE4EC,stroke:#C2185B,stroke-width:2px,color:#880E4F
```

#### Network Security Architecture

```mermaid
graph TB
    subgraph "External Threats"
        ATTACKERS[Internet Attackers<br/>Malicious Traffic]
        DDOS[DDoS Attacks<br/>Volumetric Attacks]
        MALWARE[Malware & Exploits<br/>Application Attacks]
    end
    
    subgraph "Google Cloud Armor"
        WAF[Web Application Firewall<br/>OWASP Protection]
        RATE_LIMIT[Rate Limiting<br/>DDoS Protection]
        GEO_BLOCK[Geographic Blocking<br/>IP Restrictions]
    end
    
    subgraph "Cloud Load Balancer Security"
        SSL_TLS[SSL/TLS Termination<br/>Encryption in Transit]
        CERT_VALIDATION[Certificate Validation<br/>Domain Verification]
        HEALTH_CHECKS[Health Checks<br/>Service Availability]
    end
    
    subgraph "VPC Security"
        FIREWALL[VPC Firewall Rules<br/>Traffic Control]
        SECURITY_GROUPS[Security Groups<br/>Instance-level Control]
        NETWORK_ACLS[Network ACLs<br/>Subnet-level Control]
    end
    
    subgraph "Identity & Access Security"
        IAM[IAM Policies<br/>Service Accounts]
        AUTHENTICATION[Authentication<br/>Clerk Integration]
        AUTHORIZATION[Authorization<br/>Role-based Access]
    end
    
    subgraph "Data Security"
        ENCRYPTION[Data Encryption<br/>At Rest & In Transit]
        SECRET_MANAGER[Secret Manager<br/>API Keys & Secrets]
        DATABASE_ENCRYPTION[Database Encryption<br/>Cloud SQL Security]
    end
    
    subgraph "Monitoring & Response"
        SECURITY_MONITORING[Security Monitoring<br/>Threat Detection]
        LOG_ANALYSIS[Log Analysis<br/>Security Events]
        INCIDENT_RESPONSE[Incident Response<br/>Automated Alerts]
    end
    
    ATTACKERS --> WAF
    DDOS --> RATE_LIMIT
    MALWARE --> WAF
    
    WAF --> SSL_TLS
    RATE_LIMIT --> SSL_TLS
    GEO_BLOCK --> SSL_TLS
    
    SSL_TLS --> FIREWALL
    FIREWALL --> IAM
    IAM --> AUTHENTICATION
    AUTHENTICATION --> AUTHORIZATION
    
    AUTHORIZATION --> ENCRYPTION
    ENCRYPTION --> SECRET_MANAGER
    SECRET_MANAGER --> DATABASE_ENCRYPTION
    
    DATABASE_ENCRYPTION --> SECURITY_MONITORING
    SECURITY_MONITORING --> LOG_ANALYSIS
    LOG_ANALYSIS --> INCIDENT_RESPONSE
    
    style ATTACKERS fill:#FFEBEE,stroke:#D32F2F,stroke-width:2px,color:#B71C1C
    style WAF fill:#FFF8E1,stroke:#F57F17,stroke-width:2px,color:#E65100
    style SSL_TLS fill:#E3F2FD,stroke:#1976D2,stroke-width:2px,color:#0D47A1
    style FIREWALL fill:#F3E5F5,stroke:#8E24AA,stroke-width:2px,color:#4A148C
    style IAM fill:#FFF8E1,stroke:#F57F17,stroke-width:2px,color:#E65100
    style ENCRYPTION fill:#FCE4EC,stroke:#C2185B,stroke-width:2px,color:#880E4F
    style SECURITY_MONITORING fill:#E8F5E8,stroke:#388E3C,stroke-width:2px,color:#1B5E20
```

### Level 5: CI/CD and Deployment Architecture

#### CI/CD Pipeline Architecture

```mermaid
graph LR
    subgraph "Version Control"
        GH[GitHub Repository<br/>Source Code]
        BRANCHES[Branch Strategy<br/>main, develop, feature/*]
        WEBHOOKS[GitHub Webhooks<br/>Event Triggers]
    end
    
    subgraph "GitHub Actions Workflows"
        subgraph "Quality Gates"
            LINT[ESLint<br/>Code Quality]
            TEST[Unit Tests<br/>Test Coverage]
            BUILD[Build Check<br/>TypeScript Compilation]
            SECURITY[Security Scan<br/>Vulnerability Check]
        end
        
        subgraph "Infrastructure"
            TERRAFORM_PLAN[Terraform Plan<br/>Infrastructure Changes]
            TERRAFORM_VALIDATE[Terraform Validate<br/>Configuration Check]
            TERRAFORM_APPLY[Terraform Apply<br/>Infrastructure Deployment]
        end
        
        subgraph "Application Deployment"
            DOCKER_BUILD[Docker Build<br/>Container Images]
            DOCKER_PUSH[Push to Registry<br/>Artifact Registry]
            DEPLOY_WEB[Deploy Web Service<br/>Cloud Run]
            DEPLOY_API[Deploy API Service<br/>Cloud Run]
        end
    end
    
    subgraph "Infrastructure as Code"
        TERRAFORM_MODULES[Terraform Modules<br/>Reusable Components]
        STATE_MANAGEMENT[State Management<br/>GCS Backend]
        WORKSPACES[Environment Workspaces<br/>dev/staging/prod]
    end
    
    subgraph "Container Registry"
        ARTIFACT_REGISTRY[Artifact Registry<br/>Docker Images]
        IMAGE_VERSIONS[Version Tagging<br/>Semantic Versioning]
        VULNERABILITY_SCAN[Vulnerability Scanning<br/>Container Security]
    end
    
    subgraph "Deployment Environments"
        DEVELOPMENT[Development<br/>dev-environment]
        STAGING[Staging<br/>staging-environment]
        PRODUCTION[Production<br/>prod-environment]
    end
    
    GH --> LINT
    LINT --> TEST
    TEST --> BUILD
    BUILD --> SECURITY
    
    SECURITY --> TERRAFORM_PLAN
    TERRAFORM_PLAN --> TERRAFORM_VALIDATE
    TERRAFORM_VALIDATE --> TERRAFORM_APPLY
    
    TERRAFORM_APPLY --> DOCKER_BUILD
    DOCKER_BUILD --> DOCKER_PUSH
    DOCKER_PUSH --> DEPLOY_WEB
    DOCKER_PUSH --> DEPLOY_API
    
    TERRAFORM_MODULES --> TERRAFORM_APPLY
    STATE_MANAGEMENT --> TERRAFORM_APPLY
    WORKSPACES --> TERRAFORM_APPLY
    
    DEPLOY_WEB --> ARTIFACT_REGISTRY
    DEPLOY_API --> ARTIFACT_REGISTRY
    ARTIFACT_REGISTRY --> IMAGE_VERSIONS
    IMAGE_VERSIONS --> VULNERABILITY_SCAN
    
    DEPLOY_WEB --> DEVELOPMENT
    DEPLOY_API --> DEVELOPMENT
    DEPLOY_WEB --> STAGING
    DEPLOY_API --> STAGING
    DEPLOY_WEB --> PRODUCTION
    DEPLOY_API --> PRODUCTION
    
    style GH fill:#E8F5E8,stroke:#2E7D32,stroke-width:2px,color:#1B5E20
    style LINT fill:#FFF3E0,stroke:#EF6C00,stroke-width:2px,color:#BF360C
    style TERRAFORM_PLAN fill:#E8F5E8,stroke:#388E3C,stroke-width:2px,color:#1B5E20
    style DOCKER_BUILD fill:#F3E5F5,stroke:#8E24AA,stroke-width:2px,color:#4A148C
    style DEPLOY_WEB fill:#E8F5E8,stroke:#2E7D32,stroke-width:2px,color:#1B5E20
    style DEPLOY_API fill:#FFF3E0,stroke:#EF6C00,stroke-width:2px,color:#BF360C
    style ARTIFACT_REGISTRY fill:#F3E5F5,stroke:#8E24AA,stroke-width:2px,color:#4A148C
    style DEVELOPMENT fill:#E8F5E8,stroke:#4CAF50,stroke-width:2px,color:#2E7D32
    style STAGING fill:#FFF3E0,stroke:#FF9800,stroke-width:2px,color:#E65100
    style PRODUCTION fill:#FCE4EC,stroke:#E91E63,stroke-width:2px,color:#C2185B
```

#### Deployment Workflow Architecture

```mermaid
stateDiagram-v2
    [*] --> CodeCommit: Developer commits code
    
    state "Code Quality" as CodeQuality
    CodeCommit --> CodeQuality: Push to repository
    CodeQuality --> LintFail: Linting fails
    CodeQuality --> TestFail: Tests fail
    CodeQuality --> BuildFail: Build fails
    CodeQuality --> SecurityFail: Security scan fails
    CodeQuality --> InfrastructurePlan: All checks pass
    
    LintFail --> CodeCommit: Fix linting issues
    TestFail --> CodeCommit: Fix test failures
    BuildFail --> CodeCommit: Fix build issues
    SecurityFail --> CodeCommit: Fix security issues
    
    state "Infrastructure Review" as InfrastructurePlan
    InfrastructurePlan --> PlanReview: Terraform plan generated
    InfrastructurePlan --> PlanFail: Plan generation fails
    
    PlanFail --> CodeCommit: Fix infrastructure issues
    
    state "Plan Review" as PlanReview
    PlanReview --> PlanApproved: PR approved
    PlanReview --> PlanRejected: Changes requested
    
    PlanRejected --> CodeCommit: Update infrastructure
    
    state "Infrastructure Deployment" as PlanApproved
    PlanApproved --> InfraDeploy: Apply infrastructure
    InfraDeploy --> InfraFail: Deployment fails
    InfraDeploy --> ContainerBuild: Infrastructure ready
    
    InfraFail --> RollbackInfra: Rollback infrastructure
    RollbackInfra --> PlanReview: Review rollback
    
    state "Application Build" as ContainerBuild
    ContainerBuild --> BuildFail: Build fails
    ContainerBuild --> RegistryPush: Build succeeds
    
    BuildFail --> CodeCommit: Fix build issues
    
    state "Container Deployment" as RegistryPush
    RegistryPush --> DeployWeb: Push containers
    DeployWeb --> DeployFail: Deployment fails
    DeployWeb --> DeployAPI: Web deployed
    
    DeployFail --> RollbackApp: Rollback application
    RollbackApp --> RegistryPush: Redeploy
    
    DeployAPI --> DeployFail: Deployment fails
    DeployAPI --> HealthChecks: API deployed
    
    state "Post-Deployment" as HealthChecks
    HealthChecks --> HealthFail: Health checks fail
    HealthChecks --> Monitoring: All healthy
    
    HealthFail --> RollbackApp: Rollback to last good
    RollbackApp --> HealthChecks: Redeploy
    
    state "Production" as Monitoring
    Monitoring --> Alert: Issues detected
    Monitoring --> [*]: Success
    
    Alert --> IncidentResponse: Create incident
    IncidentResponse --> FixIssue: Investigate and fix
    FixIssue --> HealthChecks: Redeploy fix
    
    note right of CodeQuality
        Automated quality gates:
        • ESLint code quality
        • Unit test coverage
        • TypeScript compilation
        • Security vulnerability scan
    end note
    
    note right of InfrastructurePlan
        Infrastructure validation:
        • Terraform validate
        • Terraform plan
        • Cost estimation
        • Security compliance
    end note
    
    note right of ContainerBuild
        Container optimization:
        • Multi-stage builds
        • Security scanning
        • Vulnerability assessment
        • Performance optimization
    end note
    
    note right of HealthChecks
        Health validation:
        • Service availability
        • Database connectivity
        • External integrations
        • Performance metrics
    end note
```

### Level 6: Terraform Module Architecture

#### Terraform Module Dependencies

```mermaid
graph TD
    subgraph "Root Configuration"
        MAIN[main.tf<br/>Root Module Entry Point]
        VARIABLES[variables.tf<br/>Input Variables]
        OUTPUTS[outputs.tf<br/>Output Values]
        PROVIDERS[providers.tf<br/>Provider Configuration]
    end
    
    subgraph "Core Infrastructure Modules"
        VPC_MODULE[vpc module<br/>Networking & Security]
        DATABASE_MODULE[database module<br/>Cloud SQL Setup]
        SECURITY_MODULE[security module<br/>IAM & Secrets Management]
    end
    
    subgraph "Application Modules"
        CONTAINER_MODULE[container module<br/>Cloud Run Services]
        MONITORING_MODULE[monitoring module<br/>Observability Setup]
    end
    
    subgraph "Infrastructure Resources"
        COMPUTE_NETWORK[google_compute_network<br/>VPC Network Creation]
        COMPUTE_SUBNETWORK[google_compute_subnetwork<br/>Regional Subnet]
        VPC_ACCESS_CONNECTOR[google_vpc_access_connector<br/>Serverless VPC Access]
        SQL_DATABASE_INSTANCE[google_sql_database_instance<br/>PostgreSQL Instance]
        CLOUD_RUN_SERVICE[google_cloud_run_service<br/>Container Services]
        ARTIFACT_REGISTRY[google_artifact_registry_repository<br/>Container Registry]
        SERVICE_ACCOUNT[google_service_account<br/>Service Accounts]
        SECRET_MANAGER[google_secret_manager_secret<br/>Encrypted Secrets]
        MONITORING_DASHBOARD[google_monitoring_dashboard<br/>Observability Dashboard]
    end
    
    subgraph "External Dependencies"
        PROJECT_SERVICES[google_project_service<br/>API Enablement]
        BILLING_BUDGET[google_billing_budget<br/>Cost Management]
        STORAGE_BUCKET[google_storage_bucket<br/>State Storage]
    end
    
    MAIN --> VPC_MODULE
    MAIN --> DATABASE_MODULE
    MAIN --> SECURITY_MODULE
    MAIN --> CONTAINER_MODULE
    MAIN --> MONITORING_MODULE
    
    VARIABLES --> MAIN
    PROVIDERS --> MAIN
    
    VPC_MODULE --> COMPUTE_NETWORK
    VPC_MODULE --> COMPUTE_SUBNETWORK
    VPC_MODULE --> VPC_ACCESS_CONNECTOR
    
    DATABASE_MODULE --> SQL_DATABASE_INSTANCE
    
    SECURITY_MODULE --> SERVICE_ACCOUNT
    SECURITY_MODULE --> SECRET_MANAGER
    
    CONTAINER_MODULE --> CLOUD_RUN_SERVICE
    CONTAINER_MODULE --> ARTIFACT_REGISTRY
    
    MONITORING_MODULE --> MONITORING_DASHBOARD
    
    MAIN --> PROJECT_SERVICES
    MAIN --> BILLING_BUDGET
    MAIN --> STORAGE_BUCKET
    
    CLOUD_RUN_SERVICE -.-> VPC_ACCESS_CONNECTOR
    CLOUD_RUN_SERVICE -.-> SERVICE_ACCOUNT
    CLOUD_RUN_SERVICE -.-> SECRET_MANAGER
    SQL_DATABASE_INSTANCE -.-> VPC_ACCESS_CONNECTOR
    
    style MAIN fill:#E8F5E8,stroke:#2E7D32,stroke-width:3px,color:#1B5E20
    style VPC_MODULE fill:#E3F2FD,stroke:#1976D2,stroke-width:2px,color:#0D47A1
    style DATABASE_MODULE fill:#FCE4EC,stroke:#C2185B,stroke-width:2px,color:#880E4F
    style SECURITY_MODULE fill:#FFF8E1,stroke:#F57F17,stroke-width:2px,color:#E65100
    style CONTAINER_MODULE fill:#FFF3E0,stroke:#EF6C00,stroke-width:2px,color:#BF360C
    style MONITORING_MODULE fill:#E3F2FD,stroke:#1976D2,stroke-width:2px,color:#0D47A1
    style COMPUTE_NETWORK fill:#E3F2FD,stroke:#1976D2,stroke-width:1px,color:#0D47A1
    style COMPUTE_SUBNETWORK fill:#E3F2FD,stroke:#1976D2,stroke-width:1px,color:#0D47A1
    style VPC_ACCESS_CONNECTOR fill:#E3F2FD,stroke:#1976D2,stroke-width:1px,color:#0D47A1
    style SQL_DATABASE_INSTANCE fill:#FCE4EC,stroke:#C2185B,stroke-width:1px,color:#880E4F
    style CLOUD_RUN_SERVICE fill:#FFF3E0,stroke:#EF6C00,stroke-width:1px,color:#BF360C
    style ARTIFACT_REGISTRY fill:#F3E5F5,stroke:#8E24AA,stroke-width:1px,color:#4A148C
    style SERVICE_ACCOUNT fill:#FFF8E1,stroke:#F57F17,stroke-width:1px,color:#E65100
    style SECRET_MANAGER fill:#FFF8E1,stroke:#F57F17,stroke-width:1px,color:#E65100
    style MONITORING_DASHBOARD fill:#E3F2FD,stroke:#1976D2,stroke-width:1px,color:#0D47A1
    style PROJECT_SERVICES fill:#E8F5E8,stroke:#388E3C,stroke-width:1px,color:#1B5E20
    style BILLING_BUDGET fill:#FFF3E0,stroke:#EF6C00,stroke-width:1px,color:#BF360C
    style STORAGE_BUCKET fill:#E8F5E8,stroke:#388E3C,stroke-width:1px,color:#1B5E20
```

#### Module Resource Relationships

```mermaid
graph TD
    subgraph "VPC Module Resources"
        VPC_NETWORK[google_compute_network.vpc]
        VPC_SUBNET[google_compute_subnetwork.subnet]
        VPC_CONNECTOR[google_vpc_access_connector.connector]
        PRIVATE_IP[google_compute_global_address.private_ip]
        PRIVATE_CONNECTION[google_service_networking_connection.private_vpc_connection]
    end
    
    subgraph "Database Module Resources"
        SQL_INSTANCE[google_sql_database_instance.postgres]
        SQL_DATABASE[google_sql_database.database]
        SQL_USER[google_sql_user.user]
        SQL_PASSWORD[random_password.db_password]
    end
    
    subgraph "Security Module Resources"
        SERVICE_ACCOUNT[google_service_account.app]
        PROJECT_IAM[google_project_iam_member.app_roles]
        SECRET[google_secret_manager_secret.db_password]
        SECRET_VERSION[google_secret_manager_secret_version.db_password]
    end
    
    subgraph "Container Module Resources"
        ARTIFACT_REPO[google_artifact_registry_repository.repo]
        CLOUD_RUN_WEB[google_cloud_run_service.web]
        CLOUD_RUN_API[google_cloud_run_service.api]
        CLOUD_RUN_IAM[google_cloud_run_service_iam_policy.web_noauth]
    end
    
    subgraph "Monitoring Module Resources"
        MONITORING_DASHBOARD[google_monitoring_dashboard.saas_dashboard]
        ALERT_POLICY[google_monitoring_alert_policy.service_down]
        NOTIFICATION_CHANNEL[google_monitoring_notification_channel.email]
    end
    
    VPC_NETWORK --> VPC_SUBNET
    VPC_SUBNET --> VPC_CONNECTOR
    VPC_SUBNET --> PRIVATE_IP
    PRIVATE_IP --> PRIVATE_CONNECTION
    
    SQL_INSTANCE --> SQL_DATABASE
    SQL_INSTANCE --> SQL_USER
    SQL_USER --> SQL_PASSWORD
    
    SERVICE_ACCOUNT --> PROJECT_IAM
    SERVICE_ACCOUNT --> SECRET
    SECRET --> SECRET_VERSION
    
    ARTIFACT_REPO --> CLOUD_RUN_WEB
    ARTIFACT_REPO --> CLOUD_RUN_API
    CLOUD_RUN_WEB --> CLOUD_RUN_IAM
    CLOUD_RUN_API --> CLOUD_RUN_IAM
    
    MONITORING_DASHBOARD --> ALERT_POLICY
    ALERT_POLICY --> NOTIFICATION_CHANNEL
    
    style VPC_NETWORK fill:#E3F2FD,stroke:#1976D2,stroke-width:2px,color:#0D47A1
    style SQL_INSTANCE fill:#FCE4EC,stroke:#C2185B,stroke-width:2px,color:#880E4F
    style SERVICE_ACCOUNT fill:#FFF8E1,stroke:#F57F17,stroke-width:2px,color:#E65100
    style CLOUD_RUN_WEB fill:#E8F5E8,stroke:#2E7D32,stroke-width:2px,color:#1B5E20
    style CLOUD_RUN_API fill:#FFF3E0,stroke:#EF6C00,stroke-width:2px,color:#BF360C
    style MONITORING_DASHBOARD fill:#E3F2FD,stroke:#1976D2,stroke-width:2px,color:#0D47A1
```

### Level 7: Security Architecture

#### Comprehensive Security Architecture

```mermaid
graph TB
    subgraph "Threat Landscape"
        EXTERNAL_ATTACKS[External Threats<br/>Internet Attackers]
        INSIDER_THREATS[Insider Threats<br/>Malicious Users]
        DATA_BREACHES[Data Breaches<br/>Unauthorized Access]
        DDOS_ATTACKS[DDoS Attacks<br/>Service Disruption]
    end
    
    subgraph "Perimeter Security"
        CLOUD_ARMOR[Google Cloud Armor<br/>WAF & DDoS Protection]
        LOAD_BALANCER[Cloud Load Balancer<br/>SSL/TLS Termination]
        FIREWALL_RULES[VPC Firewall Rules<br/>Network Access Control]
        SECURITY_GROUPS[Security Groups<br/>Instance-level Security]
    end
    
    subgraph "Identity & Access Management"
        IAM_POLICIES[IAM Policies<br/>Role-based Access Control]
        SERVICE_ACCOUNTS[Service Accounts<br/>Application Identity]
        AUTHENTICATION[Clerk Authentication<br/>User Authentication]
        AUTHORIZATION[Authorization<br/>Permission Management]
    end
    
    subgraph "Application Security"
        INPUT_VALIDATION[Input Validation<br/>Data Sanitization]
        CORS_POLICIES[CORS Policies<br/>Cross-origin Control]
        RATE_LIMITING[Rate Limiting<br/>API Protection]
        ERROR_HANDLING[Error Handling<br/>Information Disclosure]
    end
    
    subgraph "Data Security"
        ENCRYPTION_AT_REST[Encryption at Rest<br/>Cloud SQL Encryption]
        ENCRYPTION_IN_TRANSIT[Encryption in Transit<br/>TLS 1.3]
        SECRET_MANAGEMENT[Secret Manager<br/>API Keys & Secrets]
        DATABASE_ENCRYPTION[Database Encryption<br/>Transparent Encryption]
    end
    
    subgraph "Infrastructure Security"
        VPC_ISOLATION[VPC Network Isolation<br/>Private Subnets]
        PRIVATE_SERVICE_ACCESS[Private Service Access<br/>Secure Database Access]
        CONTAINER_SECURITY[Container Security<br/>Vulnerability Scanning]
        INFRASTRUCTURE_AS_CODE[Infrastructure as Code<br/>Version-controlled Security]
    end
    
    subgraph "Monitoring & Compliance"
        SECURITY_MONITORING[Security Monitoring<br/>Threat Detection]
        AUDIT_LOGGING[Audit Logging<br/>Security Events]
        COMPLIANCE_REPORTING[Compliance Reporting<br/>Regulatory Requirements]
        INCIDENT_RESPONSE[Incident Response<br/>Automated Alerts]
    end
    
    EXTERNAL_ATTACKS --> CLOUD_ARMOR
    INSIDER_THREATS --> IAM_POLICIES
    DATA_BREACHES --> ENCRYPTION_AT_REST
    DDOS_ATTACKS --> LOAD_BALANCER
    
    CLOUD_ARMOR --> LOAD_BALANCER
    LOAD_BALANCER --> FIREWALL_RULES
    FIREWALL_RULES --> SECURITY_GROUPS
    
    SECURITY_GROUPS --> IAM_POLICIES
    IAM_POLICIES --> SERVICE_ACCOUNTS
    SERVICE_ACCOUNTS --> AUTHENTICATION
    AUTHENTICATION --> AUTHORIZATION
    
    AUTHORIZATION --> INPUT_VALIDATION
    INPUT_VALIDATION --> CORS_POLICIES
    CORS_POLICIES --> RATE_LIMITING
    RATE_LIMITING --> ERROR_HANDLING
    
    ERROR_HANDLING --> ENCRYPTION_AT_REST
    ENCRYPTION_AT_REST --> ENCRYPTION_IN_TRANSIT
    ENCRYPTION_IN_TRANSIT --> SECRET_MANAGEMENT
    SECRET_MANAGEMENT --> DATABASE_ENCRYPTION
    
    DATABASE_ENCRYPTION --> VPC_ISOLATION
    VPC_ISOLATION --> PRIVATE_SERVICE_ACCESS
    PRIVATE_SERVICE_ACCESS --> CONTAINER_SECURITY
    CONTAINER_SECURITY --> INFRASTRUCTURE_AS_CODE
    
    INFRASTRUCTURE_AS_CODE --> SECURITY_MONITORING
    SECURITY_MONITORING --> AUDIT_LOGGING
    AUDIT_LOGGING --> COMPLIANCE_REPORTING
    COMPLIANCE_REPORTING --> INCIDENT_RESPONSE
    
    style EXTERNAL_ATTACKS fill:#FFEBEE,stroke:#D32F2F,stroke-width:2px,color:#B71C1C
    style CLOUD_ARMOR fill:#FFF8E1,stroke:#F57F17,stroke-width:2px,color:#E65100
    style LOAD_BALANCER fill:#E3F2FD,stroke:#1976D2,stroke-width:2px,color:#0D47A1
    style IAM_POLICIES fill:#FFF8E1,stroke:#F57F17,stroke-width:2px,color:#E65100
    style AUTHENTICATION fill:#F3E5F5,stroke:#8E24AA,stroke-width:2px,color:#4A148C
    style INPUT_VALIDATION fill:#F3E5F5,stroke:#8E24AA,stroke-width:2px,color:#4A148C
    style ENCRYPTION_AT_REST fill:#FCE4EC,stroke:#C2185B,stroke-width:2px,color:#880E4F
    style VPC_ISOLATION fill:#F3E5F5,stroke:#8E24AA,stroke-width:2px,color:#4A148C
    style SECURITY_MONITORING fill:#E8F5E8,stroke:#388E3C,stroke-width:2px,color:#1B5E20
```

### Schema Legend and Navigation

#### Color Coding Legend

```mermaid
graph LR
    subgraph "Component Types"
        BLUE[Azure Blue<br/>Infrastructure & Networking<br/>#E3F2FD] 
        GREEN[Light Green<br/>Application & Frontend<br/>#E8F5E8]
        ORANGE[Light Orange<br/>Backend & API<br/>#FFF3E0]
        PINK[Light Pink<br/>Database & Data<br/>#FCE4EC]
        PURPLE[Light Purple<br/>Security & Identity<br/>#F3E5F5]
        YELLOW[Light Yellow<br/>Monitoring & CI/CD<br/>#FFF8E1]
        RED[Light Red<br/>External & Threats<br/>#FFEBEE]
    end
    
    style BLUE fill:#E3F2FD,stroke:#1976D2,stroke-width:2px,color:#0D47A1
    style GREEN fill:#E8F5E8,stroke:#2E7D32,stroke-width:2px,color:#1B5E20
    style ORANGE fill:#FFF3E0,stroke:#EF6C00,stroke-width:2px,color:#BF360C
    style PINK fill:#FCE4EC,stroke:#C2185B,stroke-width:2px,color:#880E4F
    style PURPLE fill:#F3E5F5,stroke:#8E24AA,stroke-width:2px,color:#4A148C
    style YELLOW fill:#FFF8E1,stroke:#F57F17,stroke-width:2px,color:#E65100
    style RED fill:#FFEBEE,stroke:#D32F2F,stroke-width:2px,color:#B71C1C
```

#### Architecture Navigation Guide

- **Level 1**: Start here for high-level system understanding
- **Level 2**: Application architecture and data flows
- **Level 3**: Detailed infrastructure components
- **Level 4**: Network topology and security layers
- **Level 5**: CI/CD pipelines and deployment processes
- **Level 6**: Terraform module relationships and dependencies
- **Level 7**: Comprehensive security architecture

Each level builds upon the previous one, providing increasing technical detail while maintaining architectural clarity.

## Infrastructure Design

### Terraform Project Structure

```text
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

### Application Performance Optimization

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

- **[Terraform Documentation](https://developer.hashicorp.com/terraform)**
- **[Google Cloud Documentation](https://cloud.google.com/docs)**
- **[Cloud Run Best Practices](https://cloud.google.com/run/docs/best-practices)**
- **[Terraform Registry](https://registry.terraform.io/providers/hashicorp/google)**

---

*This document is maintained alongside the SaaS starter kit codebase. For the latest updates, check the repository's terraform/ directory.*
