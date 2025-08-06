#!/bin/bash

echo "🧪 Testing Complete Skify AI Analysis Pipeline..."
echo

# 1. Import video
echo "1. Importing demo video..."
IMPORT_RESULT=$(curl -s -X POST "http://localhost:5000/api/skify/import" \
  -H "Content-Type: application/json" \
  -H "x-user-id: demo-user-001" \
  -d '{"url": "https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4", "userId": "demo_user", "title": "Demo Video"}')

echo "Import result: $IMPORT_RESULT"

# Extract video ID (assuming JSON response contains video.id)
VIDEO_ID=$(echo $IMPORT_RESULT | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
echo "Video ID: $VIDEO_ID"

if [ -n "$VIDEO_ID" ]; then
  echo
  echo "2. Starting AI analysis..."
  
  ANALYSIS_RESULT=$(curl -s -X POST "http://localhost:5000/api/skify/analyze" \
    -H "Content-Type: application/json" \
    -H "x-user-id: demo-user-001" \
    -d "{\"videoId\": \"$VIDEO_ID\", \"videoUrl\": \"https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4\", \"options\": {\"extractLyrics\": true, \"detectStyle\": true, \"ocrText\": true}}")
  
  echo "Analysis result: $ANALYSIS_RESULT"
  
  # Extract job ID
  JOB_ID=$(echo $ANALYSIS_RESULT | grep -o '"jobId":"[^"]*"' | cut -d'"' -f4)
  echo "Job ID: $JOB_ID"
  
  if [ -n "$JOB_ID" ]; then
    echo
    echo "3. Checking job status..."
    sleep 2
    
    STATUS_RESULT=$(curl -s "http://localhost:5000/api/skify/jobs/$JOB_ID" \
      -H "x-user-id: demo-user-001")
    
    echo "Job status: $STATUS_RESULT"
  fi
fi

echo
echo "✅ Test Complete"