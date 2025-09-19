# SaaS Starter Kit

A production-ready SaaS starter kit with authentication, payments, and modern UI components. Built with Next.js 14, Hono.js, PostgreSQL, and Stripe.

## 🚀 Quick Start

### Docker Development (Recommended)

```bash
# Clone and setup
git clone <your-repo>
cd saas-starter
cp .env.example .env

# Start all services with hot reloading
bun run dev:docker

# Access your app
# Frontend: http://localhost:3000
# API: http://localhost:3001
# Database: localhost:5432
```

### Local Development

```bash
# Requires local PostgreSQL
bun install
bun run dev:local
```

## 🏗️ Tech Stack

- **Frontend**: Next.js 14 (App Router), Tailwind CSS, Zustand
- **Backend**: Hono.js API with OpenAPI/Swagger docs
- **Database**: PostgreSQL with Drizzle ORM
- **Auth**: Clerk authentication
- **Payments**: Stripe with webhooks
- **Email**: Resend
- **Monitoring**: Sentry
- **Analytics**: PostHog
- **Deployment**: Vercel
- **Runtime**: Bun
- **Monorepo**: Turbo

## 📁 Project Structure

```text
├── apps/
│   ├── web/          # Next.js frontend
│   └── api/          # Hono.js backend
├── packages/
│   ├── db/           # Database schema & queries
│   ├── ui/           # Shared UI components
│   └── auth/         # Auth utilities
├── docs/             # Comprehensive documentation
└── docker/           # Docker configuration
```

## 📚 Documentation

Comprehensive architecture and deployment documentation is available in the [`./docs`](./docs/) directory:

- **[📖 Documentation Index](./docs/README.md)** - Complete documentation overview
- **[🏗️ Architecture Guide](./docs/architecture.md)** - Detailed system architecture
- **[📊 Component Diagrams](./docs/component-diagrams.md)** - Visual system interactions
- **[🔌 API Reference](./docs/api-reference.md)** - Complete API documentation
- **[🚀 Deployment Guide](./docs/deployment-guide.md)** - Production deployment strategies
- **[🗄️ Database Guide](./docs/database-deployment.md)** - Database setup and migrations
- **[💳 Stripe Testing](./docs/how_to_test_stripe.md)** - Payment testing workflow

For detailed technical information, deployment instructions, and architectural decisions, please refer to the [documentation index](./docs/README.md).

## 🔧 Key Features

### Authentication & User Management

- Clerk-powered authentication
- Protected routes and middleware
- User profiles and account management
- Admin dashboard access

### Payment Processing

- Full Stripe integration
- Payment intents and webhooks
- Order management with sync capabilities
- Invoice and receipt generation

### Database & API

- Type-safe PostgreSQL queries with Drizzle
- RESTful API with comprehensive endpoints
- OpenAPI/Swagger documentation
- Provisional order handling

### Developer Experience

- Docker-first development
- Hot reloading across all services
- TypeScript throughout
- ESLint and Prettier configured

## 🛠️ Development Commands

```bash
# Development
bun run dev:docker          # Start Docker development
bun run dev:local           # Start local development

# Database
bun run db:push             # Push schema changes
bun run db:studio           # Open Drizzle Studio
bun run db:seed             # Seed database

# Docker management
bun run docker:up           # Start services
bun run docker:down         # Stop services
bun run docker:logs         # View logs

# Utilities
bun run lint                # Run linting
bun run build               # Production build
```

## 🔐 Environment Setup

Copy `.env.example` to `.env` and configure:

```env
# Database
DATABASE_URL="postgresql://user:password@db:5432/saas_db"

# Auth (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."

# Payments (Stripe)
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."

# Email (Resend)
RESEND_API_KEY="re_..."

# Monitoring (Sentry)
SENTRY_DSN="https://..."

# Analytics (PostHog)
NEXT_PUBLIC_POSTHOG_KEY="phc_..."
```

## 📚 API Documentation

- **Swagger UI**: `http://localhost:3001/docs`
- **OpenAPI Spec**: `http://localhost:3001/doc`

## 🚀 Deployment

### Vercel (Recommended)

1. Connect GitHub repository
2. Set environment variables
3. Deploy automatically on push

### Manual Deployment

```bash
bun run build
bun run start
```

## 📖 Available Routes

- `/` - Landing page
- `/dashboard` - User dashboard
- `/profile` - User profile management
- `/products` - Product catalog
- `/admin` - Admin dashboard
- `/admin/order-sync` - Order synchronization
- `/sign-in`, `/sign-up` - Authentication

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes and test
4. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.
