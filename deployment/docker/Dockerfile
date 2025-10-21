# =============================================================================
# KodaLabs CMS - Multi-Stage Docker Build
# =============================================================================
# Payload CMS v3 with PostgreSQL 16 - Production-ready multi-tenant headless CMS
# Built for kodalabs.dev ecosystem (pjouclt.com.br + kodalabs.dev)

# =============================================================================
# Stage 1: Base - Node.js 20 Alpine
# =============================================================================
FROM node:20-alpine AS base

WORKDIR /app

# Install dependencies required for node-gyp and PostgreSQL client
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    postgresql-client

# Copy package files
COPY package*.json ./

# =============================================================================
# Stage 2: Dependencies - Install all packages
# =============================================================================
FROM base AS deps

# Install all dependencies (including devDependencies for build)
RUN npm ci

# =============================================================================
# Stage 3: Builder - Compile TypeScript and build Payload admin UI
# =============================================================================
FROM base AS builder

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Build Payload admin panel (webpack) and compile TypeScript
RUN npm run build

# =============================================================================
# Stage 4: Production - Minimal production image
# =============================================================================
FROM node:20-alpine AS production

WORKDIR /app

# Install only runtime dependencies
RUN apk add --no-cache postgresql-client

# Set production environment
ENV NODE_ENV=production

# Copy built application from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

# Copy Payload admin panel (webpack build) - CRITICAL for v2
COPY --from=builder /app/build ./build

# Copy SCSS stub - CRITICAL to prevent transpilation errors
COPY --from=builder /app/src/register-scss-stub.js ./src/register-scss-stub.js

# Copy public directory for static assets
COPY --from=builder /app/public ./public

# Create media upload directory
RUN mkdir -p public/media && chmod 777 public/media

# Expose Payload CMS port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start Payload CMS server with SCSS stub preloaded (CRITICAL for v2)
CMD ["node", "-r", "./src/register-scss-stub.js", "dist/server.js"]
