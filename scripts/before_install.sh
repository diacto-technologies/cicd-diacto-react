#!/bin/bash

set -e  # Exit on error

# Change Working Directory
cd /home/ubuntu/ditacto || exit 1

# Update Package Index
echo "Updating package index..."
sudo apt-get update -y

# Remove any existing Node.js/npm installations
echo "Removing existing Node.js and npm..."
sudo apt-get remove --purge -y nodejs npm || true
sudo apt-get autoremove -y

# Add Node.js 20.x Repository
echo "Adding Node.js 20.x repository..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Install Node.js
echo "Installing Node.js..."
sudo apt-get install -y nodejs

# Verify Node.js and npm versions
echo "Node.js version: $(node -v)"
echo "npm version: $(npm -v)"

# Configure npm registry in .npmrc
echo "Configuring npm registry..."
echo "registry=https://registry.npmmirror.com/" > ~/.npmrc

# Clean npm cache
echo "Cleaning npm cache..."
sudo npm cache clean --force

# Update npm to the latest version
echo "Updating npm to the latest version..."
sudo npm install -g npm@latest

# Install PM2 globally
echo "Installing PM2 globally..."
sudo npm install pm2@latest -g

# Verify PM2 installation
echo "PM2 version: $(pm2 -v)"

echo "Before install script completed successfully!"




# #!/bin/bash

# # Change Working Directory
# cd /home/ubuntu/ditacto

# # Update Package Index
# sudo apt-get update

# # Remove any existing Node.js/npm to avoid conflicts
# sudo apt-get remove --purge -y nodejs npm
# sudo apt-get autoremove -y

# # Add Node.js 20.x Repository
# curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# # Install Node.js
# sudo apt-get install -y nodejs

# # Install PM2 globally
# sudo npm install pm2@latest -g
