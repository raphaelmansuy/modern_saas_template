# SaaS Starter Kit

This is a starter kit for building SaaS applications using the specified tech stack.

## Tech Stack

- Frontend: Next.js with App Router, Tailwind CSS, Zustand
- Backend: Hono.js
- Database: PostgreSQL with Drizzle ORM
- Auth: Clerk
- Payments: Stripe
- Email: Resend
- Monitoring: Sentry
- Analytics: PostHog
- Deployment: Vercel
- Runtime: Bun

## Quick Start

1. **Clone and install dependencies:**
   ```bash
   git clone <your-repo>
   cd saas-starter
   bun install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

3. **Start development servers:**
   ```bash
   # RECOMMENDED: Docker development (includes PostgreSQL)
   bun run dev:docker

   # Alternative: Local development (requires local PostgreSQL)
   bun run dev:local

   # Or use Make commands
   make dev
   ```

4. **Open your browser:**
   - Frontend: http://localhost:3000
   - API: http://localhost:3001

## Development Commands

### Docker Development (Recommended)
```bash
# Start all services with hot reloading
bun run dev:docker

# Start in background
bun run dev:docker:background

# Stop services
bun run docker:down

# View logs
bun run docker:logs
bun run docker:logs:web
bun run docker:logs:api
bun run docker:logs:db

# Rebuild containers
bun run docker:rebuild

# Reset database (removes all data)
bun run db:reset
```

### Database Management
```bash
# Generate migrations
bun run db:generate

# Push schema changes
bun run db:push

# Open Drizzle Studio
bun run db:studio
```

### Local Development
```bash
# Start local development (requires PostgreSQL)
bun run dev:local

# Install dependencies
bun run install

# Clean up
bun run clean
```

### Make Commands (Alternative)
```bash
# Quick development start
make dev

# Database operations
make db-studio
make db-reset

# Logs
make logs
make logs-web

# Cleanup
make clean
```

## Features

- **Authentication**: Clerk-powered user authentication with protected admin routes
- **Admin Dashboard**: Protected admin panel at `/admin` with user management, analytics, and settings
- **User Profile**: Personal profile page at `/profile` showing account information and quick actions
- **Database**: PostgreSQL with Drizzle ORM for type-safe queries
- **State Management**: Zustand for client-side state
- **Styling**: Tailwind CSS with responsive design
- **Docker Support**: Full containerization with docker-compose

## Project Structure

- `apps/web`: Next.js frontend
- `apps/api`: Hono.js backend
- `packages/db`: Drizzle database schema
- `packages/ui`: Shared UI components (to be added)
- `packages/auth`: Auth utilities (to be added)

## Development

### Prerequisites
- Node.js 18+ or Bun
- Docker & Docker Compose (for containerized development)
- PostgreSQL (if running locally)

### Environment Setup
Copy `.env.example` to `.env` and fill in your API keys:
- Clerk (authentication)
- Stripe (payments)
- Resend (email)
- Sentry (monitoring)
- PostHog (analytics)

### Available Scripts
```bash
# Development
bun run dev:docker          # Start Docker development (recommended)
bun run dev:local           # Start local development
bun run dev                 # Start with Turbo (local)

# Docker management
bun run docker:up           # Start Docker services
bun run docker:down         # Stop Docker services
bun run docker:logs         # View all logs
bun run docker:rebuild      # Rebuild containers

# Database
bun run db:generate         # Generate migrations
bun run db:push             # Push schema changes
bun run db:studio           # Open Drizzle Studio
bun run db:reset            # Reset database

# Utilities
bun run install             # Install dependencies
bun run clean               # Clean up Docker volumes and node_modules
bun run lint                # Run linting
bun run test                # Run tests
bun run build               # Build for production
```

## Docker Development

The project includes Docker support for consistent development environments:

```bash
# Start all services
docker-compose up --build

# Start in background
docker-compose up -d --build

# Stop services
docker-compose down

# View logs
docker-compose logs -f
```

## Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push

### Manual Deployment
```bash
# Build the application
bun run build

# Start production server
bun run start
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

This project is licensed under the MIT License.
