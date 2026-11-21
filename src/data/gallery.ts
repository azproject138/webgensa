export interface GalleryItem {
  id: string;
  title: string;
  category: string;
  image: string;
  alt: string;
  caption: string;
  isPlaceholder: boolean;
}

export const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: "galeri-01",
    title: "Bersama Warga",
    category: "Kegiatan Sosial",
    image:
      "https://images.unsplash.com/photo-1529285825808-19552ca229c2?q=80&w=1200&auto=format&fit=crop",
    alt: "Foto ilustrasi kegiatan sosial bersama warga",
    caption: "Kegiatan sosial bersama warga Sangurejo.",
    isPlaceholder: true,
  },
  {
    id: "galeri-02",
    title: "Bersih Bersih Lingkungan",
    category: "Pengumpulan Sampah",
    image:
      "https://images.unsplash.com/photo-1541712641044-9e9be57b3040?q=80&w=1200&auto=format&fit=crop",
    alt: "Foto illustrasi kegiatan pembersihan lingkungan",
    caption: "Rutin pembersihan lingkungan di titik pengumpulan sampah.",
    isPlaceholder: true,
  },
  {
    id: "galeri-03",
    title: "Gotong Royong",
    category: "Kebersamaan",
    image:
      "https://images.unsplash.com/photo-1517486808923-7aca48c6cc34?q=80&w=1200&auto=format&fit=crop",
    alt: "Foto illustrasi gotong royong warga",
    caption: "Gotong royong bersama warga setempat.",
    isPlaceholder: true,
  },
  {
    id: "galeri-04",
    title: "Rapat Koordinasi",
    category: "Organisasi",
    image:
      "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=1200&auto=format&fit=crop",
    alt: "Foto illustrasi rapat koordinasi anggota",
    caption: "Rapat koordinasi bulanan anggota GENSA.",
    isPlaceholder: true,
  },
  {
    id: "galeri-05",
    title: "Perayaan Kemerdekaan",
    category: "Kegiatan Sosial",
    image:
      "https://images.unsplash.com/photo-1533138175117-e7e6e339956e?q=80&w=1200&auto=format&fit=crop",
    alt: "Foto illustrasi perayaan kemerdekaan",
    caption: "Perayaan Hari Kemerdekaan bersama warga.",
    isPlaceholder: true,
  },
  {
    id: "galeri-06",
    title: "Takbir Keliling",
    category: "Kegiatan Sosial",
    image:
      "https://images.unsplash.com/photo-1543343664-61a22989c33d?q=80&w=1200&auto=format&fit=crop",
    alt: "Foto illustrasi takbir keliling",
    caption: "Gerakan takbir keliling di lingkungan warga.",
    isPlaceholder: true,
  },
];
