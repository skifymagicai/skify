#!/bin/sh
# Deploy Skify with Docker Compose
set -e
cp .env.example .env || true
echo "Building containers..."
docker-compose build
echo "Starting services..."
docker-compose up -d
echo "Waiting for backend to be healthy..."
for i in {1..20}; do
  if curl -fs http://localhost:4000/health; then
    echo "Backend healthy!"
    break
  fi
  sleep 3
done
echo "Waiting for frontend to be healthy..."
for i in {1..20}; do
  if curl -fs http://localhost:5173; then
    echo "Frontend healthy!"
    break
  fi
  sleep 3
done
echo "Skify is up and running!"
