#!/bin/bash

# Wait for database to be ready (simple check)
echo "Waiting for database to be ready..."
sleep 5

echo "Starting API server..."
cd apps/api && bun run dev
