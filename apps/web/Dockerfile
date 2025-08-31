FROM oven/bun:latest

WORKDIR /app

# Copy workspace configuration and package files
COPY package.json bun.lock turbo.json ./
COPY packages ./packages

# Copy web package files
COPY apps/web/package.json ./

# Install dependencies
RUN bun install

# Copy web source code
COPY apps/web .

# Expose port
EXPOSE 3000

# Start the application in dev mode
CMD ["bun", "run", "dev"]
