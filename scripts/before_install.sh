#!/bin/bash

# Change Working Directory
cd /home/ubuntu/ditacto

# Update Package Index
sudo apt-get update

# Remove any existing Node.js/npm to avoid conflicts
sudo apt-get remove --purge -y nodejs npm
sudo apt-get autoremove -y

# Add Node.js 20.x Repository
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Install Node.js
sudo apt-get install -y nodejs

# Install PM2 globally
sudo npm install pm2 -g
