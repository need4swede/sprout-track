# Use Node.js LTS as the base image
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Install dependencies first (for better layer caching)
COPY package.json package-lock.json ./
RUN npm ci

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

# Copy entrypoint script
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Set entrypoint
ENTRYPOINT ["docker-entrypoint.sh"]

# Start the application
CMD ["npm", "start"]

# Expose the port
EXPOSE 3000
