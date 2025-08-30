# AI Coding Agent Instructions

## Architecture Overview

This is a **monorepo SaaS starter kit** using Turbo for orchestration with three main components:

- **Frontend**: Next.js 14 with App Router (`apps/web/`)
- **Backend**: Hono.js API server (`apps/api/`)
- **Database**: Shared Drizzle ORM package (`packages/db/`)

## Tech Stack Patterns

### Development Workflow (Docker-First)
```bash
# PRIMARY: Full-stack development with Docker (recommended)
docker-compose up --build

# Alternative: Local development (requires local PostgreSQL)
bun run dev

# Database operations (works in both Docker and local)
cd packages/db && bun run generate  # Generate migrations
cd packages/db && bun run push      # Push schema changes
```

### Docker Development Setup
- **Hot Reloading**: Enabled by default with volume mounts
- **Services**: Frontend (port 3000), API (port 3001), Database (port 5432)
- **Environment**: All services share `.env` file via volume mounts
- **Dependencies**: Automatic dependency installation on container build
- **File Watching**: Changes trigger automatic rebuilds and reloads

### Docker Workflow
```bash
# Start development environment
docker-compose up --build

# Make code changes - hot reloading automatically applies them
# Frontend: http://localhost:3000
# API: http://localhost:3001
# Database: localhost:5432

# View logs from specific service
docker-compose logs -f web
docker-compose logs -f api

# Stop environment
docker-compose down

# Rebuild after dependency changes
docker-compose up --build --force-recreate
```

### Environment Setup
- Copy `.env.example` to `.env`
- **Database URL**: Use `postgresql://user:password@db:5432/saas_db` for Docker, `postgresql://user:password@localhost:5432/saas_db` for local development
- All external services use prefixed environment variables:
  - `NEXT_PUBLIC_CLERK_*` - Authentication
  - `STRIPE_*` - Payment processing
  - `RESEND_*` - Email service
  - `SENTRY_*` - Error monitoring
  - `POSTHOG_*` - Analytics

### Authentication & Route Protection
```typescript
// middleware.ts - Route protection
export default authMiddleware({
  publicRoutes: ['/', '/dashboard'],
  ignoredRoutes: ['/api/(.*)']
})

// Component-level auth
import { SignedIn, SignedOut, SignInButton } from '@clerk/nextjs'

<SignedIn>
  {/* Protected content */}
</SignedIn>
<SignedOut>
  <SignInButton mode="modal" />
</SignedOut>
```

### Database Operations
```typescript
// packages/db/index.ts - Database connection
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

const client = postgres(process.env.DATABASE_URL!)
export const db = drizzle(client, { schema })

// Usage in API routes
import { db, users } from '@saas/db'
const result = await db.select().from(users)
```

### State Management
```typescript
// lib/store.ts - Zustand pattern
import { create } from 'zustand'

interface AppState {
  count: number
  increment: () => void
}

export const useStore = create<AppState>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
}))
```

### API Structure
```typescript
// apps/api/src/index.ts - Hono.js pattern
import { Hono } from 'hono'

const app = new Hono()

app.get('/', (c) => c.text('Hello from Hono API!'))

export default {
  port: 3001,
  fetch: app.fetch,
}
```

## Key Conventions

### File Organization
- **Routes**: `app/` directory for Next.js App Router
- **Components**: Colocate with pages or in shared directories
- **Database**: All schema and queries in `packages/db/`
- **Environment**: Service-prefixed variables in `.env`

### Naming Conventions
- **Variables**: Use camelCase (e.g., `userName`, `apiResponse`, `isActive`)
- **Functions**: Use camelCase (e.g., `getUserData()`, `processPayment()`, `validateInput()`)
- **Files**: Use kebab-case (e.g., `user-profile.tsx`, `api-handler.ts`, `database-schema.ts`)
- **Database Tables/Columns**: Use snake_case (e.g., `user_id`, `created_at`, `is_admin`)
- **Components**: Use PascalCase for React components (e.g., `UserProfile`, `ApiHandler`), but prefer kebab-case for file names
- **Constants**: Use UPPER_SNAKE_CASE (e.g., `MAX_RETRY_COUNT`, `API_BASE_URL`)

### Development Commands
- `docker-compose up --build` - **PRIMARY**: Start all services with hot reloading
- `docker-compose up -d --build` - Start in background
- `docker-compose down` - Stop all services
- `docker-compose logs -f` - View logs from all services
- `bun run dev` - Alternative local development (requires local PostgreSQL)
- Database migrations: `cd packages/db && bun run generate`

### Route Protection
- Public routes listed in `middleware.ts`
- Admin routes protected by Clerk authentication
- API routes ignored by auth middleware

### Database Schema
- Define tables in `packages/db/schema.ts`
- Use Drizzle ORM for type-safe queries
- Generate migrations with `drizzle-kit generate:pg`

## Common Patterns

### Adding New Features
1. **Frontend pages**: Create in `apps/web/app/`
2. **API endpoints**: Add to `apps/api/src/index.ts`
3. **Database changes**: Update `packages/db/schema.ts`
4. **Environment vars**: Add to `.env.example` with service prefix

### Error Handling
- Use Sentry for error tracking
- Validate inputs with Zod in API routes
- Handle auth errors with Clerk components

### Styling
- Tailwind CSS with utility classes
- Responsive design patterns
- Consistent color schemes for different sections

## Deployment

### Vercel (Recommended)
- Connect GitHub repo to Vercel
- Set environment variables in Vercel dashboard
- Automatic deployments on push

### Docker Production
```bash
docker-compose -f docker-compose.prod.yml up --build
```

## Testing & Quality

### Available Scripts
```bash
bun run lint    # ESLint
bun run test    # Run tests
bun run build   # Production build
```

### Code Quality
- TypeScript strict mode enabled
- ESLint with Next.js rules
- Prettier for consistent formatting

## Integration Points

### External Services
- **Clerk**: Authentication & user management
- **Stripe**: Subscription billing & payments
- **Resend**: Transactional emails
- **Sentry**: Error monitoring & performance
- **PostHog**: User analytics & behavior tracking

### Cross-Service Communication
- Frontend calls API at `http://localhost:3001` (or `http://api:3001` in Docker)
- Shared database connection via `packages/db/`
- Environment variables shared across services
- Database URL: `postgresql://user:password@db:5432/saas_db` (Docker) or `postgresql://user:password@localhost:5432/saas_db` (local)</content>
<parameter name="filePath">/Users/raphaelmansuy/Github/10-demos/stack01/.github/copilot-instructions.md
