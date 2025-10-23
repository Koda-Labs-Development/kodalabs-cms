# KodaLabs CMS

Multi-tenant headless CMS powered by Payload CMS v2 with AI content generation for all KodaLabs projects.

## 🎯 Purpose

Centralized content management system that:
- **Serves multiple websites** from one installation (PJ-CLT Calculator, KodaLabs main site, future projects)
- **AI-powered content generation** using Claude API for automated article creation
- **Multi-language support** (Portuguese, English, Spanish)
- **Human review workflow** for quality assurance
- **Next.js ISR integration** for optimal performance

## 🏗️ Architecture

### Technology Stack
- **CMS**: Payload CMS v2.30.3 (standalone Express server)
- **Database**: PostgreSQL 16
- **Editor**: Slate Rich Text
- **Runtime**: Node.js 20+
- **Language**: TypeScript 5.9.3
- **Deployment**: Docker + Traefik

### Multi-Tenant Design
Each site has:
- Unique API key for content access
- Separate content collections
- Custom webhook for deployment
- Language-specific content

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Docker & Docker Compose
- Git

## ⚠️ Security Notice

**IMPORTANT**: Never commit your `.env` file!

- ✅ Copy `.env.example` to `.env` and fill with your own secrets
- ❌ Never commit `.env` - it's already in `.gitignore`
- 🔒 See [SECURITY.md](SECURITY.md) for complete security guidelines

**Generate secure secrets:**
```bash
# Payload secret (min 32 chars)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# PostgreSQL password
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd kodalabs-cms
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment** ⚠️
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   # ⚠️ NEVER commit the .env file!
   ```

4. **Generate secrets**
   ```bash
   # Payload secret (min 32 chars)
   node -e "console.log('PAYLOAD_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"

   # PostgreSQL password
   node -e "console.log('POSTGRES_PASSWORD=' + require('crypto').randomBytes(16).toString('hex'))"
   ```

5. **Start development server**
   ```bash
   # With Docker (recommended)
   npm run docker:dev
   ```

6. **Access CMS Admin**
   - URL: http://localhost:3001/admin
   - Create your first admin user
   - Start managing content!

## 📋 Available Scripts

### Development
```bash
npm run dev              # Start development server (requires PostgreSQL)
npm run build            # Build Payload admin panel + compile TypeScript
npm run serve            # Run production build
npm run generate:types   # Generate TypeScript types from collections
```

### AI Content Generation
```bash
npm run ai:create-post   # Generate blog post with AI (draft mode)
```

### Docker
```bash
npm run docker:build     # Build production Docker image
npm run docker:dev       # Start development containers (app + PostgreSQL)
npm run docker:prod      # Start production containers
```

## 📚 Collections

### Core Collections (✅ Implemented)
- **Sites** - Multi-tenant site configuration with API keys
- **Posts** - Blog articles with AI-generated metadata
- **Categories** - Hierarchical content taxonomy
- **Tags** - Content labeling and filtering
- **Media** - File uploads and images
- **Users** - Admin and editor accounts

### Multi-Language Support
All content supports:
- Portuguese (pt) - default
- English (en)
- Spanish (es)

## 🔐 Environment Variables

⚠️ **Security Warning**: The `.env` file contains sensitive secrets and must NEVER be committed to git. It's already in `.gitignore` - keep it that way! See [SECURITY.md](SECURITY.md) for details.

Required configuration (see `.env.example`):

```bash
# Server
PORT=3001
PAYLOAD_SECRET=<min-32-chars>              # Generate with crypto.randomBytes(32)
PAYLOAD_PUBLIC_SERVER_URL=http://localhost:3001
NODE_ENV=development

# Database (PostgreSQL 16)
DATABASE_URL=postgresql://kodalabs_cms:password@localhost:5432/kodalabs_cms
POSTGRES_DB=kodalabs_cms
POSTGRES_USER=kodalabs_cms
POSTGRES_PASSWORD=<16-chars>               # Generate with crypto.randomBytes(16)

# Development (Docker)
PAYLOAD_CONFIG_PATH=src/payload.config.ts
CI=true                                    # Auto-accept database migrations
PAYLOAD_DROP_DATABASE=false

# CORS (for frontend apps)
CORS_ORIGIN_PJ_CLT=https://pjouclt.com.br
CORS_ORIGIN_KODALABS=https://kodalabs.dev

# AI Content Generation (Optional)
ANTHROPIC_API_KEY=sk-ant-your-key

# Webhooks (Optional)
WEBHOOK_PJ_CLT=https://api.vercel.com/v1/integrations/deploy/xxx
```

## 🌐 API Usage

### Public API (Read-only)
```bash
# Get published posts for a site
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

## 🐳 Docker Deployment

### Development
```bash
# Start development environment (app + PostgreSQL)
npm run docker:dev

# Access at: http://localhost:3001/admin
```

### Production (VPS)
```bash
# Build production image
npm run docker:build

# Deploy with Traefik networking
npm run docker:prod

# Access at: https://cms.kodalabs.dev/admin
```

## 📖 Documentation

Complete technical documentation in `CLAUDE.md`:
- Payload v2 migration details
- SCSS transpilation fix
- VPS deployment guide
- Troubleshooting guide
- API patterns and examples

## 🤝 Contributing

### Adding a New Site

1. Login to CMS admin panel
2. Navigate to Sites collection
3. Create new site record:
   - Name: "Your Site Name"
   - Slug: "your-site-slug"
   - Domain: "yoursite.com"
   - Default language: Select from PT/EN/ES
4. Copy the auto-generated API key
5. Configure webhook URL (optional)
6. Use API key in your frontend application

### Creating Content

**Manual Creation:**
1. Login to admin panel
2. Navigate to Posts collection
3. Create new post
4. Select site, category, author
5. Write content using Slate rich text editor
6. Set status to "published"
7. Webhook triggers frontend rebuild

**AI-Generated:**
```bash
# Edit scripts/ai-content-generator.ts with your topic
npm run ai:create-post

# AI creates draft post
# Review in admin panel at /admin
# Approve and publish
```

## 🔍 Troubleshooting

### SCSS Transpilation Errors
**Error**: `SyntaxError: Invalid or unexpected token` in `.scss` files

**Solution**: Ensure `register-scss-stub.js` is loaded (already configured in production):
```bash
node -r ./src/register-scss-stub.js dist/server.js
```

### PostgreSQL Connection Issues
```bash
# Check PostgreSQL is running
docker ps | grep postgres

# View database logs
docker logs kodalabs-cms-postgres-dev

# Connect to database directly
docker exec -it kodalabs-cms-postgres-dev psql -U kodalabs_cms
```

### Interactive Migration Prompts
**Problem**: Server stuck on "Is table created or renamed?" prompts

**Solution**: Set `CI=true` environment variable (already configured)

### Build Errors
```bash
# Clean and rebuild
rm -rf dist/ build/ node_modules/
npm install
npm run build
```

### TypeScript Errors
```bash
# Regenerate types from Payload collections
npm run generate:types
```

## 📊 Project Structure

```
kodalabs-cms/
├── src/
│   ├── collections/        # Payload CMS collections (✅ implemented)
│   ├── access/            # Access control rules (✅ implemented)
│   ├── hooks/             # Lifecycle hooks
│   ├── fields/            # Reusable field definitions
│   ├── payload.config.ts  # ✅ Main Payload v2 configuration
│   ├── server.ts          # ✅ Express server with Payload
│   └── register-scss-stub.js  # ✅ SCSS transpilation fix
├── scripts/               # AI content generation
├── deployment/docker/     # Production deployment configs
│   ├── Dockerfile         # ✅ Multi-stage production build
│   ├── docker-compose.dev.yml   # ✅ Development environment
│   └── docker-compose.prod.yml  # ✅ Production with Traefik
├── build/                 # Webpack-compiled admin panel (auto-generated)
├── dist/                  # TypeScript-compiled server (auto-generated)
├── public/                # Static files and media uploads
├── package.json
├── tsconfig.json
├── CLAUDE.md             # ✅ Complete technical documentation
└── .env.example
```

## 🚀 Roadmap

- [x] **Phase 1**: Repository setup & PostgreSQL migration
- [x] **Phase 2**: Payload v2 configuration & collections
- [x] **Phase 3**: SCSS transpilation fix & development environment
- [x] **Phase 4**: Production deployment configuration
- [ ] **Phase 5**: AI content generation integration
- [ ] **Phase 6**: Multi-site expansion
- [ ] **Phase 7**: Advanced webhooks & automation

## 📞 Support

- **Technical Documentation**: See `CLAUDE.md`
- **API Documentation**: Built into Payload admin at `/api-docs`
- **Issues**: GitHub Issues
- **Project**: Part of KodaLabs ecosystem

---

## 🎯 Current Status

**Version**: 2.0.0
**Status**: ✅ **Fully Operational** - Ready for VPS Deployment
**CMS**: Payload v2.30.3 (standalone Express server)
**Database**: PostgreSQL 16
**Environment**: Development ✅ | Production ✅

### What's Working:
- ✅ Payload v2 CMS fully operational
- ✅ PostgreSQL database configured
- ✅ Admin panel at http://localhost:3001/admin
- ✅ REST API endpoints
- ✅ All 6 collections implemented
- ✅ Multi-language support (PT/EN/ES)
- ✅ Health check endpoint
- ✅ Docker development environment
- ✅ Production build configuration

### Next Steps:
1. Deploy to VPS (see `CLAUDE.md` for deployment guide)
2. Create first admin user
3. Configure sites and content
4. Integrate with frontend applications
5. Enable AI content generation

---

**Developed by KodaLabs** | [kodalabs.dev](https://kodalabs.dev)
