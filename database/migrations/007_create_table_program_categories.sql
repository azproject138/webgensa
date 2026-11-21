-- Migration 007: Create table program_categories
-- Tabel untuk menyimpan kategori Ruang Gerak (lingkungan, sosial, koordinasi)

USE gensa_db;

CREATE TABLE IF NOT EXISTS program_categories (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  image_url VARCHAR(500),
  accent_color VARCHAR(20) DEFAULT '#193B2D',
  accent_text_color VARCHAR(20) DEFAULT '#F3EBDD',
  sort_order INT DEFAULT 0,
  is_published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_sort (sort_order),
  INDEX idx_published (is_published)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
