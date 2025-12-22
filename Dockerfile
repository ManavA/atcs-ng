# Build stage
FROM node:20-alpine AS builder

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
FROM nginx:alpine AS production

# Install envsubst for environment variable substitution
RUN apk add --no-cache gettext

# Copy nginx config as template
COPY nginx.conf /etc/nginx/conf.d/default.conf.template

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy entrypoint script
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Expose port 8080 (Cloud Run default)
EXPOSE 8080

# Default API gateway URL (override in Cloud Run)
ENV API_GATEWAY_URL=http://localhost:8080

# Use entrypoint script
ENTRYPOINT ["/docker-entrypoint.sh"]
