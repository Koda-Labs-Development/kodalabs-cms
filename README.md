# KodaLabs CMS

Multi-tenant headless CMS powered by Payload CMS with AI content generation for all KodaLabs projects.

## 🎯 Purpose

Centralized content management system that:
- **Serves multiple websites** from one installation (PJ-CLT Calculator, KodaLabs main site, future projects)
- **AI-powered content generation** using Claude API for automated article creation
- **Multi-language support** (Portuguese, English, Spanish)
- **Human review workflow** for quality assurance
- **Next.js ISR integration** for optimal performance

## 🏗️ Architecture

### Technology Stack
- **CMS**: Payload CMS v3 (latest)
- **Database**: PostgreSQL 16
- **Editor**: Lexical Rich Text
- **Runtime**: Node.js 20+
- **Language**: TypeScript
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
- PostgreSQL 16+ (or Docker)
- Git

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

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Generate Payload secret**
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

5. **Start development server**
   ```bash
   # With local MongoDB
   npm run dev

   # Or with Docker
   npm run docker:dev
   ```

6. **Access CMS Admin**
   - URL: http://localhost:3001/admin
   - Create your first admin user

## 📋 Available Scripts

### Development
```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run serve            # Run production build
npm run generate:types   # Generate TypeScript types
```

### AI Content Generation
```bash
npm run ai:create-post   # Generate blog post with AI
```

### Docker
```bash
npm run docker:build     # Build Docker image
npm run docker:dev       # Start development containers
npm run docker:prod      # Start production containers
```

## 📚 Collections

### Core Collections
- **Sites** - Multi-tenant site configuration
- **Posts** - Blog articles with AI metadata
- **Categories** - Content taxonomy
- **Tags** - Content labeling
- **Authors** - Content creators
- **Media** - File uploads and images
- **Users** - Admin and editor accounts

### Multi-Language Support
All content supports:
- Portuguese (pt) - default
- English (en)
- Spanish (es)

## 🔐 Environment Variables

Required configuration (see `.env.example`):

```bash
# Server
PORT=3001
PAYLOAD_SECRET=your-secret-here
PAYLOAD_PUBLIC_SERVER_URL=http://localhost:3001

# Database (PostgreSQL)
DATABASE_URL=postgresql://kodalabs_cms:password@localhost:5432/kodalabs_cms

# CORS (for frontend apps)
CORS_ORIGIN_PJ_CLT=https://pjouclt.com.br
CORS_ORIGIN_KODALABS=https://kodalabs.dev

# AI Content Generation
ANTHROPIC_API_KEY=sk-ant-your-key

# Webhooks (optional)
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

## 🐳 Docker Deployment

### Development
```bash
docker-compose -f deployment/docker/docker-compose.dev.yml up
```

### Production
```bash
# Build image
docker build -t kodalabs-cms:latest -f deployment/docker/Dockerfile .

# Deploy
docker-compose -f deployment/docker/docker-compose.prod.yml up -d
```

## 📖 Documentation

Complete documentation available in `/docs`:
- [API Documentation](docs/API.md)
- [Multi-Tenant Setup](docs/MULTI-TENANT.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [AI Content Generation](docs/AI-INTEGRATION.md)

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
5. Write content using rich text editor
6. Set status to "published"
7. Webhook triggers frontend rebuild

**AI-Generated:**
```bash
# Edit scripts/ai-content-generator.ts with your topic
npm run ai:create-post

# AI creates draft post
# Review in admin panel
# Approve and publish
```

## 🔍 Troubleshooting

### PostgreSQL Connection Issues
```bash
# Check PostgreSQL is running
docker ps | grep postgres

# View logs
docker logs kodalabs-cms-postgres

# Connect to database
docker exec -it kodalabs-cms-postgres psql -U kodalabs_cms
```

### Build Errors
```bash
# Clean and rebuild
rm -rf dist/ build/ node_modules/
npm install
npm run build
```

### TypeScript Errors
```bash
# Regenerate types
npm run generate:types
```

## 📊 Project Structure

```
kodalabs-cms/
├── src/
│   ├── collections/        # Payload collections
│   ├── access/            # Access control
│   ├── hooks/             # Lifecycle hooks
│   ├── fields/            # Reusable fields
│   ├── payload.config.ts  # Main config
│   └── server.ts          # Express server
├── scripts/               # Automation scripts
├── deployment/            # Docker configs
├── docs/                  # Documentation
├── public/                # Static files
├── package.json
├── tsconfig.json
└── .env.example
```

## 🚀 Roadmap

- [x] Phase 1: Repository setup
- [ ] Phase 2: Blog UI integration
- [ ] Phase 3: AI content generation
- [ ] Phase 4: Production deployment
- [ ] Phase 5: Multi-site expansion

## 📞 Support

- **Documentation**: `/docs` directory
- **Issues**: GitHub Issues
- **Project**: Part of KodaLabs ecosystem

---

**Version**: 1.1.0
**Status**: Phase 1 - Repository Setup Complete (PostgreSQL Migration)
**Database**: PostgreSQL 16 (aligned with VPS infrastructure)
**Next**: Phase 2 - Payload v3 Configuration
