-- Migration 011: Create table gallery_items
-- Tabel untuk menyimpan item galeri foto

USE gensa_db;

CREATE TABLE IF NOT EXISTS gallery_items (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  title VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  image_url VARCHAR(500) NOT NULL,
  alt_text VARCHAR(255),
  caption TEXT,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  is_placeholder BOOLEAN DEFAULT FALSE,
  media_id CHAR(36) NULL,
  uploaded_by CHAR(36) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_sort (sort_order),
  INDEX idx_active (is_active),
  INDEX idx_placeholder (is_placeholder),
  FOREIGN KEY (media_id) REFERENCES media(id) ON DELETE SET NULL,
  FOREIGN KEY (uploaded_by) REFERENCES admin_users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
