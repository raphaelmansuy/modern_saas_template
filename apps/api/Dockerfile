FROM oven/bun:latest

WORKDIR /app

# Copy root package files for workspace setup
COPY package.json ./
COPY turbo.json ./

# Copy API package files
COPY apps/api/package.json ./apps/api/

# Copy db package
COPY packages/db/package.json ./packages/db/
COPY packages/db/schema.ts ./packages/db/
COPY packages/db/index.ts ./packages/db/
COPY packages/db/seed.ts ./packages/db/
COPY packages/db/drizzle.config.ts ./packages/db/

# Install dependencies
RUN bun install

# Copy source code
COPY apps/api ./apps/api
COPY packages/db ./packages/db

# Build the application from the API directory
WORKDIR /app/apps/api
RUN bun run build

# Go back to root for running
WORKDIR /app

# Expose port
EXPOSE 3001

# Start the application in production mode
CMD ["bun", "run", "apps/api/dist/index.js"]
