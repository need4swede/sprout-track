#!/bin/bash

# This script updates the application:
# - Pulls latest changes from git
# - Runs Prisma operations
# - Builds the application

# Get the directory name of the project (one level up from the script location)
PROJECT_DIR=$(dirname "$(dirname "$(readlink -f "$0")")")
SCRIPT_DIR="$(dirname "$(readlink -f "$0")")"

# Stop the service before update
echo "Stopping service before update..."
"$SCRIPT_DIR/service.sh" stop
if [ $? -ne 0 ]; then
    echo "Error: Failed to stop service!"
    exit 1
fi

# Extract current port configuration from package.json before update
echo "Checking current port configuration..."
CURRENT_DEV_PORT=$(grep -o '"dev": "next dev -p [0-9]*"' package.json | grep -o '[0-9]*' || echo "3000")
CURRENT_START_PORT=$(grep -o '"start": "next start -p [0-9]*"' package.json | grep -o '[0-9]*' || echo "3000")
echo "Current port configuration: DEV=$CURRENT_DEV_PORT, START=$CURRENT_START_PORT"

# Stash any local changes before pulling
echo "Stashing any local changes..."
cd "$PROJECT_DIR" || exit 1
git stash
STASH_RESULT=$?

# Pull latest changes from git
echo "Pulling latest changes from git..."
git pull
if [ $? -ne 0 ]; then
    echo "Error: Git pull failed!"
    # Apply stashed changes if there were any
    if [ $STASH_RESULT -eq 0 ]; then
        echo "Applying stashed changes..."
        git stash pop
    fi
    "$SCRIPT_DIR/service.sh" start
    exit 1
fi

# Apply stashed changes if there were any
if [ $STASH_RESULT -eq 0 ]; then
    echo "Applying stashed changes..."
    git stash pop
    # Note: We continue even if there are conflicts, as we'll restore the port configuration anyway
fi

# Restore port configuration if it was changed during update
echo "Restoring port configuration if needed..."
NEW_DEV_PORT=$(grep -o '"dev": "next dev -p [0-9]*"' package.json | grep -o '[0-9]*' || echo "")
NEW_START_PORT=$(grep -o '"start": "next start -p [0-9]*"' package.json | grep -o '[0-9]*' || echo "")

# If port configuration was lost or changed, restore it
if [ "$NEW_DEV_PORT" != "$CURRENT_DEV_PORT" ] || [ -z "$NEW_DEV_PORT" ]; then
    echo "Updating dev port from $NEW_DEV_PORT to $CURRENT_DEV_PORT"
    sed -i "s/\"dev\": \"next dev.*\"/\"dev\": \"next dev -p $CURRENT_DEV_PORT\"/" package.json
fi

if [ "$NEW_START_PORT" != "$CURRENT_START_PORT" ] || [ -z "$NEW_START_PORT" ]; then
    echo "Updating start port from $NEW_START_PORT to $CURRENT_START_PORT"
    sed -i "s/\"start\": \"next start.*\"/\"start\": \"next start -p $CURRENT_START_PORT\"/" package.json
fi

# Install dependencies
echo "Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "Error: npm install failed!"
    "$SCRIPT_DIR/service.sh" start
    exit 1
fi

# Generate Prisma client
echo "Generating Prisma client..."
npm run prisma:generate
if [ $? -ne 0 ]; then
    echo "Error: Prisma client generation failed!"
    "$SCRIPT_DIR/service.sh" start
    exit 1
fi

# Run Prisma migrations
echo "Running database migrations..."
npm run prisma:migrate
if [ $? -ne 0 ]; then
    echo "Error: Prisma migrations failed!"
    "$SCRIPT_DIR/service.sh" start
    exit 1
fi

# Build the application
echo "Building the application..."
npm run build
BUILD_STATUS=$?

# Start the service after update
echo "Starting service after update..."
"$SCRIPT_DIR/service.sh" start

if [ $BUILD_STATUS -eq 0 ]; then
    echo "Update completed successfully!"
else
    echo "Error: Build failed!"
    exit 1
fi
