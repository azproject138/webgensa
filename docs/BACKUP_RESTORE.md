# Backup and Restore Guide

## Backup Strategy

### What to Backup

1. **Database** - All content, users, settings
2. **Media Files** - Uploaded images in `MEDIA_UPLOAD_PATH`
3. **Environment Config** - `.env` file (secrets)
4. **Application Code** - Git repository (version controlled)

### Backup Schedule

| Component | Frequency | Retention |
|-----------|-----------|-----------|
| Database | Daily (2 AM) | 30 days |
| Media Files | Daily (3 AM) | 30 days |
| Full (DB + Media) | Weekly (Sunday 4 AM) | 90 days |
| Config | On change | Indefinite |

## Database Backup

### Automated Script

Create `/usr/local/bin/backup-db.sh`:

```bash
#!/bin/bash
set -euo pipefail

# Configuration
DB_HOST="localhost"
DB_PORT="3306"
DB_NAME="gensa_db"
DB_USER="gensa_user"
DB_PASS="${DB_PASS}"  # From environment
BACKUP_DIR="/backups/database"
DATE=$(date +%Y%m%d_%H%M%S)
FILENAME="gensa_db_${DATE}.sql.gz"
RETENTION_DAYS=30

# Create backup directory
mkdir -p "${BACKUP_DIR}"

# Perform backup
echo "Starting database backup: ${FILENAME}"
mysqldump \
  --host="${DB_HOST}" \
  --port="${DB_PORT}" \
  --user="${DB_USER}" \
  --password="${DB_PASS}" \
  --single-transaction \
  --routines \
  --triggers \
  --events \
  --hex-blob \
  "${DB_NAME}" | gzip > "${BACKUP_DIR}/${FILENAME}"

# Verify backup
if [[ -f "${BACKUP_DIR}/${FILENAME}" && -s "${BACKUP_DIR}/${FILENAME}" ]]; then
  SIZE=$(du -h "${BACKUP_DIR}/${FILENAME}" | cut -f1)
  echo "Backup completed: ${FILENAME} (${SIZE})"
else
  echo "ERROR: Backup failed or empty!"
  exit 1
fi

# Cleanup old backups
find "${BACKUP_DIR}" -name "gensa_db_*.sql.gz" -mtime +${RETENTION_DAYS} -delete
echo "Cleanup completed (retention: ${RETENTION_DAYS} days)"
```

Make executable:
```bash
sudo chmod +x /usr/local/bin/backup-db.sh
```

### Manual Backup

```bash
# Quick backup
mysqldump -u gensa_user -p gensa_db | gzip > backup_$(date +%Y%m%d_%H%M%S).sql.gz

# Schema only
mysqldump -u gensa_user -p --no-data gensa_db > schema_$(date +%Y%m%d).sql

# Data only (no structure)
mysqldump -u gensa_user -p --no-create-info gensa_db > data_$(date +%Y%m%d).sql

# Specific tables
mysqldump -u gensa_user -p gensa_db posts gallery media > content_$(date +%Y%m%d).sql
```

## Media Files Backup

### Automated Script

Create `/usr/local/bin/backup-media.sh`:

```bash
#!/bin/bash
set -euo pipefail

# Configuration
MEDIA_PATH="${MEDIA_UPLOAD_PATH:-/var/www/uploads}"
BACKUP_DIR="/backups/media"
DATE=$(date +%Y%m%d_%H%M%S)
FILENAME="media_${DATE}.tar.gz"
RETENTION_DAYS=30

# Create backup directory
mkdir -p "${BACKUP_DIR}"

# Check media path exists
if [[ ! -d "${MEDIA_PATH}" ]]; then
  echo "ERROR: Media path not found: ${MEDIA_PATH}"
  exit 1
fi

# Count files
FILE_COUNT=$(find "${MEDIA_PATH}" -type f | wc -l)
echo "Backing up ${FILE_COUNT} files from ${MEDIA_PATH}"

# Perform backup (preserve permissions, follow symlinks)
tar -czf "${BACKUP_DIR}/${FILENAME}" -C "${MEDIA_PATH}" .

# Verify
if [[ -f "${BACKUP_DIR}/${FILENAME}" && -s "${BACKUP_DIR}/${FILENAME}" ]]; then
  SIZE=$(du -h "${BACKUP_DIR}/${FILENAME}" | cut -f1)
  echo "Media backup completed: ${FILENAME} (${SIZE})"
else
  echo "ERROR: Media backup failed!"
  exit 1
fi

# Cleanup
find "${BACKUP_DIR}" -name "media_*.tar.gz" -mtime +${RETENTION_DAYS} -delete
echo "Cleanup completed"
```

## Full Backup (Database + Media)

Create `/usr/local/bin/backup-full.sh`:

```bash
#!/bin/bash
set -euo pipefail

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/full"
mkdir -p "${BACKUP_DIR}"

echo "=== Full Backup Started: ${DATE} ==="

# Database
/usr/local/bin/backup-db.sh
DB_FILE=$(ls -t /backups/database/gensa_db_*.sql.gz | head -1)
cp "${DB_FILE}" "${BACKUP_DIR}/db_${DATE}.sql.gz"

# Media
/usr/local/bin/backup-media.sh
MEDIA_FILE=$(ls -t /backups/media/media_*.tar.gz | head -1)
cp "${MEDIA_FILE}" "${BACKUP_DIR}/media_${DATE}.tar.gz"

# Config
cp /var/www/webgensa/.env "${BACKUP_DIR}/env_${DATE}.backup"

# Create manifest
cat > "${BACKUP_DIR}/manifest_${DATE}.txt" <<EOF
GENSA Full Backup
Date: $(date)
Database: db_${DATE}.sql.gz
Media: media_${DATE}.tar.gz
Config: env_${DATE}.backup
Git Commit: $(cd /var/www/webgensa && git rev-parse HEAD 2>/dev/null || echo "N/A")
EOF

echo "=== Full Backup Completed ==="
ls -lh "${BACKUP_DIR}"/*_${DATE}.*
```

## Restore Procedures

### Restore Database

```bash
# 1. Stop application
pm2 stop gensa

# 2. Restore database
gunzip -c /backups/database/gensa_db_20260115_020000.sql.gz | mysql -u gensa_user -p gensa_db

# 3. Verify
mysql -u gensa_user -p gensa_db -e "SELECT COUNT(*) FROM posts; SELECT COUNT(*) FROM admin_users;"

# 4. Restart application
pm2 start gensa
```

### Restore Media Files

```bash
# 1. Stop application (optional, but safer)
pm2 stop gensa

# 2. Backup current media (just in case)
mv /var/www/uploads /var/www/uploads.backup.$(date +%Y%m%d)

# 3. Create fresh directory
mkdir -p /var/www/uploads
chown www-data:www-data /var/www/uploads

# 4. Extract backup
tar -xzf /backups/media/media_20260115_030000.tar.gz -C /var/www/uploads

# 5. Fix permissions
chown -R www-data:www-data /var/www/uploads
chmod -R 755 /var/www/uploads

# 6. Restart application
pm2 start gensa

# 7. Verify
ls -la /var/www/uploads/ | head -20
```

### Restore Full System (Disaster Recovery)

```bash
#!/bin/bash
# disaster-recovery.sh
# Usage: ./disaster-recovery.sh BACKUP_DATE
# Example: ./disaster-recovery.sh 20260115_040000

set -euo pipefail

BACKUP_DATE="${1}"
BACKUP_DIR="/backups/full"

if [[ -z "${BACKUP_DATE}" ]]; then
  echo "Usage: $0 BACKUP_DATE"
  echo "Available backups:"
  ls "${BACKUP_DIR}"/manifest_*.txt | sed 's/.*manifest_\(.*\)\.txt/\1/'
  exit 1
fi

echo "=== DISASTER RECOVERY: ${BACKUP_DATE} ==="
read -p "This will OVERWRITE current data. Continue? (yes/no): " CONFIRM
[[ "${CONFIRM}" == "yes" ]] || exit 1

# 1. Stop application
echo "Stopping application..."
pm2 stop gensa

# 2. Restore database
echo "Restoring database..."
gunzip -c "${BACKUP_DIR}/db_${BACKUP_DATE}.sql.gz" | mysql -u gensa_user -p gensa_db

# 3. Restore media
echo "Restoring media files..."
rm -rf /var/www/uploads.backup
mv /var/www/uploads /var/www/uploads.backup 2>/dev/null || true
mkdir -p /var/www/uploads
tar -xzf "${BACKUP_DIR}/media_${BACKUP_DATE}.tar.gz" -C /var/www/uploads
chown -R www-data:www-data /var/www/uploads
chmod -R 755 /var/www/uploads

# 4. Restore config (optional - review first!)
echo "Config backup available at: ${BACKUP_DIR}/env_${BACKUP_DATE}.backup"
read -p "Restore .env config? (yes/no): " RESTORE_ENV
[[ "${RESTORE_ENV}" == "yes" ]] && cp "${BACKUP_DIR}/env_${BACKUP_DATE}.backup" /var/www/webgensa/.env

# 5. Reinstall dependencies (if code changed)
cd /var/www/webgensa
npm ci --production
npm run build

# 6. Run migrations (in case schema changed)
npm run migrate

# 7. Start application
pm2 start gensa

echo "=== RECOVERY COMPLETE ==="
echo "Verify at: https://your-domain.com"
```

## Offsite Backup (Recommended)

### AWS S3

```bash
# Install AWS CLI
sudo apt install -y awscli
aws configure

# Sync backups to S3
aws s3 sync /backups/ s3://your-backup-bucket/gensa/ --storage-class STANDARD_IA

# Lifecycle policy: Move to Glacier after 30 days, delete after 365
```

### Rsync to Remote Server

```bash
# SSH key setup (passwordless)
ssh-keygen -t ed25519
ssh-copy-id backup@backup-server

# Rsync script
rsync -avz --delete /backups/ backup@backup-server:/backups/gensa/
```

### Cron Jobs

```bash
# Edit crontab for www-data user
sudo crontab -u www-data -e

# Daily at 2 AM: Database
0 2 * * * /usr/local/bin/backup-db.sh >> /var/log/backup-db.log 2>&1

# Daily at 3 AM: Media
0 3 * * * /usr/local/bin/backup-media.sh >> /var/log/backup-media.log 2>&1

# Weekly Sunday 4 AM: Full
0 4 * * 0 /usr/local/bin/backup-full.sh >> /var/log/backup-full.log 2>&1

# Daily 5 AM: Offsite sync
0 5 * * * aws s3 sync /backups/ s3://your-bucket/gensa/ >> /var/log/backup-sync.log 2>&1
```

## Verification & Testing

### Monthly Restore Test

```bash
# 1. Create test database
mysql -u root -p -e "CREATE DATABASE gensa_test_restore CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -p -e "CREATE USER 'test_restore'@'localhost' IDENTIFIED BY 'testpass'; GRANT ALL ON gensa_test_restore.* TO 'test_restore'@'localhost';"

# 2. Restore latest backup to test DB
gunzip -c /backups/database/gensa_db_latest.sql.gz | mysql -u test_restore -ptestpass gensa_test_restore

# 3. Verify key tables
mysql -u test_restore -ptestpass gensa_test_restore -e "
  SELECT 'posts' as table_name, COUNT(*) as count FROM posts
  UNION SELECT 'gallery', COUNT(*) FROM gallery
  UNION SELECT 'media', COUNT(*) FROM media
  UNION SELECT 'admin_users', COUNT(*) FROM admin_users;
"

# 4. Cleanup
mysql -u root -p -e "DROP DATABASE gensa_test_restore; DROP USER 'test_restore'@'localhost';"
```

### Backup Integrity Checks

```bash
# Check database backup can be read
gunzip -t /backups/database/gensa_db_latest.sql.gz && echo "DB backup OK"

# Check media backup can be extracted
tar -tzf /backups/media/media_latest.tar.gz > /dev/null && echo "Media backup OK"

# Check file counts match
DB_MEDIA_COUNT=$(mysql -u gensa_user -p gensa_db -se "SELECT COUNT(*) FROM media;")
FS_MEDIA_COUNT=$(find /var/www/uploads -type f | wc -l)
echo "DB: ${DB_MEDIA_COUNT}, FS: ${FS_MEDIA_COUNT}"
```

## Monitoring Alerts

### Prometheus/Grafana (if available)

```yaml
# Alert rules
- alert: BackupFailed
  expr: increase(backup_job_failed_total[1h]) > 0
  for: 5m
  labels:
    severity: critical
  annotations:
    summary: "Backup job failed"

- alert: BackupStale
  expr: time() - backup_last_success_timestamp > 86400
  for: 1h
  labels:
    severity: warning
  annotations:
    summary: "No successful backup in 24h"

- alert: DiskSpaceLow
  expr: (node_filesystem_avail_bytes{mountpoint="/var/www/uploads"} / node_filesystem_size_bytes{mountpoint="/var/www/uploads"}) < 0.15
  for: 10m
  labels:
    severity: warning
  annotations:
    summary: "Media storage disk space < 15%"
```

## Quick Reference

| Command | Description |
|---------|-------------|
| `mysqldump -u user -p db \| gzip > backup.sql.gz` | Quick DB backup |
| `gunzip -c backup.sql.gz \| mysql -u user -p db` | Quick DB restore |
| `tar -czf media.tar.gz /path/to/media` | Backup media |
| `tar -xzf media.tar.gz -C /path/to/media` | Restore media |
| `ls -lh /backups/database/` | List DB backups |
| `ls -lh /backups/media/` | List media backups |