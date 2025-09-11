# Component Interaction Diagrams

This document provides visual representations of how different components in the Modern SaaS Template interact with each other.

## System Component Overview

```mermaid
graph TB
    subgraph "Client Layer"
        Browser[Web Browser]
        Mobile[Mobile App]
        API_Client[External API Client]
    end
    
    subgraph "Presentation Layer"
        NextJS[Next.js Frontend<br/>Port 3000]
        UI[UI Components]
        Store[Zustand Store]
        NextJS --> UI
        NextJS --> Store
    end
    
    subgraph "Application Layer"
        HonoAPI[Hono.js API<br/>Port 3001]
        Middleware[API Middleware]
        Validation[Request Validation]
        HonoAPI --> Middleware
        HonoAPI --> Validation
    end
    
    subgraph "Data Layer"
        PostgreSQL[PostgreSQL Database<br/>Port 5432]
        Drizzle[Drizzle ORM]
        Schema[Database Schema]
        PostgreSQL --> Drizzle
        Drizzle --> Schema
    end
    
    subgraph "External Services"
        Clerk[Clerk Auth]
        Stripe[Stripe Payments]
        Resend[Resend Email]
        Sentry[Sentry Monitoring]
        PostHog[PostHog Analytics]
    end
    
    Browser --> NextJS
    Mobile --> NextJS
    API_Client --> HonoAPI
    NextJS --> HonoAPI
    HonoAPI --> PostgreSQL
    
    NextJS -.-> Clerk
    NextJS -.-> Stripe
    HonoAPI -.-> Clerk
    HonoAPI -.-> Stripe
    HonoAPI -.-> Resend
    HonoAPI -.-> Sentry
    NextJS -.-> PostHog
```

## Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant C as Clerk
    participant A as API
    participant D as Database
    
    U->>F: Access protected page
    F->>C: Check authentication
    alt Not authenticated
        C->>F: Redirect to login
        F->>U: Show login form
        U->>F: Submit credentials
        F->>C: Authenticate user
        C->>C: Generate JWT
        C->>F: Return JWT token
    end
    
    F->>A: API request with JWT
    A->>C: Verify JWT token
    C->>A: Token valid + user info
    A->>D: Execute query
    D->>A: Return data
    A->>F: Send response
    F->>U: Display content
```

## Payment Processing Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant A as API
    participant S as Stripe
    participant D as Database
    participant W as Webhook
    
    U->>F: Select product & checkout
    F->>A: Create payment intent
    A->>S: Create payment intent
    S->>A: Return client secret
    A->>F: Send client secret
    
    F->>U: Show payment form
    U->>F: Enter payment details
    F->>S: Submit payment (Stripe.js)
    S->>S: Process payment
    
    alt Payment successful
        S->>W: Send webhook (payment_intent.succeeded)
        W->>A: Process webhook
        A->>D: Create/update order
        S->>F: Payment confirmation
        F->>A: Create provisional order
        A->>D: Store provisional order
        F->>U: Show success page
    else Payment failed
        S->>F: Payment error
        F->>U: Show error message
    end
```

## Order Management Flow

```mermaid
graph TD
    A[Payment Intent Created] --> B{Payment Successful?}
    B -->|Yes| C[Create Provisional Order]
    B -->|No| D[Payment Failed]
    
    C --> E[Webhook Received]
    E --> F[Verify Payment in Stripe]
    F --> G{Order Exists?}
    
    G -->|Yes, Provisional| H[Update to Confirmed]
    G -->|Yes, Confirmed| I[Skip - Already Processed]
    G -->|No| J[Create New Order]
    
    H --> K[Order Complete]
    I --> K
    J --> K
    
    K --> L[Send Confirmation Email]
    K --> M[Update Analytics]
    
    D --> N[Log Failed Payment]
    N --> O[Notify User]
```

## Database Entity Relationships

```mermaid
erDiagram
    USERS {
        int id PK
        string email
        timestamp created_at
    }
    
    PRODUCTS {
        int id PK
        string name
        string description
        int price
        string currency
        string stripe_product_id
        string stripe_price_id
        timestamp created_at
    }
    
    ORDERS {
        int id PK
        int user_id FK
        int product_id FK
        string stripe_payment_intent_id
        int quantity
        int amount
        string currency
        string status
        string customer_email
        string customer_name
        boolean is_provisional
        timestamp created_at
        timestamp updated_at
    }
    
    SUBSCRIPTIONS {
        int id PK
        int user_id FK
        string stripe_id
        string status
        timestamp created_at
    }
    
    USERS ||--o{ ORDERS : "places"
    USERS ||--o{ SUBSCRIPTIONS : "has"
    PRODUCTS ||--o{ ORDERS : "contains"
```

## API Request Flow

```mermaid
graph LR
    A[Client Request] --> B[CORS Middleware]
    B --> C[Authentication Check]
    C --> D{Protected Route?}
    
    D -->|No| E[Public Access]
    D -->|Yes| F{Valid JWT?}
    
    F -->|No| G[Return 401 Unauthorized]
    F -->|Yes| H[Request Validation]
    
    E --> H
    H --> I{Valid Input?}
    
    I -->|No| J[Return 400 Bad Request]
    I -->|Yes| K[Business Logic]
    
    K --> L[Database Query]
    L --> M[Format Response]
    M --> N[Return JSON]
    
    G --> O[Error Response]
    J --> O
```

## Development Environment Architecture

```mermaid
graph TB
    subgraph "Docker Environment"
        subgraph "Web Container"
            NextJS_Dev[Next.js Dev Server<br/>Hot Reload Enabled]
            Volume_Web[Source Code Volume]
            NextJS_Dev -.-> Volume_Web
        end
        
        subgraph "API Container"
            Hono_Dev[Hono.js Dev Server<br/>Hot Reload Enabled]
            Volume_API[Source Code Volume]
            Hono_Dev -.-> Volume_API
        end
        
        subgraph "Database Container"
            PostgreSQL_Dev[PostgreSQL Database]
            Volume_DB[Data Volume]
            PostgreSQL_Dev -.-> Volume_DB
        end
    end
    
    subgraph "Host Machine"
        IDE[Development IDE]
        Browser_Dev[Browser]
        Terminal[Terminal]
    end
    
    IDE --> Volume_Web
    IDE --> Volume_API
    Browser_Dev --> NextJS_Dev
    Terminal --> Hono_Dev
    NextJS_Dev --> Hono_Dev
    Hono_Dev --> PostgreSQL_Dev
```

## Deployment Architecture

```mermaid
graph TB
    subgraph "Development"
        Dev[Local Development]
        Git[Git Repository]
        Dev --> Git
    end
    
    subgraph "CI/CD Pipeline"
        GitHub[GitHub Actions]
        Build[Build Process]
        Test[Test Suite]
        Git --> GitHub
        GitHub --> Build
        Build --> Test
    end
    
    subgraph "Production Environment"
        subgraph "Vercel Platform"
            Frontend[Next.js Frontend<br/>Edge Network]
            API_Prod[API Functions<br/>Serverless]
            Static[Static Assets<br/>CDN]
        end
        
        subgraph "Database"
            PostgreSQL_Prod[PostgreSQL<br/>Managed Service]
        end
        
        subgraph "External Services"
            Clerk_Prod[Clerk Auth]
            Stripe_Prod[Stripe Payments]
            Sentry_Prod[Sentry Monitoring]
        end
    end
    
    Test --> Frontend
    Test --> API_Prod
    API_Prod --> PostgreSQL_Prod
    Frontend -.-> Clerk_Prod
    API_Prod -.-> Stripe_Prod
    API_Prod -.-> Sentry_Prod
```

## State Management Flow

```mermaid
graph TD
    A[User Interaction] --> B[React Component]
    B --> C{Local State?}
    
    C -->|Yes| D[useState/useReducer]
    C -->|No| E{Global State?}
    
    E -->|Yes| F[Zustand Store]
    E -->|No| G[Server State]
    
    D --> H[Component Re-render]
    F --> I[Store Update]
    I --> J[Subscribe Components]
    J --> H
    
    G --> K[API Call]
    K --> L[Server Response]
    L --> M{Cache Strategy?}
    
    M -->|Yes| N[Update Cache]
    M -->|No| O[Direct Update]
    
    N --> H
    O --> H
```

## Error Handling Flow

```mermaid
graph TD
    A[Error Occurs] --> B{Error Type?}
    
    B -->|Client Error| C[React Error Boundary]
    B -->|API Error| D[API Error Handler]
    B -->|Database Error| E[Database Error Handler]
    
    C --> F[User-Friendly Message]
    C --> G[Log to Console]
    
    D --> H[HTTP Error Response]
    D --> I[Log to Sentry]
    
    E --> J[Rollback Transaction]
    E --> K[Log Database Error]
    
    F --> L[Show Error UI]
    H --> M[Frontend Error Handler]
    M --> L
    
    I --> N[Alert Developers]
    K --> N
    G --> O[Debug Information]
```

## Security Architecture

```mermaid
graph TB
    subgraph "Security Layers"
        subgraph "Network Security"
            HTTPS[HTTPS/TLS]
            CORS[CORS Policy]
            CSP[Content Security Policy]
        end
        
        subgraph "Authentication Security"
            JWT[JWT Tokens]
            MFA[Multi-Factor Auth]
            Session[Session Management]
        end
        
        subgraph "Application Security"
            Validation[Input Validation]
            Sanitization[Data Sanitization]
            Authorization[Authorization Checks]
        end
        
        subgraph "Data Security"
            Encryption[Data Encryption]
            Secrets[Secret Management]
            Audit[Audit Logging]
        end
    end
    
    subgraph "Threat Mitigation"
        XSS[XSS Protection]
        CSRF[CSRF Protection]
        Injection[SQL Injection Prevention]
        RateLimit[Rate Limiting]
    end
    
    HTTPS --> JWT
    CORS --> Validation
    JWT --> Authorization
    Validation --> Encryption
    Authorization --> Audit
    
    Validation --> XSS
    JWT --> CSRF
    Validation --> Injection
    CORS --> RateLimit
```

These diagrams provide a visual representation of how the various components in the Modern SaaS Template interact with each other, making it easier to understand the system architecture and data flow patterns.