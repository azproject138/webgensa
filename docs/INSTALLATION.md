# GENSA Admin Dashboard - Installation Guide

## Prerequisites

- **Node.js**: 20.x LTS or later
- **MySQL**: 8.0 or later
- **npm** or **pnpm** or **yarn**
- **Git**

## Quick Start (Development)

```bash
# 1. Clone repository
git clone <repository-url>
cd webgensa

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env with your database credentials

# 4. Create database
mysql -u root -p -e "CREATE DATABASE gensa_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 5. Run migrations
npm run migrate

# 6. Seed initial data
npm run seed

# 7. Start development server
npm run dev
```

Visit `http://localhost:3000` for the public site and `http://localhost:3000/admin` for the admin dashboard.

## Production Deployment

### 1. Server Requirements

- **OS**: Ubuntu 22.04 LTS / 24.04 LTS (or similar)
- **CPU**: 2+ vCPU
- **RAM**: 2GB+ (4GB recommended)
- **Storage**: 20GB+ SSD
- **Network**: Public IP with ports 80/443

### 2. System Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install MySQL 8.0
sudo apt install -y mysql-server

# Secure MySQL
sudo mysql_secure_installation

# Install PM2 for process management
sudo npm install -g pm2

# Install Nginx for reverse proxy
sudo apt install -y nginx

# Install Certbot for SSL
sudo apt install -y certbot python3-certbot-nginx
```

### 3. Database Setup

```bash
# Create database and user
sudo mysql -u root -p <<EOF
CREATE DATABASE gensa_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'gensa_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON gensa_db.* TO 'gensa_user'@'localhost';
FLUSH PRIVILEGES;
EOF
```

### 4. Application Deployment

```bash
# Clone to web directory
cd /var/www
sudo git clone <repository-url> webgensa
sudo chown -R www-data:www-data webgensa
cd webgensa

# Install dependencies
sudo -u www-data npm ci --production

# Configure environment
sudo -u www-data cp .env.example .env
# Edit .env with production values
sudo -u www-data nano .env

# Run migrations
sudo -u www-data npm run migrate

# Seed initial data
sudo -u www-data npm run seed

# Build production bundle
sudo -u www-data npm run build
```

### 5. PM2 Process Configuration

Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'gensa',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    cwd: '/var/www/webgensa',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
    },
    instances: 'max',
    exec_mode: 'cluster',
    watch: false,
    max_memory_restart: '1G',
    error_file: '/var/log/gensa/error.log',
    out_file: '/var/log/gensa/out.log',
    log_file: '/var/log/gensa/combined.log',
    time: true,
  }],
};
```

```bash
# Create log directory
sudo mkdir -p /var/log/gensa
sudo chown www-data:www-data /var/log/gensa

# Start with PM2
sudo -u www-data pm2 start ecosystem.config.js

# Save PM2 config
sudo -u www-data pm2 save

# Enable startup on boot
sudo -u www-data pm2 startup
# Follow the printed command (run as root)
```

### 6. Nginx Reverse Proxy

Create `/etc/nginx/sites-available/gensa`:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    # SSL certificates (managed by Certbot)
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # Security headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Client max body size for media uploads
    client_max_body_size 20M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 60s;
        proxy_send_timeout 60s;
    }

    # Static files caching
    location /uploads/ {
        alias /var/www/webgensa/public/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    location /_next/static/ {
        alias /var/www/webgensa/.next/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/gensa /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 7. SSL Certificate

```bash
# Obtain certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

### 8. Firewall

```bash
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw enable
```

## Post-Deployment Verification

1. Visit `https://your-domain.com` - public site should load
2. Visit `https://your-domain.com/admin` - redirect to login
3. Login with seeded admin credentials (check seed output)
4. Test all admin CRUD operations
5. Test media upload
6. Verify sitemap.xml and robots.txt
7. Check SSL rating at SSL Labs

## Environment Variables Reference

See `docs/ENV_VARS.md` for complete list.

## Troubleshooting

### Database Connection Issues
```bash
# Check MySQL status
sudo systemctl status mysql

# Check connection
mysql -u gensa_user -p gensa_db
```

### PM2 Issues
```bash
# View logs
pm2 logs gensa

# Restart
pm2 restart gensa

# Monitor
pm2 monit
```

### Nginx Issues
```bash
# Check config
sudo nginx -t

# View logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

### Build Issues
```bash
# Clear cache and rebuild
cd /var/www/webgensa
sudo -u www-data rm -rf .next
sudo -u www-data npm run build
```