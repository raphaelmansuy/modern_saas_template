-- Database initialization script
-- This runs when the PostgreSQL container starts for the first time

-- Create extensions if needed
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable UUID extension for better primary key generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create database if it doesn't exist (this is handled by environment variables)
-- The database is created via POSTGRES_DB environment variable

-- You can add any initial database setup here
-- For example, creating additional databases or users

-- Note: Actual schema creation and seeding is handled by the application
-- This file is kept minimal to avoid conflicts with Drizzle migrations
