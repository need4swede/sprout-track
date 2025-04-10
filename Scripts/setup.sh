#!/bin/bash

# This script performs the initial setup for the Sprout Track application:
# 1. Installs dependencies
# 2. Generates the Prisma client
# 3. Runs database migrations (creates the database schema)
# 4. Seeds the database with initial data (creates default settings with PIN 111222 and adds units)

# Get the project directory (one level up from the script location)
PROJECT_DIR=$(dirname "$(dirname "$(readlink -f "$0")")")
cd "$PROJECT_DIR" || exit 1

echo "Starting Sprout Track setup..."

# Step 1: Install dependencies
echo "Step 1: Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "Error: npm install failed! Setup aborted."
    exit 1
fi
echo "Dependencies installed successfully."

# Step 2: Generate Prisma client
echo "Step 2: Generating Prisma client..."
npm run prisma:generate
if [ $? -ne 0 ]; then
    echo "Error: Prisma client generation failed! Setup aborted."
    exit 1
fi
echo "Prisma client generated successfully."

# Step 3: Run database migrations
echo "Step 3: Running database migrations..."
npm run prisma:migrate
if [ $? -ne 0 ]; then
    echo "Error: Prisma migrations failed! Setup aborted."
    exit 1
fi
echo "Database migrations applied successfully."

# Step 4: Seed the database (creates default settings with PIN 111222)
echo "Step 4: Seeding the database with default settings and units..."
npm run prisma:seed
if [ $? -ne 0 ]; then
    echo "Error: Database seeding failed! Setup aborted."
    exit 1
fi
echo "Database seeded successfully with default settings (PIN: 111222) and units."

echo "-------------------------------------"
echo "Sprout Track setup completed successfully!"
echo "Default security PIN: 111222"
echo "You can now run the development server using: npm run dev"
echo "-------------------------------------"

exit 0
