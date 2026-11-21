-- Migration 004: Create table navigation_items
-- Tabel untuk menyimpan item menu navigasi (navbar dan footer)

USE gensa_db;

CREATE TABLE IF NOT EXISTS navigation_items (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  label VARCHAR(100) NOT NULL,
  href VARCHAR(255) NOT NULL,
  target_section ENUM('home', 'tentang', 'ruang-gerak', 'cerita', 'kontak') NULL,
  location ENUM('navbar', 'footer') DEFAULT 'navbar',
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  updated_by CHAR(36) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_sort (sort_order),
  INDEX idx_active (is_active),
  INDEX idx_location (location),
  FOREIGN KEY (updated_by) REFERENCES admin_users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
