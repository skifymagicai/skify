#!/bin/bash

echo "🧪 Testing Skify AI API Endpoints..."
echo

# Test health endpoint
echo "1. Health Check:"
curl -s "http://localhost:5000/api/health" | head -200
echo -e "\n"

# Test templates endpoint
echo "2. Templates:"
curl -s "http://localhost:5000/api/templates" | head -200
echo -e "\n"

echo "✅ API Testing Complete"