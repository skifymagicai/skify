#!/bin/bash
# Start Skify Development Server
echo "Starting Skify development server..."
export $(grep -v '^#' .env | xargs)

npm install
npm run dev
NODE_ENV=development PORT=5000 tsx server/index.ts