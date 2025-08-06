#!/bin/bash
echo "Starting SkifyMagicAI Application..."
cd /home/runner/workspace
export NODE_ENV=development
export PORT=5000
tsx server/index.ts