-- Seed Data: Data awal untuk tabel admin_users dan site_settings
-- Jalankan SETELAH migration: mysql -u root -p gensa_db < database/seeds/001_seed_initial_data.sql

USE gensa_db;

-- Insert admin user awal (password akan di-hash melalui proses setup)
-- Catatan: Password plaintext di sini HANYA untuk seed awal, harus di-hash sebelum digunakan
INSERT INTO admin_users (id, name, email, password_hash, role, is_active) VALUES
  (UUID(), 'Administrator', 'admin@gensa.id', '', 'super_admin', TRUE)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Insert site settings awal
INSERT INTO site_settings (setting_key, setting_value, setting_type) VALUES
  ('site_title', 'GENSA — Generasi Sangurejo', 'text'),
  ('site_description', 'Organisasi kepemudaan di Sangurejo, Turi, Sleman, Yogyakarta.', 'text'),
  ('site_locale', 'id_ID', 'text'),
  ('og_image', '', 'image'),
  ('favicon', '', 'image'),
  ('google_indexing', 'true', 'boolean')
ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value);

-- Insert halaman utama (homepage)
INSERT INTO pages (id, slug, title, is_published) VALUES
  (UUID(), 'beranda', 'Beranda', TRUE)
ON DUPLICATE KEY UPDATE title = VALUES(title);

-- Insert announcement bar awal
INSERT INTO announcement_bars (text, is_active, sort_order) VALUES
  ('GENSA — Generasi Sangurejo | Kegiatan rutin: pengumpulan sampah di 5 titik, rapat koordinasi, dan gotong royong, Sangurejo, Turi, Sleman, Yogyakarta.', TRUE, 1);

-- Insert kontak awal
INSERT INTO contact_settings (id, address, location_description, updated_at) VALUES
  (UUID(), 'Sangurejo, Turi, Sleman, Yogyakarta', 'Organisasi kepemudaan di Sangurejo, Turi, Sleman, Yogyakarta.', CURRENT_TIMESTAMP);

-- Insert menu navigasi awal
INSERT INTO navigation_items (id, label, href, target_section, location, sort_order, is_active) VALUES
  (UUID(), 'Beranda', '#beranda', 'home', 'navbar', 1, TRUE),
  (UUID(), 'Tentang GENSA', '#tentang', 'tentang', 'navbar', 2, TRUE),
  (UUID(), 'Ruang Gerak', '#ruang-gerak', 'ruang-gerak', 'navbar', 3, TRUE),
  (UUID(), 'Cerita & Dokumentasi', '#cerita', 'cerita', 'navbar', 4, TRUE),
  (UUID(), 'Kontak', '#kontak', 'kontak', 'navbar', 5, TRUE),
  (UUID(), 'Tentang', '#tentang', 'tentang', 'footer', 1, TRUE),
  (UUID(), 'Ruang Gerak', '#ruang-gerak', 'ruang-gerak', 'footer', 2, TRUE),
  (UUID(), 'Cerita', '#cerita', 'cerita', 'footer', 3, TRUE),
  (UUID(), 'Kontak', '#kontak', 'kontak', 'footer', 4, TRUE);
