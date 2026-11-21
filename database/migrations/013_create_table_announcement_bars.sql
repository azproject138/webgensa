-- Migration 013: Create table announcement_bars
-- Tabel untuk menyimpan bar pengumuman di halaman depan

USE gensa_db;

CREATE TABLE IF NOT EXISTS announcement_bars (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  text TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_sort (sort_order),
  INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
