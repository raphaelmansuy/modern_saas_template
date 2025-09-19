# SaaS Starter Development Commands
# Colors for better output
BOLD := \033[1m
RESET := \033[0m
GREEN := \033[32m
BLUE := \033[34m
YELLOW := \033[33m
RED := \033[31m
CYAN := \033[36m

.PHONY: help dev dev-local dev-local-stop start stop restart status logs clean install prod test
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
	@echo "  $(CYAN)make dev-local$(RESET)    - 💻 Start development locally (auto-starts DB)"
	@echo "  $(CYAN)make dev-local-stop$(RESET) - 🛑 Stop local development database"
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
	@echo "$(YELLOW)🔍 Checking environment configuration...$(RESET)"
	@if [ ! -f .env ]; then \
		echo "$(YELLOW)📝 Creating .env file from .env.example...$(RESET)"; \
		cp .env.example .env; \
		echo "$(GREEN)✅ .env file created! Please update it with your credentials.$(RESET)"; \
	else \
		echo "$(GREEN)✅ .env file exists!$(RESET)"; \
	fi
	@echo "$(YELLOW)🔍 Checking if database is already running...$(RESET)"
	@if ! docker-compose ps db | grep -q "Up"; then \
		echo "$(YELLOW)🐳 Starting database with Docker...$(RESET)"; \
		docker-compose up -d db; \
	else \
		echo "$(GREEN)✅ Database is already running!$(RESET)"; \
	fi
	@echo "$(YELLOW)⏳ Waiting for database to be ready...$(RESET)"
	@timeout=60; \
	while [ $$timeout -gt 0 ]; do \
		if docker-compose exec -T db pg_isready -U user -d saas_db >/dev/null 2>&1; then \
			echo "$(GREEN)✅ Database is ready!$(RESET)"; \
			break; \
		fi; \
		echo "$(YELLOW)⏳ Database not ready yet, waiting... ($$timeout seconds left)$(RESET)"; \
		sleep 2; \
		timeout=$$((timeout-2)); \
	done; \
	if [ $$timeout -le 0 ]; then \
		echo "$(RED)❌ Database failed to start within 60 seconds$(RESET)"; \
		exit 1; \
	fi
	@echo "$(YELLOW)📝 Ensuring database schema is up to date...$(RESET)"
	@cd packages/db && DATABASE_URL="postgresql://user:password@localhost:5432/saas_db" bun run push 2>/dev/null || echo "$(YELLOW)⚠️  Schema push skipped (may already be up to date)$(RESET)"
	@echo "$(BOLD)$(GREEN)🚀 Starting local development services...$(RESET)"
	@echo "$(CYAN)🌐 Frontend: http://localhost:3000$(RESET)"
	@echo "$(CYAN)🔌 API: http://localhost:3001$(RESET)"
	@echo "$(CYAN)🗄️  Database: postgresql://user:password@localhost:5432/saas_db$(RESET)"
	@echo "$(YELLOW)💡 Press Ctrl+C to stop development servers$(RESET)"
	@if [ -f .env ]; then \
		echo "$(GREEN)✅ Loading environment variables from .env file$(RESET)"; \
		export $$(cat .env | grep -v '^#' | xargs) && bun run dev; \
	else \
		echo "$(YELLOW)⚠️  No .env file found, using default DATABASE_URL$(RESET)"; \
		DATABASE_URL="postgresql://user:password@localhost:5432/saas_db" bun run dev; \
	fi

dev-local-stop: ## 🛑 Stop local development database
	@echo "$(BOLD)$(BLUE)🛑 Stopping local development database...$(RESET)"
	@if docker-compose ps db | grep -q "Up"; then \
		echo "$(YELLOW)🐳 Stopping database container...$(RESET)"; \
		docker-compose stop db; \
		echo "$(GREEN)✅ Database stopped!$(RESET)"; \
	else \
		echo "$(YELLOW)ℹ️  Database is not running$(RESET)"; \
	fi

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
