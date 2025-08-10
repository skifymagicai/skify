#!/bin/bash
# Start Skify Development Server
echo "Starting Skify development server..."
NODE_ENV=development PORT=5000 tsx server/index.ts