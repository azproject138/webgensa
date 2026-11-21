# GENSA — Generasi Sangurejo

<p align="center">
  <strong>GENERASI YANG TUMBUH BERSAMA DESA.</strong>
</p>

<p align="center">
  Sebuah platform digital untuk mengenalkan identitas, aktivitas, karya, dan ruang gerak pemuda Generasi Sangurejo.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/WEBSITE-COMING_SOON-D8F05A?style=for-the-badge&labelColor=193B2D" alt="Website Coming Soon">
</p>

<p align="center">
  <a href="https://www.gensangurejo.my.id">
    <strong>🌐 www.gensangurejo.my.id</strong>
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js" alt="Next.js 16">
  <img src="https://img.shields.io/badge/TypeScript-Ready-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss" alt="Tailwind CSS">
  <img src="https://img.shields.io/badge/MySQL-Database-4479A1?style=for-the-badge&logo=mysql" alt="MySQL">
</p>

---

## ✳️ About GENSA

**GENSA (Generasi Sangurejo)** merupakan platform digital yang dibangun sebagai ruang informasi dan representasi pemuda Desa Sangurejo, Turi, Sleman, Yogyakarta.

Website ini dirancang untuk memperkenalkan identitas organisasi, mendokumentasikan kegiatan, menampilkan program, serta menjadi media komunikasi antara GENSA dan masyarakat.

Berlandaskan semangat:

> **NYAWIJI DADI SIJI** — Bersatu menjadi satu.

GENSA percaya bahwa generasi muda memiliki peran penting dalam menjaga identitas, mengembangkan potensi, dan membangun masa depan desa.

## ✦ Features

- **Modern Public Website** — Tampilan responsif dengan pendekatan desain editorial dan playful brutalism.
- **Dynamic Content Management** — Pengelolaan konten website melalui dashboard admin.
- **Admin Authentication** — Sistem login dan manajemen sesi administrator.
- **Content Management System** — Pengelolaan halaman, program, artikel, galeri, navigasi, dan pengaturan website.
- **Media Library** — Upload, pencarian, pratinjau, dan pengelolaan media.
- **SEO Optimization** — Metadata dinamis, Open Graph, sitemap, dan robots.txt.
- **Responsive Design** — Dioptimalkan untuk desktop, tablet, dan perangkat mobile.

## ⚙️ Tech Stack

| Technology | Usage |
|---|---|
| Next.js 16 | React framework |
| TypeScript | Type-safe development |
| Tailwind CSS v4 | Styling |
| Framer Motion | UI animations |
| MySQL | Relational database |
| mysql2 | Database connection |
| bcryptjs | Password hashing |
| Zod | Data validation |
| Node.js | Runtime environment |

## 🎨 Design Direction

GENSA menggunakan pendekatan visual yang menggabungkan karakter budaya lokal dengan estetika digital modern.

**Color Palette**

| Color | Hex |
|---|---|
| Cream | `#F3EBDD` |
| Forest Green | `#193B2D` |
| Black | `#202020` |
| Lime Accent | `#D8F05A` |
| Orange Accent | `#E87550` |

## 📁 Project Structure

```text
webgensa/
├── docs/
├── public/
├── src/
│   ├── app/
│   ├── components/
│   ├── data/
│   ├── lib/
│   ├── repositories/
│   ├── services/
│   ├── types/
│   └── proxy.ts
├── migrations/
├── .env.example
├── next.config.ts
├── package.json
└── README.md
```

*Struktur di atas merupakan gambaran arsitektur project dan dapat disesuaikan dengan struktur aktual repository.*

## 🚀 Getting Started

### Requirements

- Node.js
- npm
- MySQL Server
- Git

### 1. Clone Repository

```bash
git clone https://github.com/azproject138/webgensa.git
cd webgensa
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

```bash
cp .env.example .env
```

Sesuaikan konfigurasi database dan environment variables berdasarkan dokumentasi project.

**Important:** Jangan pernah mengunggah file `.env` atau credential rahasia ke repository publik.

### 4. Database Setup

Pastikan MySQL berjalan, database sudah dibuat, dan konfigurasi koneksi sudah benar.

```bash
npm run db:migrate
```

### 5. Run Development Server

```bash
npm run dev
```

Buka `http://localhost:3000`.

## 🔐 Admin Dashboard

GENSA dilengkapi dashboard administrator untuk mengelola konten website.

- Website content
- Programs & activities
- Articles
- Gallery & media
- Navigation
- Website settings
- Administrator profile

Akses dashboard melalui `/admin/login`.

Akun administrator harus disiapkan melalui proses provisioning yang dijelaskan dalam dokumentasi project.

## 🛡️ Security & Documentation

- Password hashing menggunakan bcrypt.
- Session berbasis cookie HttpOnly.
- Validasi data menggunakan Zod.
- Proteksi akses halaman administrator.
- Environment variables untuk konfigurasi sensitif.
- Validasi file media yang diunggah.

Dokumentasi teknis tersedia di folder `docs/`.

## 🗺️ Project Vision

GENSA bukan sekadar website organisasi.

Platform ini merupakan bagian dari upaya membangun identitas digital pemuda desa, membuka ruang kolaborasi, serta memperkenalkan potensi lokal kepada masyarakat yang lebih luas.

**Tumbuh bersama. Bergerak bersama. Membangun desa bersama.**

---

<p align="center">
  <strong>GENSA — GENERASI SANGUREJO</strong><br>
  <sub>Nyawiji Dadi Siji · Sangurejo, Turi, Sleman, Yogyakarta</sub>
</p>

<p align="center">
  Made with purpose by <strong>Aziz Fatkhu</strong>
</p>