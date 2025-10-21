# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**KodaLabs CMS** - Multi-tenant headless CMS powered by Payload CMS v2 with AI content generation.

**Current Status**: ✅ **FULLY OPERATIONAL** - Payload v2 successfully running with PostgreSQL. Development environment tested and working. Ready for VPS production deployment.

**Tech Stack**:
- **Payload CMS v2.30.3** (downgraded from v3 for standalone Express server compatibility)
- **PostgreSQL 16** with `@payloadcms/db-postgres` v0.8.6
- **TypeScript 5.9.3** + Node.js 20+
- **Express 4.21.2** (standalone server - NOT Next.js)
- **Slate Rich Text Editor** v1.5.2 (Payload v2 default)
- **Webpack Bundler** v1.0.7 (for admin panel compilation)
- Docker + Traefik for production deployment

## Development Commands

### Local Development
```bash
# Setup
cp .env.example .env
npm install

# Development (nodemon with TypeScript watching + webpack)
npm run dev                    # Starts on http://localhost:3001/admin

# Production build
npm run build                  # Runs: payload build && tsc
npm run serve                  # Runs production build (requires build first)

# Type generation
npm run generate:types         # Generate TypeScript types from collection schemas
```

### Docker Development
```bash
# Development with PostgreSQL 16
npm run docker:dev             # Starts app + PostgreSQL with hot-reload

# Production deployment (VPS)
npm run docker:build           # Build production Docker image
npm run docker:prod            # Deploy with Traefik networking

# Database debugging
docker logs kodalabs-cms-postgres-dev
docker exec -it kodalabs-cms-postgres-dev psql -U kodalabs_cms
```

### Testing Database Connection
```bash
# Check PostgreSQL health
docker ps | grep postgres

# PostgreSQL health check command
docker exec kodalabs-cms-postgres-dev pg_isready -U kodalabs_cms
```

## How to Access Payload v2

### Development Environment:
- **Admin Panel**: http://localhost:3001/admin
- **REST API**: http://localhost:3001/api
- **Health Check**: http://localhost:3001/api/health

### First-Time Setup:
1. Start containers: `npm run docker:dev`
2. Wait for server to initialize (watch logs for "✅ Payload Admin URL")
3. Open http://localhost:3001/admin
4. Create your first admin user
5. Start managing content!

## Architecture & Key Patterns

### Multi-Tenant Architecture
- Each site has a unique API key for content access
- Site-specific webhooks trigger frontend redeployment on content changes
- Language-specific content (PT, EN, ES) per site
- Separate content collections filtered by site relationship

### Core Collections (✅ Implemented)
Located in `src/collections/`:
- **Sites** - Multi-tenant site configuration with API keys and webhooks
- **Posts** - Blog articles with AI-generated metadata and rich text content
- **Categories** - Hierarchical content taxonomy
- **Tags** - Content labeling and filtering
- **Media** - File uploads managed by Payload
- **Users** - Admin/editor authentication

### Payload v2 Configuration Pattern

**Critical**: The Payload config MUST be at `src/payload.config.ts` and is loaded via the `PAYLOAD_CONFIG_PATH` environment variable.

Key configuration sections:
- **buildConfig()**: Wrapper function from `payload/config` (REQUIRED for v2)
- **Database**: PostgreSQL adapter with `@payloadcms/db-postgres` (v0.8.6)
- **Editor**: Slate Rich Text (`@payloadcms/richtext-slate`)
- **Admin UI**: Webpack bundler (`@payloadcms/bundler-webpack`)
- **Collections**: Array of collection configs with access control, hooks, fields
- **Localization**: Support for PT (default), EN, ES
- **CORS**: Multiple origins configured for each KodaLabs project

### SCSS Transpilation Fix (CRITICAL)

**Problem**: Payload v2's distributed code in `node_modules/` contains `require('./index.scss')` statements that cause Node.js to crash.

**Solution**: `src/register-scss-stub.js` - A require hook that stubs out SCSS file loading.

**Implementation**:
```javascript
// src/register-scss-stub.js
require.extensions['.scss'] = () => {};
require.extensions['.css'] = () => {};
require.extensions['.sass'] = () => {};
```

**Loading**: Via Node's `-r` flag in `nodemon.json`:
```json
{
  "exec": "tsc --skipLibCheck && node -r ./src/register-scss-stub.js dist/server.js"
}
```

**Why Needed**: Payload v2 expects webpack to handle SCSS files, but we compile TypeScript to JavaScript first. The stub prevents Node from trying to load SCSS when Payload initializes.

### Access Control Pattern
Use granular access control functions in `src/access/`:
- Document-level access (create, read, update, delete)
- Field-level access for sensitive data
- Site-based content filtering for multi-tenancy

Example:
```typescript
access: {
  read: ({ req: { user } }) => {
    if (user) return true; // Authenticated users see all
    return { status: { equals: 'published' } }; // Public sees published only
  }
}
```

### Hooks Pattern
Lifecycle hooks in `src/hooks/`:
- **beforeChange**: Validation, data transformation before save
- **afterChange**: Trigger webhooks, send notifications
- **beforeRead**: Filter data based on context
- **afterRead**: Transform data for response

Example use case: Triggering Vercel webhook after post publication

### TypeScript Path Alias
Use `@/*` to reference `src/*`:
```typescript
import { Sites } from '@/collections/Sites';
import { isAdmin } from '@/access/isAdmin';
```

## Environment Variables

**Critical Variables** (see `.env` for values):

```bash
# Server
PAYLOAD_SECRET=<min-32-chars>           # Generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
PAYLOAD_PUBLIC_SERVER_URL=http://localhost:3001
NODE_ENV=development|production

# Database (PostgreSQL)
DATABASE_URL=postgresql://kodalabs_cms:password@localhost:5432/kodalabs_cms
POSTGRES_DB=kodalabs_cms
POSTGRES_USER=kodalabs_cms
POSTGRES_PASSWORD=<16-chars>            # Generate: node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"

# Development (Docker)
PAYLOAD_CONFIG_PATH=src/payload.config.ts
CI=true                                  # Auto-accept database migrations
PAYLOAD_DROP_DATABASE=false

# AI Content Generation (Optional)
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

**Important Notes**:
- `PAYLOAD_SECRET` must be minimum 32 characters
- `DATABASE_URL` uses PostgreSQL connection string format
- All secrets managed via environment variables (no hardcoded values)
- `CI=true` prevents interactive migration prompts in Docker

## Project Structure

```
src/
├── collections/              # Payload CMS collection definitions (✅ Implemented)
├── access/                   # Access control rules and middleware (✅ Implemented)
├── hooks/                    # Lifecycle hooks (beforeChange, afterChange, etc.)
├── fields/                   # Reusable field definitions
├── payload.config.ts         # ✅ MAIN CONFIG - Payload v2 configuration
├── server.ts                 # ✅ Express server with Payload integration
└── register-scss-stub.js     # ✅ CRITICAL - SCSS require hook

scripts/
└── ai-content-generator.ts   # AI-powered content generation script

deployment/docker/
├── Dockerfile                # Multi-stage Docker build (NEEDS UPDATE for v2)
├── docker-compose.dev.yml    # ✅ Development environment (working)
└── docker-compose.prod.yml   # Production with Traefik + PostgreSQL (NEEDS UPDATE)

build/                        # ✅ Webpack-compiled admin panel (auto-generated)
dist/                         # ✅ TypeScript-compiled server code (auto-generated)
```

## Migration Context

**Recent Migrations** (critical for understanding codebase state):

1. **MongoDB → PostgreSQL** (Oct 2025)
   - Switched to `@payloadcms/db-postgres` adapter (v0.8.6)
   - Connection string format changed to `postgresql://` URL
   - All schemas now use PostgreSQL-compatible field types

2. **Payload v3 → v2 DOWNGRADE** (Oct 2025) ⚠️ **CRITICAL CHANGE**
   - **Reason**: Payload v3 requires Next.js, incompatible with standalone Express
   - Lexical → Slate rich text editor
   - Added webpack bundler for admin panel compilation
   - Added SCSS stub to prevent transpilation errors
   - Updated all collection imports to `payload/types`
   - Changed server initialization from `getPayload()` to `payload.init()`

3. **Security Improvements** (Oct 2025)
   - Added `.dockerignore` file
   - Removed hardcoded default credentials from docker-compose files
   - All secrets via environment variables

## VPS Deployment Readiness

### ✅ Ready for Deployment:
- ✅ Payload v2 running successfully in development
- ✅ PostgreSQL database configured and tested
- ✅ Admin panel builds correctly with webpack
- ✅ Environment variables configured
- ✅ Docker development environment working
- ✅ Health check endpoint implemented

### ⚠️ Needs Configuration Before VPS Deploy:

1. **Update Dockerfile** (line 44):
   ```dockerfile
   # Change from:
   RUN npm run build:tsc

   # To:
   RUN npm run build  # Runs: payload build && tsc
   ```

2. **Copy build folder and SCSS stub in Dockerfile**:
   ```dockerfile
   # Add after line 60:
   COPY --from=builder /app/build ./build
   COPY src/register-scss-stub.js ./src/
   ```

3. **Update production docker-compose.yml**:
   - Remove `${PAYLOAD_SECRET}` and `${POSTGRES_PASSWORD}` variable substitutions
   - Use hardcoded values from .env instead (or export to shell before running)
   - Add `CI=true` and `PAYLOAD_DROP_DATABASE=false` environment variables

4. **Update server start command in production**:
   ```bash
   # Ensure it loads the SCSS stub:
   CMD ["node", "-r", "./src/register-scss-stub.js", "dist/server.js"]
   ```

### VPS Deployment Steps:

1. **On VPS, create monitoring network** (if not exists):
   ```bash
   docker network create monitoring_shared_monitoring_network \
     --subnet=172.18.0.0/16
   ```

2. **Copy .env file to VPS**:
   ```bash
   scp .env user@vps:/path/to/kodalabs-cms/
   ```

3. **Build and deploy**:
   ```bash
   npm run docker:build
   npm run docker:prod
   ```

4. **Check logs**:
   ```bash
   docker logs kodalabs-cms-prod
   ```

5. **Create first admin user**:
   - Navigate to https://cms.kodalabs.dev/admin
   - Fill in registration form

## Common Troubleshooting

### SCSS Transpilation Errors
**Error**: `SyntaxError: Invalid or unexpected token` in `.scss` files

**Solution**: Ensure `register-scss-stub.js` is loaded via `-r` flag:
```bash
node -r ./src/register-scss-stub.js dist/server.js
```

### TypeScript Errors After Schema Changes
```bash
npm run generate:types        # Regenerate types from Payload collections
```

### PostgreSQL Connection Issues
```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# View database logs
docker logs kodalabs-cms-postgres-dev

# Connect to database directly
docker exec -it kodalabs-cms-postgres-dev psql -U kodalabs_cms
```

### Interactive Migration Prompts Blocking Server
**Problem**: Server stuck on "Is table created or renamed?" prompts

**Solution**:
1. Set `CI=true` environment variable
2. Add `push: true` in postgresAdapter config
3. Or delete database volume and restart fresh:
   ```bash
   docker-compose -f deployment/docker/docker-compose.dev.yml down -v
   docker-compose -f deployment/docker/docker-compose.dev.yml up -d
   ```

### Build Failures
```bash
# Clean rebuild
rm -rf dist/ build/ node_modules/
npm install
npm run build
```

## Key Implementation Details

### Server Entry Point (`src/server.ts`)
Includes:
- **SCSS stub comment** (loaded via `-r` flag, not imported)
- Express app initialization
- Payload CMS initialization with `payload.init()`
- CORS configuration for multiple origins
- Static file serving from `public/`
- Health check endpoint
- Graceful shutdown handling

### Payload Config (`src/payload.config.ts`)
Includes:
- **buildConfig()** wrapper (REQUIRED for v2)
- PostgreSQL database adapter with `push: true`
- All collection imports and registration
- Webpack bundler configuration
- Slate editor configuration
- Admin user configuration
- Localization setup (PT, EN, ES)
- CORS origins from environment variables

### Collection Schema Pattern
All collections follow:
- Imports from `payload/types` (not `payload`)
- Access control functions (read, create, update, delete)
- Field-level permissions for sensitive data
- Hooks for business logic (validation, webhooks, notifications)
- Slate editor for rich text fields
- Localization for multi-language fields

## Important Conventions

- **Config Path**: Payload config at `src/payload.config.ts` (enforced by `PAYLOAD_CONFIG_PATH`)
- **Build Folder**: Webpack admin panel output in `build/` directory
- **Compiled Output**: TypeScript compiles to `dist/` directory
- **Entry Point**: Production runs `node -r ./src/register-scss-stub.js dist/server.js`
- **SCSS Stub**: CRITICAL for preventing transpilation errors in Payload v2
- **Type Safety**: Run `npm run generate:types` after schema changes
- **No Hardcoded Secrets**: All sensitive data via environment variables
- **Docker Ignore**: `.dockerignore` excludes `node_modules`, `.git`, `dist`, `build`, etc.

## API Patterns

### Public API (Read-Only)
```bash
GET /api/posts?where[site][equals]=site-id&where[status][equals]=published
Headers: Authorization: Bearer {site-api-key}
```

### Admin API (Full Access)
```bash
# Login
POST /api/users/login
Body: {"email": "admin@example.com", "password": "password"}

# Create post
POST /api/posts
Headers: Authorization: Bearer {jwt-token}
Body: {post-data}
```

### Health Check
```bash
GET /api/health
Response: {
  "status": "healthy",
  "timestamp": "2025-10-21T09:53:09.000Z",
  "version": "1.0.0",
  "environment": "development"
}
```

## Docker Networking (Production)

The production setup uses Traefik reverse proxy on a shared monitoring network:

- **App Container IP**: `172.18.0.30`
- **Database Container IP**: `172.18.0.31`
- **Network**: `monitoring_shared_monitoring_network`
- **Domain**: `cms.kodalabs.dev`
- **SSL/TLS**: Automated via Traefik + Let's Encrypt
- **Monitoring**: Prometheus labels configured
