#!/bin/bash

# Set the working directory
WORK_DIR="/home/ubuntu/ditacto"

# Change working directory
echo "Changing to working directory: $WORK_DIR"
cd "$WORK_DIR" || { echo "Failed to change directory to $WORK_DIR"; exit 1; }

# Grant execute permissions to after_install.sh
AFTER_INSTALL_SCRIPT="$WORK_DIR/scripts/after_install.sh"
echo "Granting execute permissions to $AFTER_INSTALL_SCRIPT"
chmod +x "$AFTER_INSTALL_SCRIPT" || { echo "Failed to set execute permissions on $AFTER_INSTALL_SCRIPT"; exit 1; }

# Remove unused code
echo "Removing unused code: node_modules and build"
rm -rf node_modules build || { echo "Failed to remove old files"; exit 1; }

# Clear npm cache
echo "Clearing npm cache..."
npm cache clean --force || { echo "Failed to clear npm cache"; exit 1; }
npm cache verify || { echo "Failed to verify npm cache"; exit 1; }

# Install dependencies
echo "Installing dependencies..."
npm install || { echo "Failed to install npm dependencies"; exit 1; }

# Verify specific dependency
if ! npm ls ansi-html-community > /dev/null 2>&1; then
  echo "Error: ansi-html-community is not installed!"
  npm install ansi-html-community || { echo "Failed to install ansi-html-community"; exit 1; }
fi

# Explicitly reinstall babel-preset-react-app
echo "Reinstalling babel-preset-react-app..."
npm uninstall babel-preset-react-app || { echo "Failed to uninstall babel-preset-react-app"; exit 1; }
npm install babel-preset-react-app --save-dev || { echo "Failed to install babel-preset-react-app"; exit 1; }

# Verify babel-preset-react-app installation
if [ ! -f "node_modules/babel-preset-react-app/prod.js" ]; then
  echo "Error: babel-preset-react-app/prod.js not found after installation!"
  exit 1
fi

# Build the project
echo "Building the project..."
npm run build || { echo "Failed to build the project"; exit 1; }

echo "Script completed successfully."
