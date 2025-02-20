#!/bin/bash

# This script creates a backup of the project directory
# It stops the service before backup and starts it afterward
# Excludes .next and node_modules directories

# Get the directory name of the project (one level up from the script location)
PROJECT_DIR=$(dirname "$(dirname "$(readlink -f "$0")")")
PROJECT_NAME=$(basename "$PROJECT_DIR")
BACKUP_DIR="../${PROJECT_NAME}_backup_$(date +%Y%m%d_%H%M%S)"
SCRIPT_DIR="$(dirname "$(readlink -f "$0")")"

# Stop the service before backup
echo "Stopping service before backup..."
"$SCRIPT_DIR/service.sh" stop
if [ $? -ne 0 ]; then
    echo "Error: Failed to stop service!"
    exit 1
fi

# Create backup
echo "Creating backup in $BACKUP_DIR..."
mkdir -p "$BACKUP_DIR"

# Exclude .next and node_modules directories when copying
rsync -av --exclude='.next' --exclude='node_modules' "$PROJECT_DIR/" "$BACKUP_DIR/"
BACKUP_STATUS=$?

# Start the service after backup
echo "Starting service after backup..."
"$SCRIPT_DIR/service.sh" start

if [ $BACKUP_STATUS -eq 0 ]; then
    echo "Backup completed successfully!"
    echo "Backup location: $BACKUP_DIR"
else
    echo "Error: Backup failed!"
    exit 1
fi
