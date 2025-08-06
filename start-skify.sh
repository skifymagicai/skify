#!/bin/bash

echo "🚀 Starting SkifyMagicAI Application"
echo "==================================="

# Kill existing processes
pkill -f tsx 2>/dev/null || true
pkill -f node 2>/dev/null || true

# Wait for ports to be freed
sleep 3

# Set environment variables
export NODE_ENV=development
export PORT=5000

# Start the application
cd /home/runner/workspace
echo "Starting development server..."
tsx server/index.ts

echo "✅ SkifyMagicAI started successfully!"
echo "Access the application at: http://localhost:5000"