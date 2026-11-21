# Environment Variables Reference

## Required Variables

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `NODE_ENV` | Runtime environment | `production` | Yes |
| `NEXT_PUBLIC_APP_URL` | Public site URL (used for sitemap, canonical URLs) | `https://gensa.org` | Yes |
| `DB_HOST` | MySQL host | `localhost` | Yes |
| `DB_PORT` | MySQL port | `3306` | Yes |
| `DB_NAME` | Database name | `gensa_db` | Yes |
| `DB_USER` | Database user | `gensa_user` | Yes |
| `DB_PASS` | Database password | `secure_password` | Yes |

## Optional Variables

### Application

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `NEXT_PUBLIC_SITE_URL` | Alias for NEXT_PUBLIC_APP_URL | `NEXT_PUBLIC_APP_URL` | `https://gensa.org` |
| `PORT` | Server port (for `next start`) | `3000` | `3000` |

### Session / Auth

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `SESSION_DURATION_MS` | Session lifetime in milliseconds | `604800000` (7 days) | `604800000` |
| `SESSION_COOKIE_NAME` | Cookie name for session | `gensa_session` | `gensa_session` |

### Media Storage

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `MEDIA_UPLOAD_PATH` | Filesystem path for uploads | `./public/uploads` | `/var/www/uploads` |
| `MEDIA_BASE_URL` | Base URL for media (CDN) | `NEXT_PUBLIC_APP_URL` | `https://cdn.gensa.org` |

### External Services

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `SENTRY_DSN` | Sentry error tracking DSN | - | `https://xxx@sentry.io/xxx` |
| `LOG_LEVEL` | Log level | `info` | `debug` |

## Variable Details

### NODE_ENV
Controls Next.js behavior:
- `development`: Hot reload, verbose errors, no minification
- `production`: Optimized build, error boundaries, minification
- `test`: Test environment

**Must be set to `production` in production.**

### NEXT_PUBLIC_APP_URL
Used for:
- `sitemap.xml` generation (canonical URLs)
- `robots.txt` (sitemap reference)
- Open Graph `og:url`
- Canonical link tags
- Structured data

Must include protocol (`https://`) and no trailing slash.

### Database Variables
All database variables are required. The application will fail to start if any are missing.

Connection pool settings (in `src/lib/db.ts`):
- `connectionLimit`: 10 (adjust based on server resources)
- `charset`: `utf8mb4`

### MEDIA_UPLOAD_PATH
**Critical for production:** Must point to persistent storage.

Development:
```env
MEDIA_UPLOAD_PATH=./public/uploads
```

Production (VPS):
```env
MEDIA_UPLOAD_PATH=/var/www/uploads
```

Production (NFS/EFS):
```env
MEDIA_UPLOAD_PATH=/mnt/media
```

The directory must:
- Exist before starting the app
- Be writable by the Node.js process user (`www-data`)
- Have sufficient disk space

### MEDIA_BASE_URL
Used when serving media via CDN or different domain.

If set, media URLs in API responses will use this base:
```json
{
  "file_url": "https://cdn.gensa.org/uploads/abc123.jpg"
}
```

If not set, uses relative URLs:
```json
{
  "file_url": "/uploads/abc123.jpg"
}
```

## Environment-Specific Configs

### Development (`.env.local`)
```env
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=gensa_dev
DB_USER=root
DB_PASS=dev_password
MEDIA_UPLOAD_PATH=./public/uploads
```

### Staging (`.env.staging`)
```env
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://staging.gensa.org
DB_HOST=staging-db.internal
DB_PORT=3306
DB_NAME=gensa_staging
DB_USER=gensa_staging
DB_PASS=${STAGING_DB_PASS}
MEDIA_UPLOAD_PATH=/var/www/uploads
MEDIA_BASE_URL=https://staging-cdn.gensa.org
```

### Production (`.env`)
```env
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://gensa.org
DB_HOST=prod-db.internal
DB_PORT=3306
DB_NAME=gensa_prod
DB_USER=gensa_prod
DB_PASS=${PROD_DB_PASS}
MEDIA_UPLOAD_PATH=/mnt/media
MEDIA_BASE_URL=https://cdn.gensa.org
SENTRY_DSN=https://xxx@sentry.io/xxx
LOG_LEVEL=warn
```

## Validation

The application validates required variables at startup in `src/lib/db.ts`:

```typescript
const required = ["DB_HOST", "DB_PORT", "DB_NAME", "DB_USER"];
for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Environment variable ${key} harus diisi`);
  }
}
```

## Security Notes

1. **Never commit `.env` files** - Add to `.gitignore`
2. **Use secrets manager** in production (AWS Secrets Manager, HashiCorp Vault, etc.)
3. **Rotate database passwords** quarterly
4. **Use different credentials** per environment
5. **Restrict database user privileges** to only required operations

## Runtime Access

### Server-side (API routes, server components)
```typescript
// Direct access
const dbHost = process.env.DB_HOST;

// Via config helper
import { getDatabasePool } from '@/lib/db';
```

### Client-side (browser)
Only variables prefixed with `NEXT_PUBLIC_` are exposed:

```typescript
// Available in browser
const siteUrl = process.env.NEXT_PUBLIC_APP_URL;

// NOT available in browser (server-only)
const dbPass = process.env.DB_PASS; // undefined
```

## Troubleshooting

### "Environment variable X harus diisi"
- Check `.env` file exists in project root
- Verify variable name matches exactly (case-sensitive)
- Ensure no trailing spaces in `.env`

### Database connection fails
```bash
# Test connection
mysql -h $DB_HOST -P $DB_PORT -u $DB_USER -p$DB_PASS $DB_NAME -e "SELECT 1"

# Check from Node.js
node -e "
const mysql = require('mysql2/promise');
mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
}).then(c => { console.log('OK'); c.end(); }).catch(console.error);
"
```

### Media upload fails
- Check `MEDIA_UPLOAD_PATH` exists and is writable
- Verify disk space: `df -h $MEDIA_UPLOAD_PATH`
- Check permissions: `ls -la $MEDIA_UPLOAD_PATH`
- Verify sharp dependencies: `npm rebuild sharp`

### Build fails with "process.env not defined"
- Ensure `NEXT_PUBLIC_` prefix for client-side variables
- Check `next.config.ts` doesn't strip env vars
- Verify `.env` loaded before build