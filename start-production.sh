#!/bin/bash

echo "🚀 Starting Skify AI Video Transform Production Server..."
echo "🎯 Mission: End-to-End Viral Video Transformation Platform"
echo ""

# Kill any existing processes
pkill -f "tsx" 2>/dev/null || true

# Build the frontend
echo "📦 Building React PWA frontend..."
export $(grep -v '^#' .env | xargs)
npm run build

# Start the production server
echo "🌟 Starting production server with all features..."
echo "   ✓ AI Style Extraction from viral videos"
echo "   ✓ Template application to user media"
npm ci
echo "   ✓ Real-time processing with job tracking"
echo "   ✓ 4K Ultra HD enhancement (Pro tier)"
echo "   ✓ Saved Templates Library"
echo "   ✓ PWA with offline support"
echo "   ✓ Payment integration ready"
echo ""

# Use environment PORT or default to 3000
export PORT=${PORT:-3000}

# Start the server
tsx server/production-server.ts