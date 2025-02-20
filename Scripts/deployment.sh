#!/bin/bash

# This script performs a full deployment:
# 1. Creates a backup
# 2. Updates the application
# Service management is handled by the individual scripts

# Get the script directory
SCRIPT_DIR="$(dirname "$(readlink -f "$0")")"

echo "Starting deployment process..."

# Step 1: Create backup
echo "Step 1: Creating backup..."
"$SCRIPT_DIR/backup.sh"
if [ $? -ne 0 ]; then
    echo "Error: Backup failed! Deployment aborted."
    exit 1
fi

# Step 2: Update application
echo "Step 2: Updating application..."
"$SCRIPT_DIR/update.sh"
if [ $? -ne 0 ]; then
    echo "Error: Update failed! Deployment aborted."
    exit 1
fi

echo "Deployment completed successfully!"
echo "Use '$SCRIPT_DIR/service.sh status' to check service status."
