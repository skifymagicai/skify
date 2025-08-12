#!/bin/bash
# Skify Production Deployment Script
# Usage: ./deploy-production.sh

set -e

# 1. Build frontend and backend
npm install
npm run build

# 2. Run database migrations
npx drizzle-kit push

# 3. Start server (using PM2 for production)
npm install -g pm2
pm2 start dist/index.js --name skify-server --env production

# 4. Show status
pm2 status

echo "\n🚀 Skify deployed and running in production mode!"
