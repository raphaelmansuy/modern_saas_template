# SaaS Starter Development Commands
.PHONY: help dev dev-docker dev-local up down logs clean install db-reset db-studio

# Default target
help:
	@echo "Available commands:"
	@echo "  setup         - Initial project setup"
	@echo "  dev           - Start development with Docker (recommended)"
	@echo "  dev-local     - Start development locally (requires PostgreSQL)"
	@echo "  up            - Start Docker services"
	@echo "  down          - Stop Docker services"
	@echo "  logs          - Show all Docker logs"
	@echo "  logs-web      - Show web service logs"
	@echo "  logs-api      - Show API service logs"
	@echo "  logs-db       - Show database logs"
	@echo "  clean         - Clean up Docker volumes and node_modules"
	@echo "  install       - Install dependencies"
	@echo "  db-reset      - Reset database (removes all data)"
	@echo "  db-studio     - Open Drizzle Studio"
	@echo "  db-generate   - Generate database migrations"
	@echo "  db-push       - Push schema changes to database"

# Setup
setup:
	@echo "Setting up project..."
	./setup.sh

# Development commands
dev:
	@echo "Starting development environment with Docker..."
	docker-compose up --build

dev-local:
	@echo "Starting local development..."
	bun run dev

# Docker commands
up:
	docker-compose up --build

down:
	docker-compose down

logs:
	docker-compose logs -f

logs-web:
	docker-compose logs -f web

logs-api:
	docker-compose logs -f api

logs-db:
	docker-compose logs -f db

# Database commands
db-reset:
	@echo "Resetting database..."
	docker-compose down -v
	docker-compose up -d db

db-studio:
	@echo "Opening Drizzle Studio..."
	cd packages/db && bun run drizzle-kit studio

db-generate:
	@echo "Generating database migrations..."
	cd packages/db && bun run generate

db-push:
	@echo "Pushing schema changes..."
	cd packages/db && bun run push

# Utility commands
clean:
	@echo "Cleaning up..."
	docker-compose down -v
	rm -rf node_modules apps/*/node_modules packages/*/node_modules

install:
	@echo "Installing dependencies..."
	bun install
