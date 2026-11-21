# Database Migration Guide

## Overview

This project uses a custom migration system with numbered SQL files. Migrations are run sequentially and tracked in the `migrations` table.

## Migration Files

Located in `migrations/` directory:

| File | Description |
|------|-------------|
| 001_create_admin_users.sql | Admin users table |
| 002_create_admin_sessions.sql | Admin sessions table |
| 003_create_pages.sql | Pages table |
| 004_create_page_sections.sql | Page sections table |
| 005_create_program_categories.sql | Program categories (Ruang Gerak) |
| 006_create_program_items.sql | Program items (Ruang Gerak items) |
| 007_create_posts.sql | Blog posts (Cerita/Artikel) |
| 008_create_gallery.sql | Gallery images |
| 009_create_navigation.sql | Navigation menus |
| 010_create_site_settings.sql | Site settings key-value store |
| 011_create_contact.sql | Contact information |
| 012_create_announcements.sql | Announcement bar |
| 013_create_media.sql | Media library |
| 014_add_foreign_keys.sql | Foreign key constraints |

## Running Migrations

### Development

```bash
# Run all pending migrations
npm run migrate

# Check migration status
npm run migrate:status
```

### Production

```bash
# Run on production server
sudo -u www-data npm run migrate
```

## Creating New Migrations

### 1. Create Migration File

```bash
# Format: XXX_description.sql (zero-padded 3 digits)
# Example: 015_add_seo_fields.sql
touch migrations/015_add_seo_fields.sql
```

### 2. Write Migration SQL

```sql
-- migrations/015_add_seo_fields.sql
-- Description: Add SEO fields to posts table
-- Author: Your Name
-- Date: 2026-01-15

ALTER TABLE posts
ADD COLUMN meta_title VARCHAR(255) NULL AFTER excerpt,
ADD COLUMN meta_description TEXT NULL AFTER meta_title,
ADD COLUMN og_image VARCHAR(500) NULL AFTER meta_description;

-- Add index for SEO queries
CREATE INDEX idx_posts_meta_title ON posts(meta_title);
```

### 3. Add Rollback (Optional)

```sql
-- Rollback (for manual use if needed)
-- ALTER TABLE posts DROP COLUMN meta_title, DROP COLUMN meta_description, DROP COLUMN og_image;
-- DROP INDEX idx_posts_meta_title ON posts;
```

### 4. Test Migration

```bash
# Run migration
npm run migrate

# Verify
mysql -u gensa_user -p gensa_db -e "DESCRIBE posts;"
```

## Migration System Details

### Migration Tracker Table

```sql
CREATE TABLE migrations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  filename VARCHAR(255) NOT NULL UNIQUE,
  executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Migration Runner

Located at `scripts/migrate.ts`:

```typescript
// Reads all .sql files from migrations/
// Sorts by filename
// Executes each in transaction
// Records in migrations table
// Skips already executed
```

## Schema Reference

### Core Tables

#### admin_users
- `id` (VARCHAR(36), PK) - UUID
- `name` (VARCHAR(100))
- `email` (VARCHAR(255), UNIQUE)
- `password_hash` (VARCHAR(255))
- `role` (ENUM: 'super_admin', 'admin', 'editor')
- `is_active` (BOOLEAN)
- `last_login_at` (TIMESTAMP, NULL)
- `created_at`, `updated_at` (TIMESTAMP)

#### admin_sessions
- `id` (VARCHAR(36), PK) - UUID
- `admin_id` (VARCHAR(36), FK → admin_users.id)
- `token_hash` (VARCHAR(64)) - SHA256
- `expires_at` (TIMESTAMP)
- `created_at`, `updated_at` (TIMESTAMP)

#### pages
- `id` (INT, PK, AI)
- `slug` (VARCHAR(100), UNIQUE)
- `title` (VARCHAR(255))
- `is_active` (BOOLEAN)
- `sort_order` (INT)
- `created_at`, `updated_at` (TIMESTAMP)

#### page_sections
- `id` (INT, PK, AI)
- `page_id` (INT, FK → pages.id)
- `section_key` (VARCHAR(50))
- `content` (JSON)
- `is_active` (BOOLEAN)
- `sort_order` (INT)
- `created_at`, `updated_at` (TIMESTAMP)

#### program_categories
- `id` (INT, PK, AI)
- `name` (VARCHAR(100))
- `slug` (VARCHAR(100), UNIQUE)
- `description` (TEXT, NULL)
- `icon` (VARCHAR(50), NULL)
- `is_active` (BOOLEAN)
- `sort_order` (INT)
- `created_at`, `updated_at` (TIMESTAMP)

#### program_items
- `id` (INT, PK, AI)
- `category_id` (INT, FK → program_categories.id)
- `title` (VARCHAR(255))
- `description` (TEXT)
- `image_url` (VARCHAR(500), NULL)
- `link_url` (VARCHAR(500), NULL)
- `is_active` (BOOLEAN)
- `sort_order` (INT)
- `created_at`, `updated_at` (TIMESTAMP)

#### posts
- `id` (VARCHAR(36), PK) - UUID
- `title` (VARCHAR(255))
- `slug` (VARCHAR(255), UNIQUE)
- `excerpt` (TEXT)
- `content` (LONGTEXT)
- `featured_image` (VARCHAR(500), NULL)
- `category` (VARCHAR(50))
- `status` (ENUM: 'draft', 'published', 'archived')
- `published_at` (TIMESTAMP, NULL)
- `author_id` (VARCHAR(36), FK → admin_users.id)
- `view_count` (INT, DEFAULT 0)
- `created_at`, `updated_at` (TIMESTAMP)

#### gallery
- `id` (VARCHAR(36), PK) - UUID
- `title` (VARCHAR(255))
- `description` (TEXT, NULL)
- `image_url` (VARCHAR(500))
- `media_id` (VARCHAR(36), FK → media.id, NULL)
- `is_active` (BOOLEAN)
- `sort_order` (INT)
- `created_at`, `updated_at` (TIMESTAMP)

#### navigation
- `id` (INT, PK, AI)
- `location` (ENUM: 'header', 'footer')
- `label` (VARCHAR(100))
- `url` (VARCHAR(500))
- `target` (ENUM: '_self', '_blank')
- `parent_id` (INT, FK → navigation.id, NULL)
- `is_active` (BOOLEAN)
- `sort_order` (INT)
- `created_at`, `updated_at` (TIMESTAMP)

#### site_settings
- `id` (INT, PK, AI)
- `setting_key` (VARCHAR(100), UNIQUE)
- `setting_value` (TEXT, NULL)
- `setting_type` (ENUM: 'string', 'number', 'boolean', 'json')
- `description` (VARCHAR(255), NULL)
- `is_public` (BOOLEAN)
- `created_at`, `updated_at` (TIMESTAMP)

#### contact
- `id` (INT, PK, AI) - Single row (id=1)
- `address` (VARCHAR(500))
- `location_description` (TEXT, NULL)
- `whatsapp` (VARCHAR(50), NULL)
- `email` (VARCHAR(255), NULL)
- `instagram` (VARCHAR(255), NULL)
- `facebook` (VARCHAR(255), NULL)
- `twitter` (VARCHAR(255), NULL)
- `created_at`, `updated_at` (TIMESTAMP)

#### announcements
- `id` (INT, PK, AI)
- `message` (VARCHAR(500))
- `link_url` (VARCHAR(500), NULL)
- `link_text` (VARCHAR(100), NULL)
- `background_color` (VARCHAR(7), DEFAULT '#1a1a2e')
- `text_color` (VARCHAR(7), DEFAULT '#ffffff')
- `is_active` (BOOLEAN)
- `start_date` (DATE, NULL)
- `end_date` (DATE, NULL)
- `created_at`, `updated_at` (TIMESTAMP)

#### media
- `id` (VARCHAR(36), PK) - UUID
- `original_name` (VARCHAR(255))
- `file_name` (VARCHAR(255))
- `file_path` (VARCHAR(500))
- `file_url` (VARCHAR(500))
- `mime_type` (VARCHAR(100))
- `file_size` (INT)
- `width` (INT, NULL)
- `height` (INT, NULL)
- `uploaded_by` (VARCHAR(36), FK → admin_users.id)
- `created_at`, `updated_at` (TIMESTAMP)

## Foreign Key Relationships

```
admin_sessions.admin_id → admin_users.id (CASCADE DELETE)
page_sections.page_id → pages.id (CASCADE DELETE)
program_items.category_id → program_categories.id (CASCADE DELETE)
posts.author_id → admin_users.id (SET NULL)
gallery.media_id → media.id (SET NULL)
navigation.parent_id → navigation.id (CASCADE DELETE)
media.uploaded_by → admin_users.id (SET NULL)
```

## Seed Data

Located in `scripts/seed.ts`. Run with:

```bash
npm run seed
```

Seeds:
- Default admin user (super_admin)
- Sample pages (home, about, contact)
- Page sections for each page
- Program categories and items
- Sample posts
- Gallery images
- Navigation menus (header, footer)
- Site settings
- Contact info
- Announcements

## Backup Before Migration

```bash
# Full backup
mysqldump -u gensa_user -p gensa_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Schema only
mysqldump -u gensa_user -p --no-data gensa_db > schema_$(date +%Y%m%d_%H%M%S).sql

# Data only
mysqldump -u gensa_user -p --no-create-info gensa_db > data_$(date +%Y%m%d_%H%M%S).sql
```

## Rollback Strategy

1. **Always backup before migration**
2. **Test in staging first**
3. **Manual rollback**: Execute reverse SQL statements
4. **Migration tracker**: Delete row from `migrations` table to re-run

```sql
-- Example: Rollback migration 015
DELETE FROM migrations WHERE filename = '015_add_seo_fields.sql';
-- Then manually run reverse SQL
```