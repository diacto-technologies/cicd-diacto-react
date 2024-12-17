#!/bin/bash

echo "Starting app_start.sh script..."

# Change to project directory
cd /home/ubuntu/ditacto
 chmod +x /home/ubuntu/ditacto/scripts/app_start.sh  
# Run npm start in the background
echo "Starting the React app in the background..."
nohup npm start > app_start.log 2>&1 &

echo "React app started successfully in the background"
