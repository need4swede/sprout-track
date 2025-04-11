#!/bin/bash

# This script sets up the application as a systemd service on Linux
# It prompts for service name and port, then:
# 1. Updates package.json with the explicit port
# 2. Creates a systemd service file
# 3. Installs and enables the service

# Get the project directory (one level up from the script location)
PROJECT_DIR=$(dirname "$(dirname "$(readlink -f "$0")")")
cd "$PROJECT_DIR" || exit 1

echo "Setting up Sprout Track as a systemd service..."

# Prompt for service name
read -p "Enter service name (default: sprout-track): " SERVICE_NAME
SERVICE_NAME=${SERVICE_NAME:-sprout-track}

# Prompt for port
read -p "Enter port number (default: 3000): " PORT
PORT=${PORT:-3000}

# Update .env file with service name
echo "Updating .env with service name..."
if grep -q "SERVICE_NAME=" .env; then
    # Replace existing SERVICE_NAME line
    sed -i "s/SERVICE_NAME=.*/SERVICE_NAME=\"$SERVICE_NAME\"/" .env
else
    # Add SERVICE_NAME line if it doesn't exist
    echo "SERVICE_NAME=\"$SERVICE_NAME\"" >> .env
fi

# Update package.json with explicit port
echo "Updating package.json with port $PORT..."
# Use sed to replace the dev and start scripts with explicit port
sed -i "s/\"dev\": \"next dev\"/\"dev\": \"next dev -p $PORT\"/" package.json
sed -i "s/\"start\": \"next start\"/\"start\": \"next start -p $PORT\"/" package.json

# Create systemd service file
echo "Creating systemd service file..."
SERVICE_FILE="/etc/systemd/system/$SERVICE_NAME.service"

# Check if we have sudo access
if [ "$EUID" -ne 0 ]; then
    echo "This script needs sudo privileges to create the service file."
    echo "Please enter your password when prompted."
    
    # Create service file content
    SERVICE_CONTENT="[Unit]
Description=$SERVICE_NAME - Baby tracking application
After=network.target

[Service]
Type=simple
User=$(whoami)
WorkingDirectory=$PROJECT_DIR
ExecStart=/usr/bin/npm start
Restart=on-failure

[Install]
WantedBy=multi-user.target"

    # Use sudo to write the service file
    echo "$SERVICE_CONTENT" | sudo tee "$SERVICE_FILE" > /dev/null
    
    if [ $? -ne 0 ]; then
        echo "Error: Failed to create service file. Please check your sudo privileges."
        exit 1
    fi
    
    # Reload systemd daemon
    echo "Reloading systemd daemon..."
    sudo systemctl daemon-reload
    
    # Enable the service
    echo "Enabling $SERVICE_NAME service..."
    sudo systemctl enable "$SERVICE_NAME"
    
    # Start the service
    echo "Starting $SERVICE_NAME service..."
    sudo systemctl start "$SERVICE_NAME"
    
    # Check service status
    echo "Checking service status..."
    sudo systemctl status "$SERVICE_NAME"
else
    # We already have sudo privileges
    # Create service file content
    cat > "$SERVICE_FILE" << EOF
[Unit]
Description=$SERVICE_NAME - Baby tracking application
After=network.target

[Service]
Type=simple
User=$(whoami)
WorkingDirectory=$PROJECT_DIR
ExecStart=/usr/bin/npm start
Restart=on-failure

[Install]
WantedBy=multi-user.target
EOF

    # Reload systemd daemon
    echo "Reloading systemd daemon..."
    systemctl daemon-reload
    
    # Enable the service
    echo "Enabling $SERVICE_NAME service..."
    systemctl enable "$SERVICE_NAME"
    
    # Start the service
    echo "Starting $SERVICE_NAME service..."
    systemctl start "$SERVICE_NAME"
    
    # Check service status
    echo "Checking service status..."
    systemctl status "$SERVICE_NAME"
fi

echo "-------------------------------------"
echo "Service setup completed!"
echo "Service name: $SERVICE_NAME"
echo "Port: $PORT"
echo ""
echo "You can manage the service with:"
echo "  sudo systemctl start $SERVICE_NAME"
echo "  sudo systemctl stop $SERVICE_NAME"
echo "  sudo systemctl restart $SERVICE_NAME"
echo "  sudo systemctl status $SERVICE_NAME"
echo ""
echo "The application should be accessible at:"
echo "  http://localhost:$PORT"
echo "-------------------------------------"

exit 0
