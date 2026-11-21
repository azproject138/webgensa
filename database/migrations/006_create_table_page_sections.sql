-- Migration 006: Create table page_sections
-- Tabel untuk menyimpan konten section tiap halaman (hero, about, ruang-gerak, dll)

USE gensa_db;

CREATE TABLE IF NOT EXISTS page_sections (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  page_id INT NOT NULL,
  section_key VARCHAR(100) NOT NULL,
  section_type ENUM('hero', 'about', 'ruang-gerak', 'cerita', 'contact') NOT NULL,
  title VARCHAR(255),
  description TEXT,
  content JSON,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_page (page_id),
  INDEX idx_section_key (section_key),
  INDEX idx_sort (sort_order),
  INDEX idx_active (is_active),
  FOREIGN KEY (page_id) REFERENCES pages(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
