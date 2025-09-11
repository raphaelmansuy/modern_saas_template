# Modern SaaS Template - Architecture Documentation

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture Principles](#architecture-principles)
3. [High-Level Architecture](#high-level-architecture)
4. [Component Architecture](#component-architecture)
5. [Data Flow](#data-flow)
6. [Database Design](#database-design)
7. [API Design](#api-design)
8. [Authentication & Authorization](#authentication--authorization)
9. [Payment Processing](#payment-processing)
10. [Development Workflow](#development-workflow)
11. [Deployment Architecture](#deployment-architecture)
12. [Security Considerations](#security-considerations)
13. [Monitoring & Observability](#monitoring--observability)
14. [Scalability Patterns](#scalability-patterns)

## System Overview

The Modern SaaS Template is a production-ready, full-stack application built using a modern technology stack optimized for rapid development and scalability. The system follows a **monorepo architecture** using Turbo for orchestration, designed to support subscription-based SaaS products with authentication, payments, and comprehensive user management.

### Key Characteristics

- **Monorepo Structure**: Single repository containing all applications and shared packages
- **Type-Safe**: TypeScript throughout the entire stack
- **Docker-First Development**: Containerized development environment with hot reloading
- **API-First Design**: RESTful API with OpenAPI documentation
- **Modern UI/UX**: Responsive design with accessibility features
- **Production-Ready**: Comprehensive error handling, monitoring, and security features

### Technology Stack

```
Frontend:     Next.js 14 (App Router) + React 19 + TypeScript
Styling:      Tailwind CSS + Radix UI + Shadcn/ui
State:        Zustand + React Context
Backend:      Hono.js + TypeScript
Database:     PostgreSQL + Drizzle ORM
Authentication: Clerk
Payments:     Stripe
Email:        Resend
Monitoring:   Sentry + PostHog
Deployment:   Vercel + Docker
Runtime:      Bun (development) + Node.js (production)
```

## Architecture Principles

### 1. **Separation of Concerns**
- Clear boundaries between presentation, business logic, and data layers
- Modular components with well-defined interfaces
- Independent deployability of services

### 2. **Type Safety**
- End-to-end TypeScript for compile-time error detection
- Schema validation with Zod for runtime type safety
- Database schema as single source of truth

### 3. **Developer Experience**
- Hot reloading across all services
- Comprehensive tooling and automation
- Clear development workflows

### 4. **Scalability by Design**
- Stateless application architecture
- Database optimization with proper indexing
- Horizontal scaling capabilities

### 5. **Security First**
- Authentication and authorization at every layer
- Input validation and sanitization
- Environment-based configuration management

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Client Layer                        │
├─────────────────────────────────────────────────────────┤
│  Web Browser  │  Mobile App  │  External Integrations   │
└─────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│                   Presentation Layer                    │
├─────────────────────────────────────────────────────────┤
│              Next.js Frontend (Port 3000)              │
│  • Server-Side Rendering   • React Components          │
│  • Client-Side Routing     • State Management          │
│  • Form Handling          • Error Boundaries           │
└─────────────────────────────────────────────────────────┘
                             │
                             ▼ HTTP/HTTPS
┌─────────────────────────────────────────────────────────┐
│                   Application Layer                     │
├─────────────────────────────────────────────────────────┤
│               Hono.js API Server (Port 3001)           │
│  • RESTful API Endpoints   • Request Validation        │
│  • Business Logic         • Error Handling             │
│  • Authentication         • OpenAPI Documentation      │
└─────────────────────────────────────────────────────────┘
                             │
                             ▼ SQL
┌─────────────────────────────────────────────────────────┐
│                     Data Layer                          │
├─────────────────────────────────────────────────────────┤
│              PostgreSQL Database (Port 5432)           │
│  • User Data              • Product Catalog            │
│  • Order Management       • Subscription Data          │
│  • Audit Trails          • System Configuration       │
└─────────────────────────────────────────────────────────┘
```

### External Services Integration

```
┌─────────────────────────────────────────────────────────┐
│                   External Services                     │
├─────────────────────────────────────────────────────────┤
│  Clerk          │  Stripe        │  Resend            │
│  Authentication │  Payments      │  Email Service     │
│                 │                │                    │
│  Sentry         │  PostHog       │  Vercel            │
│  Error Tracking │  Analytics     │  Hosting/CDN       │
└─────────────────────────────────────────────────────────┘
```

## Component Architecture

### 1. Frontend Application (`apps/web/`)

```
apps/web/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth group routes
│   │   ├── sign-in/       # Sign-in page
│   │   └── sign-up/       # Sign-up page
│   ├── admin/             # Admin dashboard
│   ├── dashboard/         # User dashboard
│   ├── orders/            # Order management
│   ├── payment/           # Payment processing
│   ├── products/          # Product catalog
│   ├── profile/           # User profile
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Landing page
│   └── globals.css        # Global styles
├── components/            # Reusable components
│   ├── ui/               # Base UI components
│   ├── accessibility/    # A11y components
│   ├── error/            # Error handling
│   ├── forms/            # Form components
│   ├── layout/           # Layout components
│   └── payment/          # Payment components
├── lib/                  # Utility libraries
│   ├── store.ts          # Zustand store
│   ├── utils.ts          # Helper functions
│   └── ClientProviders.tsx # Context providers
└── middleware.ts         # Route middleware
```

#### Key Frontend Patterns

**1. Route-Based Architecture**
- App Router for file-system based routing
- Route groups for logical organization
- Middleware for authentication and authorization

**2. Component Composition**
- Atomic design principles
- Reusable UI components with Radix UI
- Customizable styling with Tailwind CSS

**3. State Management**
- Zustand for global state
- React Context for specific features
- Server state with SWR/TanStack Query patterns

### 2. Backend API (`apps/api/`)

```
apps/api/
├── src/
│   ├── index.ts           # Main application entry
│   ├── schemas/           # API request/response schemas
│   │   ├── auth.ts        # Authentication schemas
│   │   ├── orders.ts      # Order schemas
│   │   └── payments.ts    # Payment schemas
│   └── scripts/           # Utility scripts
│       └── sync-orders.ts # Order synchronization
└── Dockerfile             # Container configuration
```

#### API Architecture Patterns

**1. Route-Based Organization**
```typescript
// API Route Structure
/health                     # Health check
/docs                      # API documentation
/api/products              # Product management
/api/create-payment-intent # Payment processing
/api/orders/:id            # Order management
/api/user/profile          # User management
/api/admin/*               # Admin endpoints
/api/webhooks              # External integrations
```

**2. Middleware Stack**
- CORS handling for cross-origin requests
- Request validation with Zod schemas
- Authentication with Clerk verification
- Error handling and logging

**3. OpenAPI Integration**
- Comprehensive API documentation
- Type-safe request/response handling
- Interactive Swagger UI interface

### 3. Database Layer (`packages/db/`)

```
packages/db/
├── index.ts              # Database connection
├── schema.ts             # Database schema
├── config.ts             # Configuration
├── seed.ts               # Sample data
├── setup.ts              # Database setup
├── drizzle.config.ts     # Drizzle configuration
└── drizzle/              # Migration files
```

#### Database Architecture

**1. Schema Design**
```typescript
// Core entities with relationships
users ←→ orders ←→ products
  ↓        ↓
subscriptions
```

**2. Migration Strategy**
- Schema-first development
- Type-safe migrations with Drizzle
- Rollback and rollforward capabilities

## Data Flow

### 1. Authentication Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Browser   │    │  Next.js    │    │   Clerk     │    │  Hono API   │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       │                    │                  │                  │
       │ 1. Access page     │                  │                  │
       ├───────────────────►│                  │                  │
       │                    │ 2. Check auth    │                  │
       │                    ├─────────────────►│                  │
       │                    │ 3. Redirect      │                  │
       │                    │◄─────────────────┤                  │
       │ 4. Login form      │                  │                  │
       │◄───────────────────┤                  │                  │
       │ 5. Submit creds    │                  │                  │
       ├───────────────────►│ 6. Authenticate  │                  │
       │                    ├─────────────────►│                  │
       │                    │ 7. JWT token     │                  │
       │                    │◄─────────────────┤                  │
       │ 8. API request     │                  │                  │
       ├───────────────────►│ 9. Verify token  │                  │
       │                    ├─────────────────────────────────────►│
       │                    │                  │ 10. Authorized   │
       │                    │◄─────────────────────────────────────┤
```

### 2. Payment Processing Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Browser   │    │  Next.js    │    │  Hono API   │    │   Stripe    │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       │                    │                  │                  │
       │ 1. Select product  │                  │                  │
       ├───────────────────►│                  │                  │
       │                    │ 2. Create intent │                  │
       │                    ├─────────────────►│ 3. Stripe intent │
       │                    │                  ├─────────────────►│
       │                    │                  │ 4. Client secret │
       │                    │ 5. Payment form  │◄─────────────────┤
       │ 6. Payment details │◄─────────────────┤                  │
       │◄───────────────────┤                  │                  │
       │ 7. Submit payment  │                  │                  │
       ├───────────────────►│ 8. Process       │                  │
       │                    ├─────────────────►│ 9. Confirm       │
       │                    │                  ├─────────────────►│
       │                    │                  │ 10. Webhook      │
       │                    │                  │◄─────────────────┤
       │                    │ 11. Success      │                  │
       │ 12. Confirmation   │◄─────────────────┤                  │
       │◄───────────────────┤                  │                  │
```

### 3. Order Management Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Payment   │    │ Provisional │    │   Webhook   │    │ Final Order │
│   Created   │    │   Order     │    │ Processing  │    │ Confirmed   │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       │                    │                  │                  │
       │ 1. Payment intent  │                  │                  │
       ├───────────────────►│                  │                  │
       │                    │ 2. Create order  │                  │
       │                    │   (provisional)  │                  │
       │                    │                  │ 3. Payment       │
       │                    │                  │   succeeded      │
       │                    │                  ├─────────────────►│
       │                    │                  │                  │
       │                    │ 4. Update order  │                  │
       │                    │   (confirmed)    │                  │
       │                    │◄─────────────────┤                  │
```

## Database Design

### Entity Relationship Diagram

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│    users    │     │   orders    │     │  products   │
├─────────────┤     ├─────────────┤     ├─────────────┤
│ id (PK)     │◄───┤│ userId (FK) │    ┌┤│ id (PK)     │
│ email       │     │ productId   ├────┘ │ name        │
│ createdAt   │     │ (FK)        │      │ description │
└─────────────┘     │ amount      │      │ price       │
                    │ status      │      │ currency    │
┌─────────────┐     │ paymentId   │      │ stripeId    │
│subscriptions│     │ provisional │      │ createdAt   │
├─────────────┤     │ createdAt   │      └─────────────┘
│ id (PK)     │     │ updatedAt   │
│ userId (FK) ├────►│ ...         │
│ stripeId    │     └─────────────┘
│ status      │
│ createdAt   │
└─────────────┘
```

### Schema Definition

#### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Products Table
```sql
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL,  -- Cents
  currency TEXT DEFAULT 'usd',
  stripe_product_id TEXT,
  stripe_price_id TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_products_stripe_product_id ON products(stripe_product_id);
```

#### Orders Table
```sql
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  product_id INTEGER NOT NULL REFERENCES products(id),
  stripe_payment_intent_id TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  amount INTEGER NOT NULL,  -- Cents
  currency TEXT NOT NULL,
  status TEXT NOT NULL,     -- 'pending', 'processing', 'completed', 'failed'
  customer_email TEXT,
  customer_name TEXT,
  customer_phone TEXT,
  is_provisional BOOLEAN DEFAULT FALSE,
  provisional_created_at TIMESTAMP,
  sync_attempts INTEGER DEFAULT 0,
  last_sync_attempt TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
```

#### Subscriptions Table
```sql
CREATE TABLE subscriptions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  stripe_id TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Database Patterns

**1. Provisional Orders**
- Immediate order creation for better UX
- Webhook confirmation for reliability
- Sync mechanisms for consistency

**2. Indexing Strategy**
- Primary keys for unique identification
- Foreign key indexes for join performance
- Status and timestamp indexes for filtering

**3. Data Integrity**
- Foreign key constraints
- Non-null constraints for required fields
- Default values for optional fields

## API Design

### RESTful Endpoints

#### Authentication & Users
```
GET    /health                    # System health check
PUT    /api/user/profile          # Update user profile
GET    /api/user/orders           # Get user orders (paginated)
```

#### Products & Orders
```
GET    /api/products              # List all products
POST   /api/create-payment-intent # Create Stripe payment intent
GET    /api/orders/:id            # Get order by payment intent ID
POST   /api/create-provisional-order # Create provisional order
```

#### Admin Endpoints
```
POST   /api/admin/sync-orders     # Manual order synchronization
GET    /api/admin/sync-stats      # Get synchronization statistics
```

#### Webhooks & External
```
POST   /api/webhooks              # Stripe webhook handler
GET    /api/invoices/:id          # Get invoice download URL
```

#### Documentation
```
GET    /docs                      # Swagger UI interface
GET    /doc                       # OpenAPI specification (JSON)
```

### API Response Patterns

#### Success Response
```typescript
{
  "success": true,
  "data": { /* response data */ },
  "meta": { /* pagination, etc */ }
}
```

#### Error Response
```typescript
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": { /* additional error info */ }
}
```

#### Pagination Response
```typescript
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### Request Validation

All API endpoints use **Zod schemas** for request validation:

```typescript
const createPaymentIntentSchema = z.object({
  productId: z.number(),
  quantity: z.number().min(1).default(1),
  customerInfo: z.object({
    customerEmail: z.string().email().optional(),
    customerName: z.string().optional(),
    customerPhone: z.string().optional(),
  }).optional()
})
```

## Authentication & Authorization

### Authentication Flow

**1. Clerk Integration**
- JWT-based authentication
- Social login support
- Multi-factor authentication
- Session management

**2. Token Verification**
```typescript
// API middleware for protected routes
const authMiddleware = async (c: Context, next: Next) => {
  const token = c.req.header('Authorization')?.replace('Bearer ', '')
  const payload = await clerkClient.verifyToken(token)
  c.set('user', payload)
  await next()
}
```

**3. Route Protection**
```typescript
// Frontend middleware
export default authMiddleware({
  publicRoutes: ['/', '/products'],
  ignoredRoutes: ['/api/webhooks']
})
```

### Authorization Patterns

**1. Role-Based Access Control (RBAC)**
- User roles: `user`, `admin`
- Permission-based access
- Route-level authorization

**2. Resource-Based Authorization**
- Users can only access their own data
- Admin users have elevated permissions
- Order ownership validation

**3. API Security**
- JWT token validation
- Request rate limiting
- Input sanitization

## Payment Processing

### Stripe Integration Architecture

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Frontend  │    │  Backend    │    │   Stripe    │
│             │    │             │    │             │
│ Payment     │    │ Payment     │    │ Payment     │
│ Components  │◄──►│ Intents     │◄──►│ Processing  │
│             │    │             │    │             │
│ Stripe.js   │    │ Webhooks    │    │ Events      │
└─────────────┘    └─────────────┘    └─────────────┘
```

### Payment Flow Components

**1. Payment Intent Creation**
```typescript
// Create payment intent with product details
const paymentIntent = await stripe.paymentIntents.create({
  amount: product.price * quantity,
  currency: product.currency,
  metadata: {
    productId: product.id,
    quantity: quantity,
    customerEmail: customer.email
  }
})
```

**2. Webhook Processing**
```typescript
// Handle successful payments
case 'payment_intent.succeeded':
  const paymentIntent = event.data.object
  await confirmOrder(paymentIntent.id)
  break
```

**3. Order Synchronization**
- Provisional order creation
- Webhook confirmation
- Manual sync capabilities
- Failure recovery mechanisms

### Payment Security

**1. PCI Compliance**
- Stripe handles sensitive card data
- No card information stored locally
- Secure token-based processing

**2. Webhook Security**
- Signature verification
- Idempotent processing
- Event deduplication

## Development Workflow

### Docker-First Development

**1. Development Environment**
```yaml
# docker-compose.yml structure
services:
  web:     # Next.js frontend (port 3000)
  api:     # Hono.js backend (port 3001)
  db:      # PostgreSQL database (port 5432)
```

**2. Hot Reloading**
- Volume mounts for source code
- Automatic rebuild on changes
- Real-time development feedback

**3. Environment Management**
```bash
# Development commands
bun run dev:docker         # Start all services
bun run docker:logs        # View service logs
bun run db:studio          # Database admin interface
```

### Development Workflow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Local     │    │   Docker    │    │ Production  │
│ Development │    │ Environment │    │ Deployment  │
└─────────────┘    └─────────────┘    └─────────────┘
       │                    │                  │
       │ 1. Code changes    │                  │
       ├───────────────────►│                  │
       │                    │ 2. Auto rebuild  │
       │                    │                  │
       │ 3. Test locally    │                  │
       │◄───────────────────┤                  │
       │                    │                  │
       │ 4. Build & deploy  │                  │
       ├─────────────────────────────────────→│
```

### Monorepo Management

**1. Turbo Configuration**
```json
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

**2. Workspace Dependencies**
```json
{
  "workspaces": [
    "apps/*",
    "packages/*"
  ]
}
```

**3. Shared Packages**
- `@saas/db`: Database schema and utilities
- `@saas/ui`: Shared UI components (future)
- `@saas/auth`: Authentication utilities (future)

## Deployment Architecture

### Vercel Deployment (Recommended)

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   GitHub    │    │   Vercel    │    │ Production  │
│ Repository  │    │   Platform  │    │ Environment │
└─────────────┘    └─────────────┘    └─────────────┘
       │                    │                  │
       │ 1. Git push        │                  │
       ├───────────────────►│                  │
       │                    │ 2. Auto build   │
       │                    │                  │
       │                    │ 3. Deploy        │
       │                    ├─────────────────►│
       │                    │                  │
       │                    │ 4. Health check  │
       │                    │◄─────────────────┤
```

### Environment Configuration

**1. Environment Variables**
```bash
# Database
DATABASE_URL=postgresql://...

# Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...

# Payments
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Monitoring
SENTRY_DSN=https://...
NEXT_PUBLIC_POSTHOG_KEY=phc_...
```

**2. Deployment Targets**
- **Frontend**: Vercel Edge Network
- **API**: Vercel Serverless Functions
- **Database**: Managed PostgreSQL (Vercel Postgres, Supabase, etc.)

### Alternative Deployment Options

**1. Docker Deployment**
```bash
# Production build
docker-compose -f docker-compose.prod.yml up --build

# Container orchestration
kubernetes/docker-swarm configurations
```

**2. Traditional Hosting**
- VPS with Docker
- AWS/GCP/Azure containers
- Load balancer configuration

## Security Considerations

### Application Security

**1. Authentication Security**
- JWT token validation
- Secure session management
- Multi-factor authentication support
- Token expiration and refresh

**2. API Security**
```typescript
// Security middleware stack
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}))

app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // requests per window
}))

app.use(helmet()) // Security headers
```

**3. Input Validation**
- Zod schema validation
- SQL injection prevention
- XSS protection
- CSRF protection

### Data Security

**1. Database Security**
- Connection pooling with limits
- Encrypted connections (TLS)
- Prepared statements
- Role-based database access

**2. Sensitive Data Handling**
- Environment variable management
- Secrets rotation
- PCI compliance for payments
- GDPR compliance for user data

**3. Infrastructure Security**
- HTTPS enforcement
- Security headers
- Container security scanning
- Dependency vulnerability scanning

## Monitoring & Observability

### Error Tracking & Monitoring

**1. Sentry Integration**
```typescript
// Error monitoring setup
import * as Sentry from '@sentry/node'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0
})
```

**2. Application Metrics**
- Request/response times
- Error rates and types
- Database query performance
- API endpoint usage

**3. Business Metrics**
- User registrations
- Payment conversions
- Order completion rates
- Feature usage analytics

### Logging Strategy

**1. Structured Logging**
```typescript
// Structured log format
console.log(JSON.stringify({
  timestamp: new Date().toISOString(),
  level: 'info',
  service: 'api',
  message: 'Order created',
  metadata: { orderId, userId, amount }
}))
```

**2. Log Levels**
- **ERROR**: System errors and exceptions
- **WARN**: Potential issues and degraded performance
- **INFO**: Important business events
- **DEBUG**: Detailed debugging information

### Health Monitoring

**1. Health Check Endpoints**
```typescript
app.get('/health', async (c) => {
  const dbConnected = await testConnection()
  const poolStats = getPoolStats()
  
  return c.json({
    status: dbConnected ? 'healthy' : 'unhealthy',
    database: { connected: dbConnected, pool: poolStats },
    uptime: process.uptime()
  })
})
```

**2. Service Dependencies**
- Database connection monitoring
- External service availability
- Cache and queue health
- Resource utilization metrics

## Scalability Patterns

### Database Scalability

**1. Query Optimization**
- Proper indexing strategy
- Query performance monitoring
- Connection pooling
- Read replicas (future)

**2. Schema Design**
- Normalized data structure
- Efficient foreign key relationships
- Pagination for large datasets
- Archive strategy for old data

### Application Scalability

**1. Stateless Design**
- No server-side session storage
- JWT-based authentication
- Database-backed state management
- Horizontal scaling capabilities

**2. Caching Strategy**
- HTTP response caching
- Database query caching
- Static asset optimization
- CDN integration

**3. Load Distribution**
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Load        │    │ Frontend    │    │ Backend     │
│ Balancer    │    │ Instances   │    │ Instances   │
└─────────────┘    └─────────────┘    └─────────────┘
       │                    │                  │
       │ Route requests     │                  │
       ├───────────────────►│                  │
       │                    │ API calls        │
       │                    ├─────────────────►│
       │                    │                  │
       │ Balance load       │                  │
       ├─────────────────────────────────────→│
```

### Future Scalability Considerations

**1. Microservices Migration**
- Service decomposition strategy
- API gateway implementation
- Inter-service communication
- Data consistency patterns

**2. Advanced Database Patterns**
- Read/write splitting
- Database sharding
- Event sourcing
- CQRS implementation

**3. Performance Optimization**
- Code splitting and lazy loading
- Image optimization
- Background job processing
- Real-time features with WebSockets

---

## Quick Reference

### Development Commands
```bash
# Start development environment
bun run dev:docker

# Database management
bun run db:push           # Push schema changes
bun run db:studio         # Open database admin
bun run db:seed           # Seed sample data

# Docker management
bun run docker:logs       # View service logs
bun run docker:down       # Stop all services
```

### Environment URLs
- **Frontend**: http://localhost:3000
- **API**: http://localhost:3001
- **API Docs**: http://localhost:3001/docs
- **Database**: localhost:5432

### Key Configuration Files
- `docker-compose.yml` - Development environment
- `turbo.json` - Monorepo build configuration
- `.env` - Environment variables
- `packages/db/schema.ts` - Database schema
- `apps/api/src/index.ts` - API routes

This architecture documentation provides a comprehensive overview of the Modern SaaS Template. For specific implementation details, refer to the individual component documentation and source code.