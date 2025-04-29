# Build stage for backend
FROM node:20-alpine AS backend-build

WORKDIR /app/backend

# Copy backend package files
COPY backend/package.json backend/pnpm-lock.yaml* ./

# Install pnpm
RUN npm install -g pnpm

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy the rest of the backend code
COPY backend/ ./

# Build the backend
RUN pnpm run build

# Build stage for frontend
FROM node:20-alpine AS frontend-build

WORKDIR /app/frontend

# Copy frontend package files
COPY frontend/package.json frontend/pnpm-lock.yaml* ./

# Install pnpm
RUN npm install -g pnpm

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy the rest of the frontend code
COPY frontend/ ./

# Set environment variables for the build
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

# Build the frontend
RUN pnpm run build

# Production stage for backend
FROM node:20-alpine AS backend

WORKDIR /app

# Copy built backend from the build stage
COPY --from=backend-build /app/backend/dist ./dist
COPY --from=backend-build /app/backend/package.json ./
COPY --from=backend-build /app/backend/node_modules ./node_modules
COPY --from=backend-build /app/backend/migrations ./migrations
COPY --from=backend-build /app/backend/models ./models
COPY --from=backend-build /app/backend/seeders ./seeders

# Set environment variables
ENV PORT=4000
ENV NODE_ENV=production

# Expose the port
EXPOSE 4000

# Command to start the backend
CMD ["node", "dist/index.js"] 