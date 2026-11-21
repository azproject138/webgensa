-- Master Migration: Jalankan semua migration dalam urutan yang benar
-- Jalankan: mysql -u root -p < database/migrations/000_master_migration.sql

SOURCE database/migrations/001_create_database.sql;
SOURCE database/migrations/002_create_table_admin_users.sql;
SOURCE database/migrations/003_create_table_site_settings.sql;
SOURCE database/migrations/004_create_table_navigation_items.sql;
SOURCE database/migrations/005_create_table_pages.sql;
SOURCE database/migrations/006_create_table_page_sections.sql;
SOURCE database/migrations/007_create_table_program_categories.sql;
SOURCE database/migrations/008_create_table_program_items.sql;
SOURCE database/migrations/009_create_table_posts.sql;
SOURCE database/migrations/010_create_table_media.sql;
SOURCE database/migrations/011_create_table_gallery_items.sql;
SOURCE database/migrations/012_create_table_contact_settings.sql;
SOURCE database/migrations/013_create_table_announcement_bars.sql;

-- Verifikasi semua tabel telah dibuat
SHOW TABLES;
