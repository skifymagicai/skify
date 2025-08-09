#!/bin/bash

echo "🚀 Starting SkifyMagicAI..."

# Kill existing processes
pkill -f "node server" 2>/dev/null || true
pkill -f "tsx server" 2>/dev/null || true

# Wait a moment
sleep 2

# Create uploads directory if it doesn't exist
mkdir -p uploads

# Start SkifyMagicAI server
echo "📱 Launching SkifyMagicAI on port 5000..."
PORT=5000 NODE_ENV=production node server/skify-magic-simple.js

echo "✅ SkifyMagicAI deployed successfully!"