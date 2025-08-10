#!/bin/bash
cd /home/runner/workspace

while true; do
    echo "Starting Skify application at $(date)"
    NODE_ENV=development PORT=5000 tsx server/index.ts 2>&1 | tee -a robust-skify.log
    exit_code=$?
    echo "Application exited with code $exit_code at $(date)"
    
    # If exit code is 0, it was a clean shutdown, don't restart
    if [ $exit_code -eq 0 ]; then
        echo "Clean shutdown detected, not restarting"
        break
    fi
    
    echo "Restarting in 3 seconds..."
    sleep 3
done
