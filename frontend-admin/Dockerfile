# Build stage
FROM node:20-slim as builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy custom nginx configuration if you have one
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Add nginx configuration to handle client-side routing
RUN echo "    location / {" > /etc/nginx/conf.d/default.conf
RUN echo "        root   /usr/share/nginx/html;" >> /etc/nginx/conf.d/default.conf
RUN echo "        index  index.html index.htm;" >> /etc/nginx/conf.d/default.conf
RUN echo "        try_files \$uri \$uri/ /index.html;" >> /etc/nginx/conf.d/default.conf
RUN echo "    }" >> /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]