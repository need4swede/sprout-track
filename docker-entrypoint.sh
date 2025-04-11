#!/bin/bash
set -e

# Get the application directory
APP_DIR="/app"
DB_DIR="/db"

# Ensure the database directory exists
mkdir -p $DB_DIR

echo "Checking database status..."

# Check if the database exists and has data
# We'll look for the settings table which should be created during initialization
if [ ! -f "$DB_DIR/baby-tracker.db" ] || [ ! -s "$DB_DIR/baby-tracker.db" ]; then
    echo "Database not found or empty. Initializing database..."
    
    # Generate Prisma client
    echo "Generating Prisma client..."
    npm run prisma:generate
    
    # Run database migrations
    echo "Running database migrations..."
    npm run prisma:migrate
    
    # Seed the database with initial data
    echo "Seeding the database with initial data..."
    npm run prisma:seed
    
    echo "Database initialization completed."
else
    echo "Existing database found. Skipping initialization."
    
    # Generate Prisma client
    echo "Generating Prisma client..."
    npm run prisma:generate
    
    # Run database migrations (safe to run even on existing database)
    echo "Running database migrations..."
    npm run prisma:migrate
fi

# Start the Next.js application
echo "Starting Sprout Track application..."
exec "$@"
