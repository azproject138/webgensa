# Media Storage Configuration

## Overview

The media library supports multiple storage backends through the `MEDIA_UPLOAD_PATH` environment variable. The system stores file metadata in the database and files on disk (local or mounted volume).

## Storage Options

### 1. Local Development (Default)

```env
MEDIA_UPLOAD_PATH=./public/uploads
```

- Files stored in `public/uploads/` within project
- Served directly by Next.js at `/uploads/*`
- **Not suitable for production** (ephemeral in containerized deployments)

### 2. Production: Mounted Volume

```env
MEDIA_UPLOAD_PATH=/var/www/uploads
```

- Persistent storage on host filesystem
- Survives container restarts and deployments
- **Recommended for VPS/single-server deployments**

```bash
# Create directory with correct permissions
sudo mkdir -p /var/www/uploads
sudo chown www-data:www-data /var/www/uploads
sudo chmod 755 /var/www/uploads
```

### 3. Production: Network File System (NFS/EFS)

```env
MEDIA_UPLOAD_PATH=/mnt/media
```

- Shared storage across multiple app servers
- Mount NFS/EFS to `/mnt/media` on each server
- **Required for horizontal scaling**

```bash
# Example: Mount EFS on Ubuntu
sudo apt install -y nfs-common
sudo mkdir -p /mnt/media
sudo mount -t nfs4 -o nfsvers=4.1,rsize=1048576,wsize=1048576,hard,timeo=600,retrans=2,noresvport fs-xxxx.efs.region.amazonaws.com:/ /mnt/media
sudo chown www-data:www-data /mnt/media
```

Add to `/etc/fstab` for persistence:
```
fs-xxxx.efs.region.amazonaws.com:/ /mnt/media nfs4 nfsvers=4.1,rsize=1048576,wsize=1048576,hard,timeo=600,retrans=2,noresvport,_netdev 0 0
```

### 4. Production: Object Storage (S3/Compatible)

**Not yet implemented** - requires code changes to `media.repository.ts` and upload API.

**Planned approach:**
```env
MEDIA_STORAGE_DRIVER=s3
S3_BUCKET=gensa-media
S3_REGION=us-east-1
S3_ACCESS_KEY_ID=xxx
S3_SECRET_ACCESS_KEY=xxx
S3_ENDPOINT=https://s3.amazonaws.com  # or custom endpoint
MEDIA_BASE_URL=https://cdn.your-domain.com  # CloudFront/CDN URL
```

## File Validation

### Allowed Types
- `image/jpeg` (.jpg)
- `image/png` (.png)
- `image/webp` (.webp)

### Size Limit
- **10 MB** maximum per file (configurable in `src/app/api/media/upload/route.ts`)

### Security Features
- MIME type validation (extension + content-type)
- UUID filenames (prevents overwrites, path traversal)
- Magic byte validation (planned)
- No direct script execution (served as static files)

## Nginx Configuration for Media

### Local/Mounted Volume

```nginx
location /uploads/ {
    alias /var/www/uploads/;  # or /mnt/media/
    expires 1y;
    add_header Cache-Control "public, immutable";
    access_log off;
    
    # Security: Prevent script execution
    location ~ \.php$ {
        deny all;
    }
}
```

### With CDN (CloudFront, Cloudflare, etc.)

```nginx
location /uploads/ {
    # Proxy to CDN or serve locally with CDN headers
    proxy_pass https://cdn.your-domain.com/uploads/;
    proxy_cache_valid 200 1y;
    add_header X-Cache-Status $upstream_cache_status;
}
```

## Backup Strategy

### Files Backup

```bash
#!/bin/bash
# backup-media.sh
DATE=$(date +%Y%m%d_%H%M%S)
SOURCE="/var/www/uploads"  # or your MEDIA_UPLOAD_PATH
DEST="/backups/media"

mkdir -p $DEST
tar -czf $DEST/media_$DATE.tar.gz -C $SOURCE .

# Keep last 30 days
find $DEST -name "media_*.tar.gz" -mtime +30 -delete
```

Add to crontab:
```
0 2 * * * /path/to/backup-media.sh
```

### Database + Files Combined

```bash
#!/bin/bash
# backup-full.sh
DATE=$(date +%Y%m%d_%H%M%S)
DEST="/backups/full"

mkdir -p $DEST

# Database
mysqldump -u gensa_user -p$DB_PASS gensa_db | gzip > $DEST/db_$DATE.sql.gz

# Media files
tar -czf $DEST/media_$DATE.tar.gz -C /var/www/uploads .

# Keep last 7 days
find $DEST -name "*_$DATE*" -mtime +7 -delete
```

## Migration Between Storage Backends

### Local → Mounted Volume

```bash
# 1. Stop app
pm2 stop gensa

# 2. Copy files
sudo rsync -av /var/www/webgensa/public/uploads/ /var/www/uploads/

# 3. Update .env
MEDIA_UPLOAD_PATH=/var/www/uploads

# 4. Update Nginx alias
# alias /var/www/uploads/;

# 5. Restart
pm2 start gensa
sudo systemctl reload nginx
```

### Local → NFS

```bash
# 1. Mount NFS
sudo mount /mnt/media

# 2. Copy files
sudo rsync -av /var/www/webgensa/public/uploads/ /mnt/media/

# 3. Update .env
MEDIA_UPLOAD_PATH=/mnt/media

# 4. Update Nginx
# alias /mnt/media/;

# 5. Restart
pm2 restart gensa
sudo systemctl reload nginx
```

## Monitoring

### Disk Usage

```bash
# Check media directory size
du -sh /var/www/uploads

# Check inodes (important for many small files)
df -i /var/www/uploads
```

### Alerting Thresholds
- **Warning**: > 70% disk usage
- **Critical**: > 85% disk usage
- **Inodes**: > 80% usage

## Troubleshooting

### Upload Fails: "Permission Denied"

```bash
# Fix permissions
sudo chown -R www-data:www-data /var/www/uploads
sudo chmod -R 755 /var/www/uploads

# Check SELinux (if applicable)
sudo setsebool -P httpd_unified 1
# Or
sudo chcon -R -t httpd_sys_rw_content_t /var/www/uploads
```

### Upload Fails: "No Space Left on Device"

```bash
# Check disk space
df -h /var/www/uploads

# Clean old files
find /var/www/uploads -type f -mtime +365 -delete
```

### Files Not Accessible via URL

```bash
# Check Nginx config
sudo nginx -t

# Check file exists
ls -la /var/www/uploads/some-file.jpg

# Check permissions
stat /var/www/uploads/some-file.jpg
```

### Sharp/Image Processing Issues

```bash
# Install system dependencies for sharp
sudo apt install -y libvips-dev

# Rebuild native modules
cd /var/www/webgensa
sudo -u www-data npm rebuild sharp
```