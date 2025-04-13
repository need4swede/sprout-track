# Use Node.js LTS as the base image
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Copy prisma files first
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

# Note: Prisma client generation moved to docker-startup.sh

# Copy application files
COPY . .

# Build the application
RUN npm run build

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Update database URL to point to the volume
ENV DATABASE_URL="file:/db/baby-tracker.db"

# Create volume mount points
VOLUME /db

# Copy startup script that runs migrations and starts the app
COPY docker-startup.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-startup.sh

# Set entrypoint to run migrations before starting the app
ENTRYPOINT ["/usr/local/bin/docker-startup.sh"]

# Start the application
CMD ["npm", "start"]

# Expose the port
EXPOSE 3000
