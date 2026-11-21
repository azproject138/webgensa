-- Migration 003: Create table site_settings
-- Tabel untuk menyimpan pengaturan website (judul, deskripsi, favicon, OG image, dll)

USE gensa_db;

CREATE TABLE IF NOT EXISTS site_settings (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  setting_key VARCHAR(100) NOT NULL UNIQUE,
  setting_value TEXT,
  setting_type ENUM('text', 'textarea', 'image', 'color', 'boolean', 'number') DEFAULT 'text',
  updated_by CHAR(36) NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_key (setting_key),
  FOREIGN KEY (updated_by) REFERENCES admin_users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
