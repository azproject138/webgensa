-- Migration 008: Create table program_items
-- Tabel untuk menyimpan item kegiatan dalam setiap kategori Ruang Gerak

USE gensa_db;

CREATE TABLE IF NOT EXISTS program_items (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  category_id CHAR(36) NOT NULL,
  title VARCHAR(255) NOT NULL,
  sort_order INT DEFAULT 0,
  INDEX idx_category (category_id),
  INDEX idx_sort (sort_order),
  FOREIGN KEY (category_id) REFERENCES program_categories(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
