-- Migration 010: Create table media
-- Tabel untuk menyimpan metadata file upload gambar

USE gensa_db;

CREATE TABLE IF NOT EXISTS media (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  original_name VARCHAR(255) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_url VARCHAR(500) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  file_size INT NOT NULL,
  width INT,
  height INT,
  uploaded_by CHAR(36) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_file_name (file_name),
  INDEX idx_uploaded_at (created_at),
  FOREIGN KEY (uploaded_by) REFERENCES admin_users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
