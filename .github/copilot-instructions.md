# AI Coding Agent Instructions

## Architecture Overview

This is a **monorepo SaaS starter kit** using Turbo for orchestration with three main components:

- **Frontend**: Next.js 14 with App Router (`apps/web/`)
- **Backend**: Hono.js API server (`apps/api/`)
- **Database**: Shared Drizzle ORM package (`packages/db/`)

## Tech Stack Patterns

### Development Workflow
```bash
# Start all services (frontend + backend + database)
bun run dev

# Full-stack development with Docker
docker-compose up --build

# Database operations
cd packages/db && bun run generate  # Generate migrations
cd packages/db && bun run push      # Push schema changes
```

### Environment Setup
- Copy `.env.example` to `.env`
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

### Development Commands
- `bun run dev` - Start all services via Turbo
- `docker-compose up --build` - Full development environment
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
- Frontend calls API at `http://localhost:3001`
- Shared database connection via `packages/db/`
- Environment variables shared across services</content>
<parameter name="filePath">/Users/raphaelmansuy/Github/10-demos/stack01/.github/copilot-instructions.md
