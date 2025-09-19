# SaaS Starter Development Commands
# Colors for better output
BOLD := \033[1m
RESET := \033[0m
GREEN := \033[32m
BLUE := \033[34m
YELLOW := \033[33m
RED := \033[31m
CYAN := \033[36m

.PHONY: help dev dev-local start stop restart status logs clean install prod test
.PHONY: db-create db-create-local db-reset db-setup db-migrate db-seed db-studio db-generate db-push
.PHONY: quick-start full-reset check-deps

# Default target - show help
.DEFAULT_GOAL := help

help: ## 📚 Show this help message
	@echo "$(BOLD)$(BLUE)🚀 SaaS Starter Development Commands$(RESET)"
	@echo ""
	@echo "$(BOLD)$(GREEN)📋 Quick Start:$(RESET)"
	@echo "  $(CYAN)make quick-start$(RESET)  - 🏃‍♂️ Setup and start everything (new users)"
	@echo "  $(CYAN)make dev$(RESET)          - 🐳 Start development with Docker"
	@echo "  $(CYAN)make dev-local$(RESET)    - 💻 Start development locally"
	@echo ""
	@echo "$(BOLD)$(GREEN)🛠  Setup & Installation:$(RESET)"
	@echo "  $(CYAN)setup$(RESET)            - 📦 Initial project setup"
	@echo "  $(CYAN)install$(RESET)          - 📥 Install dependencies"
	@echo "  $(CYAN)check-deps$(RESET)       - ✅ Check system dependencies"
	@echo ""
	@echo "$(BOLD)$(GREEN)🐳 Docker Development:$(RESET)"
	@echo "  $(CYAN)start$(RESET)            - 🚀 Start all services (alias for 'up')"
	@echo "  $(CYAN)stop$(RESET)             - 🛑 Stop all services (alias for 'down')"
	@echo "  $(CYAN)restart$(RESET)          - 🔄 Restart all services"
	@echo "  $(CYAN)status$(RESET)           - 📊 Show service status"
	@echo "  $(CYAN)logs$(RESET)             - 📄 Show all logs"
	@echo "  $(CYAN)logs-web$(RESET)         - 🌐 Show web service logs"
	@echo "  $(CYAN)logs-api$(RESET)         - 🔌 Show API service logs"
	@echo "  $(CYAN)logs-db$(RESET)          - 🗄️  Show database logs"
	@echo ""
	@echo "$(BOLD)$(GREEN)🗃️  Database Management:$(RESET)"
	@echo "  $(CYAN)db-create$(RESET)        - 🆕 Create and seed database from zero (Docker)"
	@echo "  $(CYAN)db-create-local$(RESET)  - 🆕 Create and seed database from zero (Local)"
	@echo "  $(CYAN)db-reset$(RESET)         - 🔄 Reset database (removes all data)"
	@echo "  $(CYAN)db-seed$(RESET)          - 🌱 Seed database with sample data"
	@echo "  $(CYAN)db-studio$(RESET)        - 🎨 Open Drizzle Studio (database GUI)"
	@echo "  $(CYAN)db-push$(RESET)          - ⬆️  Push schema changes to database"
	@echo "  $(CYAN)db-generate$(RESET)      - 📝 Generate database migrations"
	@echo ""
	@echo "$(BOLD)$(GREEN)🧹 Maintenance:$(RESET)"
	@echo "  $(CYAN)clean$(RESET)            - 🧽 Clean up Docker volumes and node_modules"
	@echo "  $(CYAN)full-reset$(RESET)       - 💥 Complete reset (clean + db-create)"
	@echo "  $(CYAN)test$(RESET)             - 🧪 Run tests"
	@echo ""
	@echo "$(BOLD)$(GREEN)🚀 Production:$(RESET)"
	@echo "  $(CYAN)prod$(RESET)             - 🏭 Start production environment"
	@echo ""
	@echo "$(BOLD)$(YELLOW)💡 Tips:$(RESET)"
	@echo "  • First time? Run: $(CYAN)make quick-start$(RESET)"
	@echo "  • Need a fresh start? Run: $(CYAN)make full-reset$(RESET)"
	@echo "  • Check logs if something fails: $(CYAN)make logs$(RESET)"

# 🏃‍♂️ Quick Start Commands
quick-start: check-deps setup db-create dev ## 🚀 Complete setup for new users (recommended)
	@echo "$(BOLD)$(GREEN)✅ Quick start complete! Your SaaS app is ready!$(RESET)"
	@echo "$(CYAN)🌐 Frontend: http://localhost:3000$(RESET)"
	@echo "$(CYAN)🔌 API: http://localhost:3001$(RESET)"

full-reset: clean db-reset db-create ## 💥 Nuclear option - complete reset
	@echo "$(BOLD)$(GREEN)✅ Full reset complete!$(RESET)"

check-deps: ## ✅ Check system dependencies
	@echo "$(BOLD)$(BLUE)🔍 Checking system dependencies...$(RESET)"
	@command -v docker >/dev/null 2>&1 || { echo "$(RED)❌ Docker is required but not installed$(RESET)"; exit 1; }
	@command -v docker-compose >/dev/null 2>&1 || { echo "$(RED)❌ Docker Compose is required but not installed$(RESET)"; exit 1; }
	@command -v bun >/dev/null 2>&1 || { echo "$(RED)❌ Bun is required but not installed$(RESET)"; exit 1; }
	@echo "$(GREEN)✅ All dependencies are installed!$(RESET)"

# 📦 Setup & Installation
setup: ## 📦 Initial project setup
	@echo "$(BOLD)$(BLUE)🚀 Setting up SaaS Starter...$(RESET)"
	@echo "$(YELLOW)🔧 Running setup script...$(RESET)"
	@./setup.sh
	@echo "$(BOLD)$(GREEN)✅ Setup complete!$(RESET)"

install: ## 📥 Install dependencies
	@echo "$(BOLD)$(BLUE)📦 Installing dependencies...$(RESET)"
	@bun install
	@echo "$(GREEN)✅ Dependencies installed!$(RESET)"

# 🐳 Docker Development Commands
dev: up ## 🐳 Start development with Docker (recommended)
	@echo "$(BOLD)$(GREEN)🚀 Development environment started!$(RESET)"
	@echo "$(CYAN)🌐 Frontend: http://localhost:3000$(RESET)"
	@echo "$(CYAN)🔌 API: http://localhost:3001$(RESET)"
	@echo "$(YELLOW)💡 Run 'make logs' to see service logs$(RESET)"

dev-local: ## 💻 Start development locally
	@echo "$(BOLD)$(BLUE)🚀 Starting local development...$(RESET)"
	@echo "$(YELLOW)⚠️  Starting database with Docker...$(RESET)"
	@docker-compose up -d db
	@echo "$(YELLOW)⚠️  Make sure to configure DATABASE_URL for local connection$(RESET)"
	@bun run dev

start: up ## 🚀 Start all services (alias for 'up')

up: ## 🔧 Start Docker services
	@echo "$(BOLD)$(BLUE)🐳 Starting Docker services...$(RESET)"
	@docker-compose up --build

stop: down ## 🛑 Stop all services (alias for 'down')

down: ## 🔧 Stop Docker services
	@echo "$(BOLD)$(BLUE)🛑 Stopping Docker services...$(RESET)"
	@docker-compose down
	@echo "$(GREEN)✅ Services stopped!$(RESET)"

restart: down up ## 🔄 Restart all services
	@echo "$(BOLD)$(GREEN)🔄 Services restarted!$(RESET)"

status: ## 📊 Show service status
	@echo "$(BOLD)$(BLUE)📊 Service Status:$(RESET)"
	@docker-compose ps

# 📄 Logging Commands
logs: ## 📄 Show all logs
	@echo "$(BOLD)$(BLUE)📄 Showing all service logs...$(RESET)"
	@docker-compose logs -f

logs-web: ## 🌐 Show web service logs
	@echo "$(BOLD)$(BLUE)🌐 Showing web service logs...$(RESET)"
	@docker-compose logs -f web

logs-api: ## 🔌 Show API service logs
	@echo "$(BOLD)$(BLUE)🔌 Showing API service logs...$(RESET)"
	@docker-compose logs -f api

logs-db: ## 🗄️ Show database logs
	@echo "$(BOLD)$(BLUE)🗄️ Showing database logs...$(RESET)"
	@docker-compose logs -f db

# 🚀 Production Commands
prod: ## 🏭 Start production environment
	@echo "$(BOLD)$(BLUE)🏭 Starting production environment with Docker...$(RESET)"
	@docker-compose -f docker-compose.prod.yml up --build
	@echo "$(BOLD)$(GREEN)✅ Production environment started!$(RESET)"

# 🧪 Testing
test: ## 🧪 Run tests
	@echo "$(BOLD)$(BLUE)🧪 Running tests...$(RESET)"
	@bun test
	@echo "$(GREEN)✅ Tests completed!$(RESET)"

# 🗃️ Database Management Commands
db-create: ## 🆕 Create and seed database from zero (Docker)
	@echo "$(BOLD)$(BLUE)🗃️ Creating database from zero...$(RESET)"
	@echo "$(YELLOW)📥 Step 1: Stopping services and removing volumes...$(RESET)"
	@docker-compose down -v
	@echo "$(YELLOW)🚀 Step 2: Starting fresh database service...$(RESET)"
	@docker-compose up -d db
	@echo "$(YELLOW)⏳ Step 3: Waiting for database to be ready...$(RESET)"
	@sleep 10
	@echo "$(YELLOW)📝 Step 4: Pushing database schema...$(RESET)"
	@cd packages/db && DATABASE_URL="postgresql://user:password@localhost:5432/saas_db" bun run push
	@echo "$(YELLOW)🌱 Step 5: Seeding database with sample data...$(RESET)"
	@cd packages/db && DATABASE_URL="postgresql://user:password@localhost:5432/saas_db" bun run seed
	@echo "$(BOLD)$(GREEN)✅ Database created and seeded successfully!$(RESET)"

db-create-local: ## 🆕 Create and seed database from zero (Local PostgreSQL)
	@echo "$(BOLD)$(BLUE)🗃️ Creating database from zero (local PostgreSQL)...$(RESET)"
	@echo "$(YELLOW)⚠️  Note: This assumes you have PostgreSQL running locally$(RESET)"
	@echo "$(YELLOW)📝 Step 1: Pushing database schema...$(RESET)"
	@cd packages/db && DATABASE_URL="postgresql://user:password@localhost:5432/saas_db" bun run push
	@echo "$(YELLOW)🌱 Step 2: Seeding database with sample data...$(RESET)"
	@cd packages/db && DATABASE_URL="postgresql://user:password@localhost:5432/saas_db" bun run seed
	@echo "$(BOLD)$(GREEN)✅ Database created and seeded successfully!$(RESET)"

db-reset: ## 🔄 Reset database (removes all data)
	@echo "$(BOLD)$(RED)⚠️  Resetting database (this will remove ALL data)...$(RESET)"
	@docker-compose down -v
	@docker-compose up -d db
	@echo "$(BOLD)$(GREEN)✅ Database reset complete!$(RESET)"

db-setup: ## 🛠️ Setup database with schema and seed data
	@echo "$(BOLD)$(BLUE)🛠️ Setting up database with schema and seed data...$(RESET)"
	@cd packages/db && bun run push
	@cd packages/db && bun run seed
	@echo "$(BOLD)$(GREEN)✅ Database setup complete!$(RESET)"

db-migrate: ## 🔄 Run database migrations
	@echo "$(BOLD)$(BLUE)🔄 Running database migrations...$(RESET)"
	@cd packages/db && bun run migrate
	@echo "$(GREEN)✅ Migrations complete!$(RESET)"

db-seed: ## 🌱 Seed database with sample data
	@echo "$(BOLD)$(BLUE)🌱 Seeding database with sample data...$(RESET)"
	@cd packages/db && bun run seed
	@echo "$(GREEN)✅ Database seeded successfully!$(RESET)"

db-studio: ## 🎨 Open Drizzle Studio (database GUI)
	@echo "$(BOLD)$(BLUE)🎨 Opening Drizzle Studio...$(RESET)"
	@echo "$(CYAN)🌐 Studio will be available at: https://local.drizzle.studio$(RESET)"
	@cd packages/db && bun run studio

db-generate: ## 📝 Generate database migrations
	@echo "$(BOLD)$(BLUE)📝 Generating database migrations...$(RESET)"
	@cd packages/db && bun run generate
	@echo "$(GREEN)✅ Migrations generated!$(RESET)"

db-push: ## ⬆️ Push schema changes to database
	@echo "$(BOLD)$(BLUE)⬆️ Pushing schema changes to database...$(RESET)"
	@cd packages/db && bun run push
	@echo "$(GREEN)✅ Schema pushed successfully!$(RESET)"
	# 🧹 Maintenance & Cleanup
clean: ## 🧽 Clean up Docker volumes and node_modules
	@echo "$(BOLD)$(BLUE)🧹 Cleaning up Docker volumes and node_modules...$(RESET)"
	@echo "$(YELLOW)🗑️  Stopping services...$(RESET)"
	@docker-compose down -v
	@echo "$(YELLOW)🗑️  Removing Docker volumes...$(RESET)"
	@docker volume prune -f
	@echo "$(YELLOW)🗑️  Removing node_modules...$(RESET)"
	@find . -name "node_modules" -type d -prune -exec rm -rf {} +
	@echo "$(BOLD)$(GREEN)✅ Cleanup complete!$(RESET)"

install: ## 📥 Install all dependencies
	@echo "$(BOLD)$(BLUE)📦 Installing all dependencies...$(RESET)"
	@bun install
	@cd apps/web && bun install
	@cd apps/api && bun install
	@cd packages/db && bun install
	@echo "$(GREEN)✅ All dependencies installed!$(RESET)"

db-migrate:
	@echo "Running database migrations..."
	cd packages/db && DATABASE_URL="postgresql://user:password@localhost:5432/saas_db" bun run migrate

db-seed:
	@echo "Seeding database with sample data..."
	cd packages/db && DATABASE_URL="postgresql://user:password@localhost:5432/saas_db" bun run seed

db-studio:
	@echo "Opening Drizzle Studio..."
	@echo "Note: Drizzle Studio runs on https://local.drizzle.studio (not localhost)"
	@cd packages/db && DATABASE_URL="postgresql://user:password@localhost:5432/saas_db" bun run studio

db-generate:
	@echo "Generating database migrations..."
	cd packages/db && DATABASE_URL="postgresql://user:password@localhost:5432/saas_db" bun run generate

db-push:
	@echo "Pushing schema changes..."
	cd packages/db && DATABASE_URL="postgresql://user:password@localhost:5432/saas_db" bun run push

# Utility commands
clean:
	@echo "Cleaning up..."
	docker-compose down -v
	rm -rf node_modules apps/*/node_modules packages/*/node_modules

install:
	@echo "Installing dependencies..."
	bun install
