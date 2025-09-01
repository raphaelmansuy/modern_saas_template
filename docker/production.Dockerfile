# docker/production.Dockerfile
FROM oven/bun:1 AS base
WORKDIR /app

# Install dependencies
FROM base AS deps
COPY apps/web/package.json ./apps/web/
COPY apps/web/bun.lock ./apps/web/
COPY apps/api/package.json ./apps/api/
COPY packages/db/package.json ./packages/db/
COPY package.json turbo.json ./
RUN bun install

# Build application
FROM deps AS builder
COPY . .
RUN bun run build

# Production image
FROM base AS runner
WORKDIR /app
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /app/apps/web/package.json ./apps/web/
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000
CMD ["node", "apps/web/server.js"]
