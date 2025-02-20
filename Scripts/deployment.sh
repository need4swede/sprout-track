#!/bin/bash

# This script assumes you have already created a systemd service for the app
# Example service file location: /etc/systemd/system/<SERVICE_NAME>.service
# The service name should be configured in the .env file

# Get the directory name of the project (one level up from the script location)
PROJECT_DIR=$(dirname "$(dirname "$(readlink -f "$0")")")
PROJECT_NAME=$(basename "$PROJECT_DIR")
BACKUP_DIR="../${PROJECT_NAME}_backup_$(date +%Y%m%d_%H%M%S)"

# Read service name from .env file
if [ ! -f "$PROJECT_DIR/.env" ]; then
    echo "Error: .env file not found!"
    exit 1
fi

SERVICE_NAME=$(grep "SERVICE_NAME" "$PROJECT_DIR/.env" | cut -d '"' -f 2)
if [ -z "$SERVICE_NAME" ]; then
    echo "Error: SERVICE_NAME not found in .env file!"
    exit 1
fi

echo "Using service: $SERVICE_NAME"

# Step 1: Stop the service
echo "Stopping $SERVICE_NAME service..."
sudo systemctl stop "$SERVICE_NAME"

# Step 2: Create backup
echo "Creating backup in $BACKUP_DIR..."
mkdir -p "$BACKUP_DIR"
# Exclude .next and node_modules directories when copying
rsync -av --exclude='.next' --exclude='node_modules' "$PROJECT_DIR/" "$BACKUP_DIR/"

# Step 3: Pull latest changes from git
echo "Pulling latest changes from git..."
cd "$PROJECT_DIR" || exit
git pull

# Step 4: Generate Prisma client
echo "Generating Prisma client..."
npm run prisma:generate

# Step 5: Run Prisma migrations
echo "Running database migrations..."
npm run prisma:migrate

# Step 6: Build the application
echo "Building the application..."
npm run build

# Step 7: Restart the service
echo "Starting $SERVICE_NAME service..."
sudo systemctl start "$SERVICE_NAME"

echo "Deployment completed successfully!"
