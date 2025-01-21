# Use Node.js LTS version as the base image
FROM node:20-slim

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application source code
COPY src/ ./src/

# Set environment variables
ENV NODE_ENV=production

# Expose the port your app runs on
EXPOSE 8080

# Start the application
CMD ["npm", "start"]