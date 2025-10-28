# Security Policy

## 🔒 Security Overview

This repository is safe for public use. All sensitive data is managed through environment variables and GitHub Secrets. No hardcoded credentials or secrets exist in the codebase.

## 🚨 Reporting Security Vulnerabilities

If you discover a security vulnerability, please follow responsible disclosure practices:

### How to Report

- **DO NOT** open a public GitHub issue
- **Email**: security@kodalabs.dev
- **Include**:
  - Description of the vulnerability
  - Steps to reproduce
  - Potential impact assessment
  - Suggested fix (if available)

### Response Timeline

- **Acknowledgment**: Within 48 hours
- **Initial Assessment**: Within 1 week
- **Fix & Coordinated Disclosure**: Timeline agreed with reporter

We appreciate responsible disclosure and will credit researchers in our security advisories (unless anonymity is requested).

## ⚠️ Important Security Notes

### Never Commit These Files

❌ **`.env`** - Contains actual secrets (already gitignored)
❌ **`.env.local`** - Local environment overrides
❌ **Any files with real API keys, passwords, or tokens**
❌ **Database dumps with production data**
❌ **SSL certificates or private keys**

### Safe to Commit

✅ **`.env.example`** - Template with placeholder values only
✅ **Source code** (uses environment variables)
✅ **Configuration files** (no hardcoded secrets)
✅ **Documentation files**
✅ **Docker Compose files** (using variable substitution)

### Environment Variables Security

All sensitive data must be configured via environment variables:

- **Local Development**: Copy `.env.example` to `.env` and fill with your secrets
- **Production Deployment**: Managed via GitHub Secrets (never committed)
- **CI/CD Pipelines**: Use GitHub Actions secrets

## 🔑 Secret Management

### Development Secrets

1. **Copy the template:**
   ```bash
   cp .env.example .env
   ```

2. **Generate secure secrets:**
   ```bash
   # Payload CMS secret (min 32 characters)
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

   # PostgreSQL password (16 characters)
   node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
   ```

3. **Fill `.env` with your generated secrets**

4. **Never commit `.env` file** - it's already in `.gitignore`

### Production Secrets

Production secrets are managed via GitHub Secrets (Settings > Secrets and variables > Actions):

**Required Secrets:**
- `PAYLOAD_SECRET` - CMS encryption key (min 32 chars)
- `POSTGRES_PASSWORD` - Database password
- `VPS_HOST`, `VPS_USER`, `VPS_KEY`, `VPS_PASSPHRASE` - VPS deployment credentials
- `GHCR_TOKEN` - GitHub Container Registry token

**Optional Secrets:**
- `ANTHROPIC_API_KEY` - AI content generation (Claude API)
- `AI_CONTENT_API_KEY` - Custom AI generator
- `EMAIL_HOST`, `EMAIL_USER`, `EMAIL_PASS` - Email notifications
- `WEBHOOK_PJ_CLT`, `WEBHOOK_KODALABS` - Vercel deployment webhooks
- `SENTRY_DSN` - Error tracking

See [.env.example](.env.example) for complete list and documentation.

### Secret Rotation

If a secret is accidentally exposed:

1. **Immediately** rotate the compromised secret
2. Update environment variables:
   - Local: Edit `.env` file
   - Production: Update GitHub Secret
3. Restart affected services
4. Review git history for exposure
5. If committed to git:
   ```bash
   # Remove from history (use with caution)
   git filter-branch --force --index-filter \
     'git rm --cached --ignore-unmatch .env' \
     --prune-empty --tag-name-filter cat -- --all

   # Force push (DANGEROUS - coordinate with team)
   git push origin --force --all
   ```

## 🛡️ Security Best Practices

### For Contributors

#### Before Every Commit

1. **Check what you're committing:**
   ```bash
   git status              # Ensure .env is not staged
   git diff --cached       # Review changes line by line
   ```

2. **Verify no secrets in staged files:**
   ```bash
   npm run security:verify # Run security verification script
   ```

#### Code Security

**✅ Correct - Use environment variables:**
```typescript
// Good
const secret = process.env.PAYLOAD_SECRET;
const dbUrl = process.env.DATABASE_URL;

// Good - with defaults for non-sensitive values
const port = process.env.PORT || 3001;
```

**❌ Wrong - Hardcoded secrets:**
```typescript
// Bad - never do this
const secret = "ac1eb0840f547fd90e7ab7af481a1e4a0d0083a97ae24ba0297248eab3a4dff5";
const dbUrl = "postgresql://user:password@localhost:5432/db";
```

#### Pull Request Reviews

When reviewing PRs, check for:
- Accidental `.env` file inclusion
- Hardcoded secrets in code
- Secrets in commit messages
- Exposed API keys in logs or comments

### For Maintainers

#### Regular Security Tasks

- **Quarterly**: Rotate production secrets
- **Monthly**: Review dependency vulnerabilities (`npm audit`)
- **Weekly**: Monitor GitHub security alerts
- **On PR Merge**: Scan for accidentally committed secrets

#### GitHub Repository Settings

1. **Enable security features:**
   - Dependency graph
   - Dependabot alerts
   - Dependabot security updates
   - Secret scanning

2. **Configure branch protection:**
   - Require pull request reviews
   - Require status checks to pass
   - Enforce linear history

3. **Manage GitHub Secrets:**
   - Use environment-specific secrets
   - Limit secret access to necessary workflows
   - Audit secret usage regularly

## 🔍 Vulnerability Disclosure

### Scope

**In Scope:**
- Authentication/authorization bypasses
- SQL injection vulnerabilities
- Cross-site scripting (XSS)
- Cross-site request forgery (CSRF)
- Server-side request forgery (SSRF)
- Secret exposure in code or configurations
- Dependency vulnerabilities (critical/high severity)
- Access control issues
- Data exposure issues

**Out of Scope:**
- Social engineering attacks
- Physical attacks against infrastructure
- Distributed Denial of Service (DDoS) attacks
- Issues in third-party dependencies (report to upstream)
- Spam or abuse of features
- Issues in services not operated by us

### Vulnerability Severity Levels

**Critical**: Immediate action required
- Remote code execution
- Authentication bypass
- Mass data exposure

**High**: Fix within 30 days
- Privilege escalation
- SQL injection
- Sensitive data exposure

**Medium**: Fix within 90 days
- XSS vulnerabilities
- CSRF vulnerabilities
- Information disclosure

**Low**: Fix when possible
- Minor security issues
- Low-impact vulnerabilities

## 📋 Security Checklist

### Before Making Commits

- [ ] `.env` file is not staged for commit
- [ ] No hardcoded secrets in code changes
- [ ] `.env.example` has only placeholder values
- [ ] All secrets use environment variables
- [ ] Ran `npm run security:verify` successfully

### Before Deploying to Production

- [ ] All GitHub Secrets configured
- [ ] Production secrets are unique (different from development)
- [ ] SSL/TLS certificates configured (automatic via Traefik)
- [ ] Database access restricted to application network
- [ ] Monitoring and logging enabled
- [ ] Backup system configured
- [ ] Health check endpoints working
- [ ] CORS origins properly configured

### Before Making Repository Public

- [ ] No `.env` file in git history
- [ ] No hardcoded secrets in any commits
- [ ] SECURITY.md file exists
- [ ] README.md has security warnings
- [ ] `.gitignore` properly configured
- [ ] Ran security verification script
- [ ] Reviewed all files for sensitive data

## 🔐 Infrastructure Security

### Docker Security

- Containers run as non-root users when possible
- Minimal base images (Alpine Linux)
- Multi-stage builds to reduce attack surface
- No secrets in Docker images
- Secrets passed via environment variables at runtime

### Database Security

- Database not exposed to public internet
- Access restricted to Docker network
- Strong passwords required (16+ characters)
- Regular backups configured
- Connection encryption enabled (PostgreSQL SSL)

### VPS Security

- SSH key authentication only (no passwords)
- Firewall configured (ports 80, 443, 22 only)
- Fail2ban enabled for SSH protection
- Regular security updates applied
- Monitoring via Grafana/Prometheus
- Traefik handles SSL/TLS termination
- Let's Encrypt for automatic certificate renewal

## 📚 Additional Resources

- **Payload CMS Security**: https://payloadcms.com/docs/security
- **Docker Security**: https://docs.docker.com/engine/security/
- **PostgreSQL Security**: https://www.postgresql.org/docs/current/security.html
- **GitHub Secrets**: https://docs.github.com/en/actions/security-guides/encrypted-secrets
- **OWASP Top 10**: https://owasp.org/www-project-top-ten/

## 📞 Contact

- **Security Issues**: security@kodalabs.dev (private, urgent)
- **General Support**: GitHub Issues (public, non-sensitive)
- **Website**: https://kodalabs.dev
- **Documentation**: [CLAUDE.md](CLAUDE.md) for technical details

## 📜 Security Updates

**Last Updated**: October 21, 2025
**Repository**: Koda-Labs-Development/kodalabs-cms
**Status**: Public repository - safe for public use
**Version**: 2.0.0

---

**Thank you for helping keep KodaLabs CMS secure!** 🔒

If you have questions about our security practices, please open a GitHub Discussion or contact us at security@kodalabs.dev.
