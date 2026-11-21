-- Seed konten awal CMS GENSA (Tahap 5)
-- Struktur disesuaikan dengan tabel aktual di database (bukan file migrasi).
-- Jalankan SETELAH migration: mysql -u root gensa_db < database/seeds/002_seed_cms_content.sql

USE gensa_db;

-- Halaman beranda (id akan jadi 1 karena tabel kosong dan id int auto_increment)
INSERT INTO pages (slug, title, content)
SELECT 'beranda', 'Beranda', ''
WHERE NOT EXISTS (SELECT 1 FROM pages WHERE slug = 'beranda');

-- Section halaman beranda
INSERT INTO page_sections (page_id, section_key, section_type, title, description, content, sort_order, is_active)
SELECT p.id, 'hero', 'hero', 'GENERASI YANG TUMBUH BERSAMA DESA', 'Organisasi kepemudaan di Sangurejo, Turi, Sleman, Yogyakarta.', NULL, 1, 1
FROM pages p WHERE p.slug = 'beranda'
  AND NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = p.id AND section_key = 'hero');

INSERT INTO page_sections (page_id, section_key, section_type, title, description, content, sort_order, is_active)
SELECT p.id, 'tentang', 'about', 'Tentang GENSA', 'Generasi Sangurejo (GENSA) adalah organisasi kepemudaan yang berdomisili di Sangurejo, Turi, Sleman, Yogyakarta.', NULL, 2, 1
FROM pages p WHERE p.slug = 'beranda'
  AND NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = p.id AND section_key = 'tentang');

INSERT INTO page_sections (page_id, section_key, section_type, title, description, content, sort_order, is_active)
SELECT p.id, 'ruang-gerak', 'ruang-gerak', 'Ruang Gerak', 'Wadah kegiatan tematik warga dalam 3 kategori: Lingkungan, Sosial & Kebersamaan, dan Koordinasi Organisasi.', NULL, 3, 1
FROM pages p WHERE p.slug = 'beranda'
  AND NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = p.id AND section_key = 'ruang-gerak');

INSERT INTO page_sections (page_id, section_key, section_type, title, description, content, sort_order, is_active)
SELECT p.id, 'cerita', 'cerita', 'Cerita & Dokumentasi', 'Dokumentasi kegiatan dan momen-momen organisasi GENSA.', NULL, 4, 1
FROM pages p WHERE p.slug = 'beranda'
  AND NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = p.id AND section_key = 'cerita');

INSERT INTO page_sections (page_id, section_key, section_type, title, description, content, sort_order, is_active)
SELECT p.id, 'kontak', 'contact', 'Kontak', 'Sangurejo, Turi, Sleman, Yogyakarta.', NULL, 5, 1
FROM pages p WHERE p.slug = 'beranda'
  AND NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = p.id AND section_key = 'kontak');

-- Kategori Ruang Gerak awal
INSERT INTO program_categories (name, description, image_url, accent_color, accent_text_color, sort_order, is_published)
SELECT 'Lingkungan', 'Kegiatan terkait kelestarian lingkungan dan kebersihan desa.', NULL, '#193B2D', '#F3EBDD', 1, 1
WHERE NOT EXISTS (SELECT 1 FROM program_categories WHERE name = 'Lingkungan');

INSERT INTO program_categories (name, description, image_url, accent_color, accent_text_color, sort_order, is_published)
SELECT 'Sosial & Kebersamaan', 'Kegiatan sosial dan kemanusiaan yang mempererat ikatan warga.', NULL, '#193B2D', '#F3EBDD', 2, 1
WHERE NOT EXISTS (SELECT 1 FROM program_categories WHERE name = 'Sosial & Kebersamaan');

INSERT INTO program_categories (name, description, image_url, accent_color, accent_text_color, sort_order, is_published)
SELECT 'Koordinasi Organisasi', 'Koordinasi internal organisasi dan rapat rutin.', NULL, '#193B2D', '#F3EBDD', 3, 1
WHERE NOT EXISTS (SELECT 1 FROM program_categories WHERE name = 'Koordinasi Organisasi');

-- Kontak organisasi
INSERT INTO contact_settings (address, location_description, whatsapp, email, instagram, facebook, twitter)
SELECT 'Sangurejo, Turi, Sleman, Yogyakarta', 'Organisasi kepemudaan di Sangurejo, Turi, Sleman, Yogyakarta.', NULL, 'admin@gensa.id', NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM contact_settings);

-- Pengaturan situs
INSERT INTO site_settings (setting_key, setting_value, setting_type)
SELECT 'site_title', 'GENSA — Generasi Sangurejo', 'text'
WHERE NOT EXISTS (SELECT 1 FROM site_settings WHERE setting_key = 'site_title');

INSERT INTO site_settings (setting_key, setting_value, setting_type)
SELECT 'site_description', 'Organisasi kepemudaan di Sangurejo, Turi, Sleman, Yogyakarta.', 'text'
WHERE NOT EXISTS (SELECT 1 FROM site_settings WHERE setting_key = 'site_description');

INSERT INTO site_settings (setting_key, setting_value, setting_type)
SELECT 'site_locale', 'id_ID', 'text'
WHERE NOT EXISTS (SELECT 1 FROM site_settings WHERE setting_key = 'site_locale');

-- Bar pengumuman
INSERT INTO announcement_bars (text, is_active, sort_order)
SELECT 'GENSA — Generasi Sangurejo | Kegiatan rutin: pengumpulan sampah, rapat koordinasi, dan gotong royong.', 1, 1
WHERE NOT EXISTS (SELECT 1 FROM announcement_bars);

-- Menu navigasi navbar dan footer
INSERT INTO navigation_items (label, href, target_section, location, sort_order, is_active)
SELECT 'Beranda', '#beranda', 'home', 'navbar', 1, 1
WHERE NOT EXISTS (SELECT 1 FROM navigation_items WHERE label = 'Beranda' AND location = 'navbar');

INSERT INTO navigation_items (label, href, target_section, location, sort_order, is_active)
SELECT 'Tentang GENSA', '#tentang', 'tentang', 'navbar', 2, 1
WHERE NOT EXISTS (SELECT 1 FROM navigation_items WHERE label = 'Tentang GENSA' AND location = 'navbar');

INSERT INTO navigation_items (label, href, target_section, location, sort_order, is_active)
SELECT 'Ruang Gerak', '#ruang-gerak', 'ruang-gerak', 'navbar', 3, 1
WHERE NOT EXISTS (SELECT 1 FROM navigation_items WHERE label = 'Ruang Gerak' AND location = 'navbar');

INSERT INTO navigation_items (label, href, target_section, location, sort_order, is_active)
SELECT 'Cerita & Dokumentasi', '#cerita', 'cerita', 'navbar', 4, 1
WHERE NOT EXISTS (SELECT 1 FROM navigation_items WHERE label = 'Cerita & Dokumentasi' AND location = 'navbar');

INSERT INTO navigation_items (label, href, target_section, location, sort_order, is_active)
SELECT 'Kontak', '#kontak', 'kontak', 'navbar', 5, 1
WHERE NOT EXISTS (SELECT 1 FROM navigation_items WHERE label = 'Kontak' AND location = 'navbar');

INSERT INTO navigation_items (label, href, target_section, location, sort_order, is_active)
SELECT 'Tentang', '#tentang', 'tentang', 'footer', 1, 1
WHERE NOT EXISTS (SELECT 1 FROM navigation_items WHERE label = 'Tentang' AND location = 'footer');

INSERT INTO navigation_items (label, href, target_section, location, sort_order, is_active)
SELECT 'Ruang Gerak', '#ruang-gerak', 'ruang-gerak', 'footer', 2, 1
WHERE NOT EXISTS (SELECT 1 FROM navigation_items WHERE label = 'Ruang Gerak' AND location = 'footer');

INSERT INTO navigation_items (label, href, target_section, location, sort_order, is_active)
SELECT 'Cerita', '#cerita', 'cerita', 'footer', 3, 1
WHERE NOT EXISTS (SELECT 1 FROM navigation_items WHERE label = 'Cerita' AND location = 'footer');

INSERT INTO navigation_items (label, href, target_section, location, sort_order, is_active)
SELECT 'Kontak', '#kontak', 'kontak', 'footer', 4, 1
WHERE NOT EXISTS (SELECT 1 FROM navigation_items WHERE label = 'Kontak' AND location = 'footer');
