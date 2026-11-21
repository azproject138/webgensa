-- Migration 012: Create table contact_settings
-- Tabel untuk menyimpan informasi kontak organisasi

USE gensa_db;

CREATE TABLE IF NOT EXISTS contact_settings (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  address TEXT NOT NULL,
  location_description TEXT,
  whatsapp VARCHAR(50),
  email VARCHAR(255),
  instagram VARCHAR(100),
  facebook VARCHAR(100),
  twitter VARCHAR(100),
  updated_by CHAR(36) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (updated_by) REFERENCES admin_users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
