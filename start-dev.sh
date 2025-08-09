#!/bin/bash
# Development server startup script
set -e

echo "🚀 Starting Skify Development Server..."

# Kill any existing processes
pkill -f "tsx\|vite\|node" 2>/dev/null || true

# Start the integrated dev server with tsx
echo "📡 Starting integrated development server..."
NODE_ENV=development npx tsx server/index.ts &
SERVER_PID=$!

# Wait for server to start
sleep 5

echo "✅ Development server started successfully!"
echo "📍 Frontend: http://localhost:5000"
echo "📍 API: http://localhost:5000/api"
echo "📍 Health: http://localhost:5000/health"

# Keep script running
wait $SERVER_PID