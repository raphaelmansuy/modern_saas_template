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
   # Option 1: Local development
   bun run dev

   # Option 2: Docker Compose
   docker-compose up --build
   ```

4. **Open your browser:**
   - Frontend: http://localhost:3000
   - API: http://localhost:3001

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
# Install dependencies
bun install

# Start development servers
bun run dev

# Build for production
bun run build

# Start production servers
bun run start

# Run tests
bun run test

# Run linting
bun run lint
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

## Next Steps

- Set up Clerk for authentication
- Configure Stripe for payments
- Add Sentry for monitoring
- Integrate PostHog for analytics
- Deploy to Vercel

## Features

- **Authentication**: Clerk-powered user authentication with protected admin routes
- **Admin Dashboard**: Protected admin panel at `/admin` with user management, analytics, and settings
- **Database**: PostgreSQL with Drizzle ORM for type-safe queries
- **State Management**: Zustand for client-side state
- **Styling**: Tailwind CSS with responsive design

## Project Structure

- `apps/web`: Next.js frontend
- `apps/api`: Hono.js backend
- `packages/db`: Drizzle database schema
- `packages/ui`: Shared UI components (to be added)
- `packages/auth`: Auth utilities (to be added)

## Next Steps

- Set up Clerk for authentication
- Configure Stripe for payments
- Add Sentry for monitoring
- Integrate PostHog for analytics
- Deploy to Vercel
