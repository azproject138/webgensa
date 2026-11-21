-- Migration 009: Create table posts
-- Tabel untuk menyimpan artikel Cerita & Berita

USE gensa_db;

CREATE TABLE IF NOT EXISTS posts (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  excerpt TEXT,
  content LONGTEXT NOT NULL,
  thumbnail_url VARCHAR(500),
  category VARCHAR(100),
  published_at TIMESTAMP NULL DEFAULT NULL,
  status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
  seo_title VARCHAR(255),
  seo_description TEXT,
  author_id CHAR(36) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_slug (slug),
  INDEX idx_status (status),
  INDEX idx_published_at (published_at),
  INDEX idx_author (author_id),
  FOREIGN KEY (author_id) REFERENCES admin_users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
