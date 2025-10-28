# KodaLabs CMS - Production Deployment Guide

This guide covers deploying KodaLabs CMS to Max's VPS using the automated CI/CD pipeline.

## 📋 Overview

**Deployment Method**: GitHub Actions CI/CD
**Target Environment**: Max's VPS (shared monitoring infrastructure)
**Domain**: https://cms.kodalabs.dev
**Container Registry**: ghcr.io/maxh33/kodalabs-cms
**Network**: monitoring_shared_monitoring_network (172.18.0.30-31)

## 🔐 Prerequisites

### 1. VPS Requirements

Before deployment, ensure the VPS has:

- ✅ **Shared Monitoring Stack Running**
  ```bash
  docker ps | grep traefik
  docker network ls | grep monitoring_shared_monitoring_network
  ```

- ✅ **Available Network IPs**: 172.18.0.30 (app), 172.18.0.31 (postgres)
  ```bash
  docker network inspect monitoring_shared_monitoring_network
  ```

- ✅ **DNS Configuration**: cms.kodalabs.dev → VPS IP

### 2. GitHub Secrets Configuration

Configure the following secrets in repository settings (`Settings > Secrets and variables > Actions`):

#### Required VPS Connection Secrets

| Secret Name | Description | Example |
|------------|-------------|---------|
| `VPS_HOST` | VPS IP address | `123.45.67.89` |
| `VPS_USER` | SSH username | `max` |
| `VPS_KEY` | SSH private key | `-----BEGIN OPENSSH...` |
| `VPS_PASSPHRASE` | SSH key passphrase | `your-passphrase` |

#### Required Container Registry Secret

| Secret Name | Description | How to Generate |
|------------|-------------|-----------------|
| `GHCR_TOKEN` | GitHub Container Registry token | [GitHub Settings > Developer Settings > Personal Access Tokens > Generate new token (classic)](https://github.com/settings/tokens) with `write:packages` and `read:packages` scopes |

#### Required CMS Secrets

| Secret Name | Description | How to Generate |
|------------|-------------|-----------------|
| `PAYLOAD_SECRET` | Payload CMS secret (min 32 chars) | `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `POSTGRES_PASSWORD` | Database password | `node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"` |
| `CORS_ORIGIN_PJ_CLT` | CORS origin | `https://pjouclt.com.br` |
| `CORS_ORIGIN_KODALABS` | CORS origin | `https://kodalabs.dev` |

#### Optional Secrets (Email)

| Secret Name | Description |
|------------|-------------|
| `EMAIL_HOST` | SMTP host (e.g., `smtp.zoho.com`) |
| `EMAIL_USER` | Email username |
| `EMAIL_PASS` | Email password |

#### Optional Secrets (AI & Webhooks)

| Secret Name | Description |
|------------|-------------|
| `ANTHROPIC_API_KEY` | Claude API key for AI content |
| `AI_CONTENT_API_KEY` | Custom AI generator key |
| `WEBHOOK_PJ_CLT` | Vercel deployment webhook |
| `WEBHOOK_KODALABS` | Vercel deployment webhook |
| `SENTRY_DSN` | Sentry error tracking DSN |

## 🚀 Deployment Process

### Automatic Deployment

**Trigger**: Push to `main` branch

```bash
git push origin main
```

The GitHub Actions workflow will:

1. ✅ **Build Docker Image**
   - Multi-stage build with Payload v2
   - Webpack admin panel compilation
   - TypeScript compilation

2. ✅ **Push to Container Registry**
   - Tagged as `ghcr.io/maxh33/kodalabs-cms:prod`

3. ✅ **Deploy to VPS**
   - Copy docker-compose.prod.yml
   - Create .env with all secrets
   - Pull latest image
   - Deploy with Docker Compose
   - Verify health checks

### Manual Deployment (if needed)

If you need to deploy manually:

```bash
# 1. Build and push image
docker build -t ghcr.io/maxh33/kodalabs-cms:prod -f deployment/docker/Dockerfile .
docker push ghcr.io/maxh33/kodalabs-cms:prod

# 2. SSH to VPS
ssh max@VPS_IP

# 3. Navigate to deployment directory
cd ~/kodalabs-cms

# 4. Create .env file (copy from .env.example and fill secrets)
nano .env

# 5. Deploy
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d --force-recreate

# 6. Verify
docker ps | grep kodalabs-cms
docker logs kodalabs-cms-prod
```

## ✅ Post-Deployment Verification

### 1. Check Container Status

```bash
# On VPS
docker ps | grep kodalabs-cms

# Expected output:
# kodalabs-cms-prod      ghcr.io/maxh33/kodalabs-cms:prod   Up X minutes   healthy
# kodalabs-cms-postgres  postgres:16-alpine                 Up X minutes   healthy
```

### 2. Check Container Health

```bash
# Check app health
docker inspect kodalabs-cms-prod --format='{{.State.Health.Status}}'
# Expected: healthy

# Check database health
docker exec kodalabs-cms-postgres pg_isready -U kodalabs_cms
# Expected: /var/run/postgresql:5432 - accepting connections
```

### 3. Test Endpoints

```bash
# Health check endpoint
curl https://cms.kodalabs.dev/api/health
# Expected: {"status":"healthy",...}

# Admin panel (should redirect to login)
curl -I https://cms.kodalabs.dev/admin
# Expected: 200 OK or 302 redirect
```

### 4. Access Admin Panel

1. Open browser: https://cms.kodalabs.dev/admin
2. Create first admin user
3. Verify database connection
4. Test content creation

## 📊 Monitoring Integration

### Prometheus Scraping

The CMS automatically exposes metrics at `/api/metrics` (if implemented).

**Verify Prometheus Discovery**:
```bash
# On VPS
curl -s http://localhost:9090/api/v1/targets | grep kodalabs-cms
```

### Uptime Monitoring

Add CMS to Uptime Kuma:

1. Access: https://uptime.maxhaider.dev
2. Add Monitor:
   - **Type**: HTTP(s)
   - **URL**: https://cms.kodalabs.dev/api/health
   - **Interval**: 60 seconds
   - **Accepted Status**: 200

### Grafana Dashboard

Access Grafana: https://grafana.maxhaider.dev

Create dashboard or import existing Payload CMS dashboard.

## 🔄 Backup Integration

### Add to VPS Backup System

1. SSH to VPS
2. Edit backup manager:
   ```bash
   nano ~/my-portfolio/backup-manager.sh
   ```

3. Add to backup directories:
   ```bash
   DIRS_TO_BACKUP=(
     "/home/max/kodalabs-cms"  # Add this line
     # ... other directories
   )
   ```

4. Add PostgreSQL database backup:
   ```bash
   # In backup script, add:
   docker exec kodalabs-cms-postgres pg_dump -U kodalabs_cms kodalabs_cms > kodalabs-cms-db-backup.sql
   ```

## 🛠️ Troubleshooting

### Container Won't Start

**Symptoms**: Container exits immediately

**Solutions**:
```bash
# Check logs
docker logs kodalabs-cms-prod

# Common issues:
# 1. Missing PAYLOAD_SECRET
# 2. Database connection failed
# 3. Build artifacts missing (build/, dist/)

# Rebuild if needed
docker compose -f docker-compose.prod.yml build --no-cache
```

### Database Connection Failed

**Symptoms**: "Connection refused" or "database does not exist"

**Solutions**:
```bash
# Check database is running
docker ps | grep postgres

# Check database logs
docker logs kodalabs-cms-postgres

# Test connection
docker exec kodalabs-cms-postgres psql -U kodalabs_cms -d kodalabs_cms -c '\l'

# Recreate database if needed (⚠️ DESTROYS DATA)
docker compose -f docker-compose.prod.yml down -v
docker compose -f docker-compose.prod.yml up -d
```

### SSL Certificate Not Generated

**Symptoms**: Browser shows certificate warning

**Solutions**:
```bash
# Check Traefik logs
docker logs traefik | grep cms.kodalabs.dev

# Verify DNS
nslookup cms.kodalabs.dev

# Check Traefik routing
docker exec traefik curl -s http://localhost:8080/api/http/routers | grep cms

# Wait for certificate (may take 1-2 minutes on first deploy)
```

### Admin Panel 404 or Build Assets Missing

**Symptoms**: /admin returns 404 or static assets missing

**Solutions**:
```bash
# Verify build folder exists in container
docker exec kodalabs-cms-prod ls -la /app/build

# Verify dist folder exists
docker exec kodalabs-cms-prod ls -la /app/dist

# If missing, rebuild image
docker build -t ghcr.io/maxh33/kodalabs-cms:prod -f deployment/docker/Dockerfile .
docker push ghcr.io/maxh33/kodalabs-cms:prod

# Redeploy
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d --force-recreate
```

### High Memory Usage

**Symptoms**: Container consuming too much memory

**Solutions**:
```bash
# Check current usage
docker stats kodalabs-cms-prod

# Adjust memory limits in docker-compose.prod.yml
# Current: 1024M (1GB) for app, 512M for database

# Restart with new limits
docker compose -f docker-compose.prod.yml up -d
```

## 🔍 Common Commands

```bash
# View logs
docker logs kodalabs-cms-prod -f

# Restart services
docker compose -f docker-compose.prod.yml restart

# Stop services
docker compose -f docker-compose.prod.yml down

# Update to latest image
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d

# Execute command in container
docker exec -it kodalabs-cms-prod sh

# Access database
docker exec -it kodalabs-cms-postgres psql -U kodalabs_cms -d kodalabs_cms
```

## 📁 VPS Directory Structure

After deployment, the VPS structure will be:

```
/home/max/
├── shared/monitoring/          # Existing monitoring stack
├── my-portfolio/              # Existing portfolio
├── kodalabs-landing/          # Existing KodaLabs site
└── kodalabs-cms/             # 🆕 NEW - CMS deployment
    ├── docker-compose.prod.yml
    ├── .env (created by CI/CD)
    └── bkp/ (backup configs)
```

## 🌐 Service URLs

After successful deployment:

- **Admin Panel**: https://cms.kodalabs.dev/admin
- **API Endpoint**: https://cms.kodalabs.dev/api
- **Health Check**: https://cms.kodalabs.dev/api/health
- **Metrics** (if implemented): https://cms.kodalabs.dev/api/metrics

## 🔒 Security Notes

- Admin panel is publicly accessible but requires authentication
- X-Robots-Tag header prevents search engine indexing
- Database is only accessible within Docker network
- All secrets managed via environment variables
- SSL/TLS via Let's Encrypt automatic certificates

## 📞 Support

For issues or questions:
1. Check GitHub Actions workflow logs
2. Review container logs on VPS
3. Consult CLAUDE.md for project-specific notes
4. Check VPS monitoring dashboards

## 🎉 Success Checklist

- [ ] GitHub Secrets configured
- [ ] VPS prerequisites verified
- [ ] Pushed to main branch
- [ ] GitHub Actions workflow completed successfully
- [ ] Containers running and healthy
- [ ] Admin panel accessible
- [ ] First admin user created
- [ ] Database connection verified
- [ ] SSL certificate generated
- [ ] Prometheus scraping configured
- [ ] Uptime monitoring added
- [ ] Backup system updated
- [ ] Documentation reviewed

**Congratulations! Your KodaLabs CMS is now live at https://cms.kodalabs.dev** 🚀
