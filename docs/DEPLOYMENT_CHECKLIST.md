# Deployment Checklist

## Pre-Deployment

### Code Quality
- [ ] All tests pass (`npm test`)
- [ ] TypeScript compiles without errors (`npx tsc --noEmit`)
- [ ] ESLint passes (no errors, only acceptable warnings)
- [ ] Production build succeeds (`npm run build`)
- [ ] No `console.log` in production code
- [ ] No hardcoded localhost URLs
- [ ] No development-only code in production bundle

### Database
- [ ] Migrations tested on staging
- [ ] Seed data verified
- [ ] Backup strategy documented
- [ ] Rollback plan ready
- [ ] Database user has minimal required privileges

### Security
- [ ] HTTPS enforced (HSTS, secure cookies)
- [ ] Security headers configured (CSP, X-Frame-Options, etc.)
- [ ] Rate limiting on auth endpoints
- [ ] Input validation on all API routes
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention (proper escaping, CSP)
- [ ] CSRF protection (SameSite cookies)
- [ ] File upload validation (type, size, magic bytes)
- [ ] Environment secrets not in code
- [ ] Admin passwords meet complexity requirements

### Infrastructure
- [ ] Server meets minimum requirements
- [ ] OS updated and hardened
- [ ] Firewall configured (only 80/443/22)
- [ ] Fail2ban or similar for SSH
- [ ] Monitoring/alerting configured
- [ ] Log rotation configured
- [ ] SSL certificate valid and auto-renewing
- [ ] CDN configured for static assets

### Environment
- [ ] `.env` file created from `.env.example`
- [ ] All required variables set
- [ ] `NODE_ENV=production`
- [ ] `NEXT_PUBLIC_APP_URL` correct
- [ ] Database credentials correct
- [ ] `MEDIA_UPLOAD_PATH` points to persistent storage
- [ ] Secure random session secret (if applicable)

## Deployment Steps

### 1. Code Deployment
```bash
# On server
cd /var/www/webgensa
git pull origin main
npm ci --production
npm run build
```

### 2. Database Migration
```bash
npm run migrate
# Verify: npm run migrate:status
```

### 3. Configuration
```bash
# Verify .env
cat .env | grep -v '^#' | grep -v '^$'

# Check critical vars
echo "NODE_ENV: $NODE_ENV"
echo "DB_HOST: $DB_HOST"
echo "MEDIA_UPLOAD_PATH: $MEDIA_UPLOAD_PATH"
```

### 4. Media Storage
```bash
# Verify upload directory
ls -la $MEDIA_UPLOAD_PATH
# Should be writable by www-data
```

### 5. Process Manager
```bash
# Restart PM2
pm2 reload gensa --update-env
# Or full restart if config changed
pm2 restart gensa
pm2 save
```

### 6. Web Server
```bash
# Test Nginx config
sudo nginx -t
sudo systemctl reload nginx

# Verify SSL
curl -I https://your-domain.com
```

### 7. Health Checks
```bash
# Public site
curl -s -o /dev/null -w "%{http_code}" https://your-domain.com
# Should return 200

# Admin login page
curl -s -o /dev/null -w "%{http_code}" https://your-domain.com/admin
# Should return 200 (login page) or 302 (redirect)

# API health
curl -s https://your-domain.com/api/auth/me
# Should return 401 (unauthenticated)

# Sitemap
curl -s -o /dev/null -w "%{http_code}" https://your-domain.com/sitemap.xml
# Should return 200
```

## Post-Deployment Verification

### Functional Testing
- [ ] Public homepage loads correctly
- [ ] All 6 sections render (Hero, About, Ruang Gerak, Cerita, Contact, Footer)
- [ ] Navigation menus work (header + footer)
- [ ] Announcement bar displays (if active)
- [ ] Article detail pages work (`/artikel/slug`)
- [ ] Sitemap.xml accessible and valid
- [ ] Robots.txt accessible
- [ ] 404 page works for unknown routes

### Admin Dashboard
- [ ] Login works with correct credentials
- [ ] Dashboard shows stats
- [ ] Contents management (CRUD)
- [ ] Ruang Gerak management (categories + items)
- [ ] Articles management (CRUD + status)
- [ ] Gallery management (CRUD)
- [ ] Media library (upload, list, delete, copy URL)
- [ ] Navigation management (header + footer)
- [ ] Settings (site settings + contact info)
- [ ] Profile (change password)
- [ ] Logout works

### Media Library
- [ ] Upload JPG/PNG/WebP ≤ 10MB works
- [ ] Reject invalid file types
- [ ] Reject files > 10MB
- [ ] Search/filter works
- [ ] Pagination works
- [ ] Preview modal opens
- [ ] Copy URL works
- [ ] Delete works (with referential integrity check)
- [ ] Referential integrity: blocks delete if used in gallery/posts

### SEO
- [ ] Dynamic metadata on all pages
- [ ] Open Graph tags present
- [ ] Twitter Card tags present
- [ ] Sitemap.xml includes all public routes
- [ ] Robots.txt allows crawling
- [ ] Canonical URLs correct
- [ ] Structured data (if implemented)

### Performance
- [ ] First Contentful Paint < 1.8s
- [ ] Largest Contentful Paint < 2.5s
- [ ] Cumulative Layout Shift < 0.1
- [ ] Time to Interactive < 3.5s
- [ ] Static assets cached (Cache-Control headers)
- [ ] Gzip/Brotli compression enabled
- [ ] Images optimized (Next.js Image component)

### Security Verification
- [ ] HTTPS redirect works
- [ ] Security headers present:
  - [ ] X-Frame-Options: DENY
  - [ ] X-Content-Type-Options: nosniff
  - [ ] X-XSS-Protection: 1; mode=block
  - [ ] Referrer-Policy: strict-origin-when-cross-origin
  - [ ] Permissions-Policy set
- [ ] Admin routes protected (redirect to login)
- [ ] API routes protected (401 without auth)
- [ ] Session cookie: HttpOnly, Secure, SameSite=Lax
- [ ] No sensitive data in client bundle
- [ ] Rate limiting active on login

## Rollback Plan

### Quick Rollback (Code Only)
```bash
cd /var/www/webgensa
git checkout previous-tag
npm ci --production
npm run build
pm2 reload gensa --update-env
```

### Full Rollback (Code + Database)
```bash
# 1. Stop app
pm2 stop gensa

# 2. Restore database from backup
gunzip -c /backups/database/gensa_db_YYYYMMDD_HHMMSS.sql.gz | mysql -u gensa_user -p gensa_db

# 3. Restore media if needed
tar -xzf /backups/media/media_YYYYMMDD_HHMMSS.tar.gz -C /var/www/uploads

# 4. Restore code
cd /var/www/webgensa
git checkout previous-tag
npm ci --production
npm run build

# 5. Start
pm2 start gensa
```

## Monitoring Setup

### Uptime Monitoring
- [ ] Pingdom / UptimeRobot / BetterUptime configured
- [ ] Alert on: homepage, admin login, API health
- [ ] Check interval: 1-5 minutes

### Log Monitoring
- [ ] Application logs aggregated (PM2 + Loki/ELK)
- [ ] Nginx access/error logs monitored
- [ ] MySQL slow query log enabled
- [ ] Alert on: 5xx errors, auth failures, slow queries

### Resource Monitoring
- [ ] CPU, Memory, Disk alerts
- [ ] Database connections pool usage
- [ ] PM2 process health
- [ ] SSL certificate expiry (30 days warning)

## Sign-Off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Developer | | | |
| DevOps | | | |
| QA | | | |
| Product Owner | | | |

## Emergency Contacts

| Service | Contact | Escalation |
|---------|---------|------------|
| Server/Infra | | |
| Database | | |
| DNS/SSL | | |
| Application | | |