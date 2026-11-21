# Laporan Update — Website GENSA (Generasi Sangurejo)

## Ringkasan
Website resmi organisasi kepemudaan GENSA (Generasi Sangurejo) di Sangurejo, Turi, Sleman, Yogyakarta. Dilakukan audit visual, refactor desain Playful Brutalism, serta pengaturan ulang struktur konten menjadi 6 section utama. Foto ilustsi ditempatkan hanya di section Dokumentasi (Cerita), tidak lagi di halaman beranda.

## Teknologi yang Digunakan
- Next.js 16.4.6 (App Router)
- TypeScript
- Tailwind CSS v4
- Framer Motion (animasi halus)
- Google Fonts: Space Grotesk, DM Sans, Space Mono

## Struktur Konten Akhir (6 Section)
1. **Hero** — Identitas GENSA, heading besar "GENERASI YANG TUMBUH BERSAMA DESA", deskripsi singkat, 2 CTA (Tentang GENSA, Lihat Kegiatan), foto dalam bingkai editorial
2. **Tentang GENSA** — Penjelasan organisasi, identitas dan lokasi (Nama, Nama lengkap, Lokasi, Jenis)
3. **Ruang Gerak** — 3 kategori tematik (Lingkungan, Sosial & Kebersamaan, Koordinasi Organisasi) sebagai kerangka editorial
4. **Cerita & Dokumentasi** — Galeri foto ilustrasi dalam layout asimetris editorial, empty state siap diganti dokumentasi asli
5. **Kontak** — Lokasi organisasi saja (Sangurejo, Turi, Sleman, Yogyakarta), tanpa data kontak palsu
6. **Footer** — Navigasi + lokasi organisasi

## File yang Dibuat / Diubah

### Konfigurasi & Desain Sistem
- `src/app/globals.css` — Palet warna baru (Cream #F3EBDD, Forest Green #193B2D, Black #202020, Lime #D8F05A, Orange #E87550), utilitas `.photo-frame` dan `.placeholder-label`, padding section lebih ringkas
- `src/app/layout.tsx` — Font Space Grotesk/DM Sans/Space Mono, metadata SEO, `lang="id"`, `overflow-x: hidden` di body
- `src/app/next.config.ts` — Ditambahkan `images.remotePatterns` untuk `images.unsplash.com`
- `package.json` — `framer-motion@14.14.0`, `motion-dom@14.14.0`, `es-abstract@1.23.0`

### Komponen
- `src/components/AnnouncementBar.tsx` — Bar pengumuman ringkas, tanpa kontak palsu
- `src/components/Navigation.tsx` — Navigasi sticky, tautan in-page, menu mobile horizontal scroll (`flex-nowrap`, `overflow-x-auto`, `whitespace-nowrap`), tanpa hamburger menu
- `src/components/Footer.tsx` — Footer dengan navigasi, lokasi, tanpa link Galeri

### Section Halaman Utama
- `src/sections/Hero.tsx` — Hero baru, heading besar, hapus semua garis dekoratif, foto dalam photo-frame, CTA baru
- `src/sections/About.tsx` — Tentang GENSA, foto editorial dalam photo-frame (ganti kotak lime kosong)
- `src/sections/RuangGerak.tsx` — 3 kategori tematik kegiatan warga
- `src/sections/Cerita.tsx` — Dokumentasi kegiatan dengan galeri foto ilustrasi dalam layout asimetris
- `src/sections/Contact.tsx` — Kontak lokasi saja
- `src/app/page.tsx` — Penggabungan 6 section (Galeri dihapus dari beranda)

### File Baru
- `src/data/gallery.ts` — Data terpusat semua item galeri (id, title, category, image, alt, caption, isPlaceholder), mudah diganti dengan dokumentasi asli

### File Dihapus
- `src/sections/Programs.tsx` — Diganti oleh RuangGerak
- `src/sections/Activities.tsx` — Diganti oleh Cerita
- `src/sections/Galeri.tsx` — Foto dipindahkan ke Cerita/Dokumentasi

## Persyaratan Terpenuhi
- [x] Desain Playful Brutalism (editorial, youth culture, bold typography, clean composition)
- [x] 6 section homepage (Hero, Tentang, Ruang Gerak, Cerita & Dokumentasi, Kontak, Footer)
- [x] Informasi organisasi akurat (tidak ada sejarah, jumlah anggota, slogan, atau kontak yang diimprovisasi)
- [x] Next.js App Router + TypeScript + Tailwind CSS v4
- [x] Framer Motion untuk interaksi halus
- [x] Komponen reusable, HTML semantik
- [x] Responsif mobile-first (360px, 390px, 430px, 768px, 1280px, 1440px)
- [x] Navigasi mobile horizontal, tanpa hamburger menu
- [x] Navigasi dan fokus keyboard dapat diakses
- [x] Metadata SEO
- [x] Gambar dioptimasi (Next Image, object-fit cover, sizes attribute)
- [x] Tidak ada implementasi Supabase / backend palsu
- [x] Tidak ada tautan palsu yang tampak fungsional
- [x] Tidak ada foto atau dokumentasi yang diimprovisasi sebagai foto asli GENSA
- [x] Tidak ada dekorasi garis yang menutupi teks
- [x] Foto ilustrasi hanya di section Dokumentasi, tidak di beranda

## Masalah yang Diperbaiki (Audit & Refactor)
- Elemen visual saling bertabrakan (shadow text di belakang heading, lingkaran/garis dekoratif) — **dihapus**
- Konten duplikat antara Program dan Kegiatan — **diganti dengan Ruang Gerak (3 kategori berbeda)**
- Navigasi mobile vertikal/hamburger — **diganti dengan horizontal scroll**
- Padding section boros — **dikurangi**
- Kotak lime kosong di About — **diganti foto editorial**
- Hierarki warna terlalu banyak background cerah — **diperbaiki** (cream dominan, black teks/border, lime & orange aksen kecil)
- Galeri di beranda — **dihapus, foto hanya di Dokumentasi**

## Hasil Verifikasi
- `npm run lint` — Lulus (0 error, 0 warning)
- `npm run build` — Lulus (TypeScript clean, static prerender berhasil)
- Server development aktif di http://localhost:3000

## Catatan
- Foto ilustrasi menggunakan Unsplash (sumber gratis) dan ditandai `isPlaceholder: true` di `src/data/gallery.ts`
- Untuk mengganti dengan dokumentasi asli GENSA, cukup edit URL dan caption di `src/data/gallery.ts` tanpa mengubah layout
- Proses instalasi awal memerlukan perbaikan dependensi transitive (`es-abstract`) dan penyesuaian berat font Google Fonts agar kompatibel dengan Next.js font optimizer
- Konfigurasi `next.config.ts` ditambahkan `remotePatterns` untuk memungkinkan gambar eksternal dari Unsplash
