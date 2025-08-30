#!/bin/bash

# SaaS Starter Setup Script
echo "🚀 Setting up SaaS Starter Kit..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not available. Please install Docker Compose."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
bun install

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your actual API keys before starting development."
else
    echo "✅ .env file already exists."
fi

# Start Docker services
echo "🐳 Starting Docker services..."
docker-compose up -d --build

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 10

# Generate database schema
echo "🗄️  Setting up database..."
cd packages/db && bun run generate && bun run push

echo "✅ Setup complete!"
echo ""
echo "🌐 Frontend: http://localhost:3000"
echo "🔌 API: http://localhost:3001"
echo "🐘 Database: localhost:5432"
echo ""
echo "📚 Useful commands:"
echo "  bun run docker:logs     - View all logs"
echo "  bun run docker:down     - Stop services"
echo "  bun run db:studio       - Open database UI"
echo ""
echo "Happy coding! 🎉"
