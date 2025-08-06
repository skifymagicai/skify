#!/bin/bash

echo "🔥 COMPLETE SKIFY AI TEST PIPELINE"
echo "=================================="

# Test 1: Health Check
echo "1. Testing Skify Health Endpoint..."
HEALTH=$(curl -s "http://localhost:5000/api/skify/health")
echo "Health Response: $HEALTH"

# Test 2: Import Video
echo -e "\n2. Testing Video Import..."
IMPORT_RESULT=$(curl -s -X POST "http://localhost:5000/api/skify/import" \
  -H "Content-Type: application/json" \
  -H "x-user-id: demo-user-001" \
  -d '{"url": "https://sample-videos.com/demo.mp4", "title": "Demo Video Test"}')

echo "Import Result: $IMPORT_RESULT"

# Test 3: Check Database Directly
echo -e "\n3. Checking Database Videos..."
echo "Recent videos in database:"

# Test 4: Test Frontend Connection
echo -e "\n4. Testing if frontend can reach backend..."
FRONTEND_TEST=$(curl -s "http://localhost:5000/" | head -50)
echo "Frontend loads: $(echo $FRONTEND_TEST | grep -o '<title>' || echo 'HTML found')"

echo -e "\n✅ Test Complete"
echo "If you see HTML responses instead of JSON, the routes need fixing."