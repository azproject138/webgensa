# Laporan Backend — GENSA CMS (Generasi Sangurejo)

## 1. Arsitektur Backend

Stack teknologi yang dipilih:

| Komponen | Teknologi | Keterangan |
|----------|-----------|------------|
| Framework | Next.js 16.4.6 (App Router) | Frontend dan backend dalam satu project |
| Bahasa | TypeScript | Type safety di seluruh lapisan |
| Database | MySQL | Database relasial utama |
| Driver | mysql2 | Koneksi ke MySQL dengan prepared statements |
| Auth | Custom session + cookie | HttpOnly, Secure (production), SameSite |
| Password | bcrypt | Hashing password admin |
| File Upload | Local filesystem (public/uploads) | Penyimpanan file gambar persistente |
| Route Handlers | Next.js Route Handlers (`/api/*`) | Endpoint REST untuk admin dan publik |

### Pola Arsitektur (Layered)

```
src/
├── app/                    # Next.js App Router (halaman + Route Handlers)
│   ├── api/                # Endpoint REST (auth, content, media)
│   └── admin/              # Halaman dashboard admin
├── lib/
│   ├── db.ts               # Koneksi MySQL (pool mysql2)
│   ├── auth.ts             # Session, bcrypt, verifikasi token
│   └── upload.ts           # Penyimpanan file gambar
├── repositories/           # Akses data (query terparameterisasi)
├── services/               # Bisnis logic
├── validators/             # Validasi input server-side
└── sections/               # Section frontend (diintegrasi ke DB)
```

**Alur data:**
1. Request masuk ke Route Handler (`/api/...`)
2. Middleware autentikasi memverifikasi session cookie
3. Service memanggil Repository
4. Repository mengeksekusi query terparameterisasi via `mysql2`
5. Hasil dikembalikan sebagai JSON

**Keamanan:**
- Semua query menggunakan prepared statements (`?` placeholder)
- Password di-hash dengan bcrypt (tidak disimpan plaintext)
- Session disimpan dalam cookie `HttpOnly`, `Secure` (production), `SameSite=Strict`
- Semua endpoint admin dilindungi oleh middleware session
- Validasi input di sisi server (tipe, ukuran, ekstensi file)
- Rate limit pada endpoint login
- CSRF protection sesuai mekanisme session

---

## 2. Struktur Database — `gensa_db`

Database dirancang dengan 12 tabel, foreign keys, indexes, dan timestamps.

### Daftar Tabel

| Tabel | Deskripsi |
|-------|-----------|
| `admin_users` | Akun administrator (email, password hash, role, status) |
| `site_settings` | Pengaturan website (judul, deskripsi, favicon, OG image, dll) |
| `navigation_items` | Item menu navigasi (label, href, urutan, aktif/nonaktif) |
| `pages` | Halaman website (slug, title, status publish) |
| `page_sections` | Konten section tiap halaman (hero, about, ruang-gerak, dll) |
| `program_categories` | Kategori Ruang Gerak (lingkungan, sosial, koordinasi) |
| `program_items` | Item kegiatan dalam setiap kategori Ruang Gerak |
| `posts` | Artikel Cerita & Berita (judul, slug, isi, status, SEO) |
| `gallery_items` | Item galeri foto (judul, caption, kategori, urutan, aktif) |
| `media` | Metadata file upload (nama, path, ukuran, mime type) |
| `contact_settings` | Informasi kontak (alamat, WhatsApp, email, sosial media) |
| `announcement_bars` | Bar pengumuman (teks, aktif, urutan) |

### Relasi Utama
- `admin_users` → `site_settings` (updated_by)
- `admin_users` → `posts` (author_id)
- `admin_users` → `gallery_items` (uploaded_by)
- `admin_users` → `navigation_items` (updated_by)
- `admin_users` → `contact_settings` (updated_by)
- `pages` → `page_sections` (page_id, cascade delete)
- `program_categories` → `program_items` (category_id, cascade delete)
- `posts` → `gallery_items` (post_id)
- `media` → `gallery_items` (media_id)

### Contoh Schema (SQL Migration)

```sql
CREATE DATABASE IF NOT EXISTS gensa_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE gensa_db;

CREATE TABLE admin_users (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('super_admin','admin','editor') DEFAULT 'editor',
  is_active BOOLEAN DEFAULT TRUE,
  last_login_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_active (is_active)
);

CREATE TABLE site_settings (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  setting_key VARCHAR(100) NOT NULL UNIQUE,
  setting_value TEXT,
  setting_type ENUM('text','textarea','image','color','boolean','number') DEFAULT 'text',
  updated_by CHAR(36),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (updated_by) REFERENCES admin_users(id) ON DELETE SET NULL,
  INDEX idx_key (setting_key)
);

-- ... (tabel lain sesuai rancangan lengkap)
```

Seed data akan diisi dengan konten website yang sudah ada (Hero, About, Ruang Gerak, Cerita, Kontak, dll) agar tidak kehilangan konten saat frontend diintegrasi ke database.

---

## 3. Daftar File yang Akan Dibuat (Backend)

### Konfigurasi
- `.env.example` — Variabel environment (DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASS, NEXTAUTH_SECRET, dll)
- `next.config.ts` — Ditambahkan `images.remotePatterns` untuk upload lokal

### Library (src/lib/)
- `src/lib/db.ts` — Koneksi pool MySQL
- `src/lib/auth.ts` — Session, bcrypt, verifikasi token
- `src/lib/upload.ts` — Penyimpanan file gambar

### Repository (src/repositories/)
- `src/repositories/admin.repository.ts`
- `src/repositories/site-settings.repository.ts`
- `src/repositories/navigation.repository.ts`
- `src/repositories/pages.repository.ts`
- `src/repositories/page-sections.repository.ts`
- `src/repositories/program-categories.repository.ts`
- `src/repositories/program-items.repository.ts`
- `src/repositories/posts.repository.ts`
- `src/repositories/gallery.repository.ts`
- `src/repositories/media.repository.ts`
- `src/repositories/contact.repository.ts`
- `src/repositories/announcement.repository.ts`

### Service (src/services/)
- `src/services/auth.service.ts`
- `src/services/content.service.ts`
- `src/services/media.service.ts`

### Validator (src/validators/)
- `src/validators/auth.validator.ts`
- `src/validators/content.validator.ts`
- `src/validators/media.validator.ts`

### Route Handlers (src/app/api/)
- `src/app/api/auth/login/route.ts`
- `src/app/api/auth/logout/route.ts`
- `src/app/api/auth/me/route.ts`
- `src/app/api/auth/change-password/route.ts`
- `src/app/api/site-settings/route.ts`
- `src/app/api/navigation/route.ts`
- `src/app/api/pages/route.ts`
- `src/app/api/page-sections/route.ts`
- `src/app/api/program-categories/route.ts`
- `src/app/api/program-items/route.ts`
- `src/app/api/posts/route.ts`
- `src/app/api/gallery/route.ts`
- `src/app/api/media/route.ts`
- `src/app/api/contact/route.ts`
- `src/app/api/announcement/route.ts`

### Admin Pages (src/app/admin/)
- `src/app/admin/layout.tsx` — Layout admin (sidebar)
- `src/app/admin/login/page.tsx` — Halaman login
- `src/app/admin/dashboard/page.tsx` — Dashboard
- `src/app/admin/identitas/page.tsx` — Identitas GENSA
- `src/app/admin/hero/page.tsx` — Hero Section
- `src/app/admin/tentang/page.tsx` — Tentang GENSA
- `src/app/admin/ruang-gerak/page.tsx` — Ruang Gerak
- `src/app/admin/cerita/page.tsx` — Cerita & Berita
- `src/app/admin/galeri/page.tsx` — Galeri
- `src/app/admin/kontak/page.tsx` — Kontak
- `src/app/admin/navbar-footer/page.tsx` — Navbar & Footer
- `src/app/admin/pengaturan/page.tsx` — Pengaturan Website
- `src/app/admin/manajemen-admin/page.tsx` — Manajemen Admin

### Middleware
- `src/middleware.ts` — Proteksi halaman admin dan API

---

## 4. Fitur yang Akan Dibangun

### Autentikasi & Keamanan
- [ ] Login admin (email + password)
- [ ] Hash password dengan bcrypt
- [ ] Session cookie HttpOnly, Secure, SameSite
- [ ] Middleware proteksi halaman admin
- [ ] Rate limit login
- [ ] Logout dan ganti password
- [ ] Akun admin awal via environment variables

### Manajemen Konten (CMS)
- [ ] Identitas GENSA (nama, deskripsi, logo, lokasi)
- [ ] Announcement Bar (teks, aktif, urutan)
- [ ] Hero (heading, deskripsi, foto, tombol)
- [ ] Tentang GENSA (judul, deskripsi, foto, fakta)
- [ ] Ruang Gerak (kategori, item, foto, status, urutan)
- [ ] Cerita & Berita (CRUD artikel, slug, SEO, draft/publish)
- [ ] Galeri (upload, ganti, hapus, urutan, preview)
- [ ] Kontak (alamat, WhatsApp, email, sosial media)
- [ ] Navbar & Footer (logo, menu, urutan, deskripsi)
- [ ] SEO & Website Settings (title, meta, favicon, OG)

### Media Upload
- [ ] Upload gambar (logo, hero, tentang, ruang gerak, thumbnail, galeri)
- [ ] Validasi tipe, ukuran, ekstensi file
- [ ] Preview gambar sebelum disimpan
- [ ] Hapus dan ganti file secara aman
- [ ] Metadata disimpan di tabel `media`

### Frontend Integration
- [ ] Semua section publik dihubungkan ke database
- [ ] Konten dinamis dari admin muncul di website publik
- [ ] Empty state jika data kosong
- [ ] Caching dan revalidation tepat
- [ ] Pertahankan desain Playful Brutalism

### Admin UX
- [ ] Toast notification
- [ ] Konfirmasi sebelum menghapus
- [ ] Loading state
- [ ] Error handling
- [ ] Form validation
- [ ] Image preview
- [ ] Search dan filter
- [ ] Pagination artikel dan galeri
- [ ] Indikator draft/published

---

## 5. Cara Menjalankan MySQL

Pastikan MySQL server aktif (XAMPP MySQL atau standalone):

```bash
# Jika menggunakan XAMPP di Windows
# Buka XAMPP Control Panel, klik Start pada MySQL

# Atau jika MySQL terinstal sebagai service
net start mysql
```

Buat database dan user:

```sql
CREATE DATABASE gensa_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'gensa_user'@'localhost' IDENTIFIED BY 'password_anda';
GRANT ALL PRIVILEGES ON gensa_db.* TO 'gensa_user'@'localhost';
FLUSH PRIVILEGES;
```

---

## 6. Cara Setup Akun Admin

Buat file `.env` dari `.env.example`:

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=gensa_db
DB_USER=gensa_user
DB_PASS=password_anda
ADMIN_EMAIL=admin@gensa.id
ADMIN_PASSWORD=PasswordAman123
NEXTAUTH_SECRET=rahasia_sangat_aman
```

Jalankan migration SQL untuk membuat tabel, lalu jalankan seed untuk memasukkan admin awal dan konten website.

Akun admin awal dibuat melalui environment variables (`ADMIN_EMAIL`, `ADMIN_PASSWORD`) selama proses setup pertama, **tidak ditanam langsung ke source code**.

---

## 7. Cara Menjalankan Project

```bash
# 1. Install dependency
npm install

# 2. Install mysql2
npm install mysql2

# 3. Salin .env.example ke .env dan isi kredensial
copy .env.example .env

# 4. Buat database gensa_db di MySQL
# 5. Jalankan migration SQL
# 6. Jalankan seed data

# 7. Jalankan development server
npm run dev

# 8. Buka http://localhost:3000 (website publik)
# 9. Buka http://localhost:3000/admin/login (admin)
```

Perintah penting:
- `npm run dev` — Development server
- `npm run build` — Production build
- `npm run start` — Production server
- `npm run lint` — ESLint

---

## 8. Fitur yang Masih Belum Selesai

Backend CMS masih dalam fase perencanaan (Tahap 1: Audit dan Rancangan Database). Berikut fitur yang **belum diimplementasi**:

1. Instalasi dan konfigurasi `mysql2`
2. File `.env.example` dan `.env`
3. Koneksi pool MySQL (`src/lib/db.ts`)
4. Semua migration SQL
5. Seed data
6. Repository layer
7. Service layer
8. Validator layer
9. Route Handlers API (auth, content, media)
10. Middleware autentikasi admin
11. Halaman admin dashboard dan semua halaman CRUD
12. Sistem upload gambar
13. Integrasi frontend ke database
14. Caching dan revalidation
15. Testing keamanan, CRUD, responsive, dan build

**Tahap selanjutnya:** Tahap 2 — Konfigurasi MySQL dan database connection.

---

Dibuat untuk: Website GENSA (Generasi Sangurejo)
Desain: Playful Brutalism
Status: Perencanaan backend selesai, siap implementasi Tahap 2
