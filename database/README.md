# Panduan Menjalankan Migration Database — GENSA CMS

## Prasyarat

1. MySQL server sudah terinstal dan berjalan (XAMPP MySQL atau standalone)
2. Database user memiliki akses untuk CREATE DATABASE dan CREATE TABLE
3. File `.env` sudah dikonfigurasi dengan kredensial database yang benar

## Langkah 1: Buat Database

Jalankan perintah berikut untuk membuat database `gensa_db`:

```bash
# Menggunakan MySQL Client
mysql -u root -p < database/migrations/001_create_database.sql

# Atau jika tidak ada password
mysql -u root < database/migrations/001_create_database.sql
```

## Langkah 2: Jalankan Semua Migration

Untuk membuat semua 12 tabel sekaligus:

```bash
# Menggunakan master migration file
mysql -u root -p gensa_db < database/migrations/000_master_migration.sql

# Atau jika tidak ada password
mysql -u root gensa_db < database/migrations/000_master_migration.sql
```

## Langkah 3: Jalankan Seed Data (Opsional)

Untuk memasukkan data awal:

```bash
mysql -u root -p gensa_db < database/seeds/001_seed_initial_data.sql

# Atau jika tidak ada password
mysql -u root gensa_db < database/seeds/001_seed_initial_data.sql
```

## Langkah 4: Verifikasi

```bash
# Lihat semua tabel
mysql -u root -p gensa_db -e "SHOW TABLES;"

# Lihat struktur tabel contoh
mysql -u root -p gensa_db -e "DESCRIBE admin_users;"
```

## Daftar File Migration

| File | Deskripsi |
|------|-----------|
| `001_create_database.sql` | Membuat database `gensa_db` |
| `002_create_table_admin_users.sql` | Tabel administrator |
| `003_create_table_site_settings.sql` | Pengaturan website |
| `004_create_table_navigation_items.sql` | Menu navigasi (navbar & footer) |
| `005_create_table_pages.sql` | Halaman website |
| `006_create_table_page_sections.sql` | Konten section halaman |
| `007_create_table_program_categories.sql` | Kategori Ruang Gerak |
| `008_create_table_program_items.sql` | Item kegiatan Ruang Gerak |
| `009_create_table_posts.sql` | Artikel Cerita & Berita |
| `010_create_table_media.sql` | Metadata file upload |
| `011_create_table_gallery_items.sql` | Item galeri foto |
| `012_create_table_contact_settings.sql` | Informasi kontak |
| `013_create_table_announcement_bars.sql` | Bar pengumuman |
| `000_master_migration.sql` | Jalankan semua migration sekaligus |

## Daftar File Seed

| File | Deskripsi |
|------|-----------|
| `001_seed_initial_data.sql` | Data awal admin, site settings, pages, navigation, announcement, contact |

## Catatan Penting

- Semua migration menggunakan `CREATE TABLE IF NOT EXISTS`, aman untuk dijalankan ulang
- Semua tabel menggunakan engine `InnoDB` dan charset `utf8mb4` (dukungan emoji dan Bahasa Indonesia)
- Foreign key menggunakan `ON DELETE SET NULL` atau `ON DELETE CASCADE` untuk penghapusan data yang aman
- Jangan menghapus database atau tabel yang sudah berisi data produksi

## Troubleshooting

**Error: Access denied for user 'root'@'localhost'**
- Pastikan kredensial MySQL di file `.env` benar
- Pastikan MySQL server berjalan

**Error: Unknown database 'gensa_db'**
- Jalankan terlebih dahulu `001_create_database.sql` sebelum migration tabel

**Error: Cannot add foreign key constraint**
- Pastikan tabel referensi sudah dibuat sebelum tabel yang mereferensinya
- Jalankan migration dalam urutan yang benar (gunakan `000_master_migration.sql`)
