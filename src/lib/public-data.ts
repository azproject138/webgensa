import { getDatabasePool } from "@/lib/db";

export interface HeroData {
  title: string;
  subtitle: string;
  description: string;
  cta_text: string;
  cta_link: string;
  secondary_cta_text: string;
  secondary_cta_link: string;
  image_url: string;
  image_alt: string;
  badge_text: string;
}

export interface AboutData {
  title: string;
  description: string;
  facts: { label: string; value: string }[];
  image_url: string;
  image_alt: string;
}

export interface RuangGerakCategory {
  title: string;
  items: string[];
  accent_color: string;
  accent_text_color: string;
}

export interface CeritaData {
  title: string;
  subtitle: string;
  description: string;
}

export interface ContactData {
  title: string;
  subtitle: string;
  address: string;
  location_description: string | null;
  whatsapp: string | null;
  email: string | null;
  instagram: string | null;
  facebook: string | null;
  twitter: string | null;
}

export interface FooterData {
  site_title: string;
  site_description: string;
  location: string;
  nav_items: { label: string; href: string }[];
}

export interface NavigationItem {
  label: string;
  href: string;
  target_section: string | null;
  location: string;
}

export interface AnnouncementBarData {
  text: string;
}

export interface SiteSettingsData {
  site_title: string;
  site_description: string;
  site_locale: string;
  og_image: string;
  favicon: string;
}

interface SectionRow {
  id: string;
  page_id: number;
  section_key: string;
  section_type: string;
  title: string | null;
  description: string | null;
  content: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  page_slug: string;
}

interface ProgramCategoryRow {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  accent_color: string | null;
  accent_text_color: string | null;
  sort_order: number;
  is_published: boolean;
}

interface ProgramItemRow {
  title: string;
}

interface GalleryItemRow {
  id: string;
  title: string;
  category: string | null;
  image_url: string;
  alt_text: string | null;
  caption: string | null;
  sort_order: number;
}

interface ContactSettingRow {
  address: string;
  location_description: string | null;
  whatsapp: string | null;
  email: string | null;
  instagram: string | null;
  facebook: string | null;
  twitter: string | null;
}

interface NavigationItemRow {
  label: string;
  href: string;
  target_section: string | null;
  location: string;
}

interface AnnouncementBarRow {
  text: string;
}

interface SiteSettingRow {
  setting_key: string;
  setting_value: string;
}

async function query<T>(sql: string, params: (string | number)[] = []): Promise<T[]> {
  const pool = getDatabasePool();
  const [rows] = await pool.execute(sql, params);
  return rows as T[];
}

async function queryOne<T>(sql: string, params: (string | number)[] = []): Promise<T | null> {
  const results = await query<T>(sql, params);
  return results.length > 0 ? results[0] : null;
}

export async function getHeroData(): Promise<HeroData> {
  const section = await queryOne<SectionRow>(
    `SELECT s.*, p.slug as page_slug FROM page_sections s
     JOIN pages p ON s.page_id = p.id
     WHERE p.slug = 'beranda' AND s.section_key = 'hero' AND s.is_active = 1
     LIMIT 1`
  );

  if (!section) {
    return {
      title: "GENERASI YANG TUMBUH BERSAMA DESA",
      subtitle: "Organisasi Kepemudaan",
      description: "GENSA (Generasi Sangurejo) adalah organisasi kepemudaan di Sangurejo, Turi, Sleman, Yogyakarta. Kami gerak bersama warga dalam kegiatan sosial dan lingkungan.",
      cta_text: "Tentang GENSA",
      cta_link: "#tentang",
      secondary_cta_text: "Lihat Kegiatan",
      secondary_cta_link: "#galeri",
      image_url: "https://images.unsplash.com/photo-1529285825808-19552ca229c2?q=80&w=1200&auto=format&fit=crop",
      image_alt: "Foto ilustrasi anggota GENSA dalam kegiatan sosial",
      badge_text: "Organisasi Kepemudaan",
    };
  }

  const content = section.content ? JSON.parse(section.content) : {};

  return {
    title: section.title || "GENERASI YANG TUMBUH BERSAMA DESA",
    subtitle: content.badge_text || "Organisasi Kepemudaan",
    description: section.description || "GENSA (Generasi Sangurejo) adalah organisasi kepemudaan di Sangurejo, Turi, Sleman, Yogyakarta. Kami gerak bersama warga dalam kegiatan sosial dan lingkungan.",
    cta_text: content.cta_text || "Tentang GENSA",
    cta_link: content.cta_link || "#tentang",
    secondary_cta_text: content.secondary_cta_text || "Lihat Kegiatan",
    secondary_cta_link: content.secondary_cta_link || "#galeri",
    image_url: content.image_url || "https://images.unsplash.com/photo-1529285825808-19552ca229c2?q=80&w=1200&auto=format&fit=crop",
    image_alt: content.image_alt || "Foto ilustrasi anggota GENSA dalam kegiatan sosial",
    badge_text: content.badge_text || "Organisasi Kepemudaan",
  };
}

export async function getAboutData(): Promise<AboutData> {
  const section = await queryOne<SectionRow>(
    `SELECT s.*, p.slug as page_slug FROM page_sections s
     JOIN pages p ON s.page_id = p.id
     WHERE p.slug = 'beranda' AND s.section_key = 'tentang' AND s.is_active = 1
     LIMIT 1`
  );

  if (!section) {
    return {
      title: "Tentang GENSA",
      description: "GENSA adalah organisasi kepemudaan yang berkedudukan di Sangurejo, Turi, Sleman, Yogyakarta. Organisasi ini gerak bersama warga dalam berbagai kegiatan sosial dan lingkungan sekitar masyarakat Sangurejo.",
      facts: [
        { label: "Nama", value: "GENSA" },
        { label: "Nama lengkap", value: "Generasi Sangurejo" },
        { label: "Lokasi", value: "Sangurejo, Turi, Sleman, Yogyakarta" },
        { label: "Jenis", value: "Organisasi kepemudaan" },
      ],
      image_url: "https://images.unsplash.com/photo-1533138175117-e7e6e339956e?q=80&w=1200&auto=format&fit=crop",
      image_alt: "Foto ilustrasi kegiatan sosial masyarakat",
    };
  }

  const content = section.content ? JSON.parse(section.content) : {};

  return {
    title: section.title || "Tentang GENSA",
    description: section.description || "GENSA adalah organisasi kepemudaan yang berkedudukan di Sangurejo, Turi, Sleman, Yogyakarta. Organisasi ini gerak bersama warga dalam berbagai kegiatan sosial dan lingkungan sekitar masyarakat Sangurejo.",
    facts: content.facts || [
      { label: "Nama", value: "GENSA" },
      { label: "Nama lengkap", value: "Generasi Sangurejo" },
      { label: "Lokasi", value: "Sangurejo, Turi, Sleman, Yogyakarta" },
      { label: "Jenis", value: "Organisasi kepemudaan" },
    ],
    image_url: content.image_url || "https://images.unsplash.com/photo-1533138175117-e7e6e339956e?q=80&w=1200&auto=format&fit=crop",
    image_alt: content.image_alt || "Foto ilustrasi kegiatan sosial masyarakat",
  };
}

export async function getRuangGerakCategories(): Promise<RuangGerakCategory[]> {
  const categories = await query<ProgramCategoryRow>(
    `SELECT * FROM program_categories WHERE is_published = 1 ORDER BY sort_order ASC, name ASC`
  );

  if (categories.length === 0) {
    return [
      {
        title: "Lingkungan",
        items: ["Pengumpulan sampah rutin di 5 titik"],
        accent_color: "bg-acid-lime",
        accent_text_color: "text-black",
      },
      {
        title: "Sosial & Kebersamaan",
        items: ["Gotong royong", "Perayaan kemerdekaan", "Takbir keliling"],
        accent_color: "bg-forest-green",
        accent_text_color: "text-warm-cream",
      },
      {
        title: "Koordinasi Organisasi",
        items: ["Rapat koordinasi bulanan", "Rapat antarwarga"],
        accent_color: "bg-orange",
        accent_text_color: "text-black",
      },
    ];
  }

  const result: RuangGerakCategory[] = [];

  for (const cat of categories) {
    const items = await query<ProgramItemRow>(
      `SELECT title FROM program_items WHERE category_id = ? ORDER BY sort_order ASC, title ASC`,
      [cat.id]
    );

    result.push({
      title: cat.name,
      items: items.map((i) => i.title),
      accent_color: cat.accent_color?.replace("#", "bg-") || "bg-forest-green",
      accent_text_color: cat.accent_text_color?.replace("#", "text-") || "text-warm-cream",
    });
  }

  return result;
}

export async function getCeritaData(): Promise<CeritaData> {
  const section = await queryOne<SectionRow>(
    `SELECT s.*, p.slug as page_slug FROM page_sections s
     JOIN pages p ON s.page_id = p.id
     WHERE p.slug = 'beranda' AND s.section_key = 'cerita' AND s.is_active = 1
     LIMIT 1`
  );

  return {
    title: section?.title || "Cerita & Dokumentasi",
    subtitle: "Dokumentasi Kegiatan",
    description: section?.description || "Foto ilustrasi sementara sebagai gambaran visual sebelum dokumentasi asli GENSA tersedia.",
  };
}

export async function getGalleryItems(): Promise<{ id: string; title: string; category: string | null; image_url: string; alt_text: string | null; caption: string | null; sort_order: number }[]> {
  const items = await query<GalleryItemRow>(
    `SELECT id, title, category, image_url, alt_text, caption, sort_order FROM gallery_items WHERE is_active = 1 ORDER BY sort_order ASC, created_at DESC`
  );

  if (items.length === 0) {
    return [
      {
        id: "galeri-01",
        title: "Bersama Warga",
        category: "Kegiatan Sosial",
        image_url: "https://images.unsplash.com/photo-1529285825808-19552ca229c2?q=80&w=1200&auto=format&fit=crop",
        alt_text: "Foto ilustrasi kegiatan sosial bersama warga",
        caption: "Kegiatan sosial bersama warga Sangurejo.",
        sort_order: 1,
      },
      {
        id: "galeri-02",
        title: "Bersih Bersih Lingkungan",
        category: "Pengumpulan Sampah",
        image_url: "https://images.unsplash.com/photo-1541712641044-9e9be57b3040?q=80&w=1200&auto=format&fit=crop",
        alt_text: "Foto ilustrasi kegiatan pembersihan lingkungan",
        caption: "Rutin pembersihan lingkungan di titik pengumpulan sampah.",
        sort_order: 2,
      },
      {
        id: "galeri-03",
        title: "Gotong Royong",
        category: "Kebersamaan",
        image_url: "https://images.unsplash.com/photo-1517486808923-7aca48c6cc34?q=80&w=1200&auto=format&fit=crop",
        alt_text: "Foto ilustrasi gotong royong warga",
        caption: "Gotong royong bersama warga setempat.",
        sort_order: 3,
      },
      {
        id: "galeri-04",
        title: "Rapat Koordinasi",
        category: "Organisasi",
        image_url: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=1200&auto=format&fit=crop",
        alt_text: "Foto ilustrasi rapat koordinasi anggota",
        caption: "Rapat koordinasi bulanan anggota GENSA.",
        sort_order: 4,
      },
      {
        id: "galeri-05",
        title: "Perayaan Kemerdekaan",
        category: "Kegiatan Sosial",
        image_url: "https://images.unsplash.com/photo-1533138175117-e7e6e339956e?q=80&w=1200&auto=format&fit=crop",
        alt_text: "Foto ilustrasi perayaan kemerdekaan",
        caption: "Perayaan Hari Kemerdekaan bersama warga.",
        sort_order: 5,
      },
      {
        id: "galeri-06",
        title: "Takbir Keliling",
        category: "Kegiatan Sosial",
        image_url: "https://images.unsplash.com/photo-1543343664-61a22989c33d?q=80&w=1200&auto=format&fit=crop",
        alt_text: "Foto ilustrasi takbir keliling",
        caption: "Gerakan takbir keliling di lingkungan warga.",
        sort_order: 6,
      },
    ];
  }

  return items;
}

export async function getContactData(): Promise<ContactData> {
  const contact = await queryOne<ContactSettingRow>("SELECT * FROM contact_settings LIMIT 1");
  const section = await queryOne<SectionRow>(
    `SELECT s.*, p.slug as page_slug FROM page_sections s
     JOIN pages p ON s.page_id = p.id
     WHERE p.slug = 'beranda' AND s.section_key = 'kontak' AND s.is_active = 1
     LIMIT 1`
  );

  return {
    title: section?.title || "Kontak",
    subtitle: "Temukan Kami",
    address: contact?.address || "Sangurejo, Turi, Sleman, Yogyakarta",
    location_description: contact?.location_description || null,
    whatsapp: contact?.whatsapp || null,
    email: contact?.email || null,
    instagram: contact?.instagram || null,
    facebook: contact?.facebook || null,
    twitter: contact?.twitter || null,
  };
}

export async function getFooterData(): Promise<FooterData> {
  const settings = await query<SiteSettingRow>("SELECT setting_key, setting_value FROM site_settings");
  const settingsMap = Object.fromEntries(settings.map((s) => [s.setting_key, s.setting_value]));
  const contact = await queryOne<ContactSettingRow>("SELECT * FROM contact_settings LIMIT 1");
  const navItems = await query<NavigationItemRow>("SELECT label, href FROM navigation_items WHERE location = 'footer' AND is_active = 1 ORDER BY sort_order ASC");

  return {
    site_title: settingsMap.site_title || "GENSA — Generasi Sangurejo",
    site_description: settingsMap.site_description || "Organisasi kepemudaan di Sangurejo, Turi, Sleman, Yogyakarta.",
    location: contact?.address || "Sangurejo, Turi, Sleman, Yogyakarta",
    nav_items: navItems.map((n) => ({ label: n.label, href: n.href })),
  };
}

export async function getNavigationItems(): Promise<NavigationItem[]> {
  const items = await query<NavigationItemRow>(
    `SELECT label, href, target_section, location FROM navigation_items WHERE location = 'navbar' AND is_active = 1 ORDER BY sort_order ASC`
  );

  if (items.length === 0) {
    return [
      { label: "Beranda", href: "#beranda", target_section: "home", location: "navbar" },
      { label: "Tentang GENSA", href: "#tentang", target_section: "tentang", location: "navbar" },
      { label: "Ruang Gerak", href: "#ruang-gerak", target_section: "ruang-gerak", location: "navbar" },
      { label: "Cerita & Dokumentasi", href: "#cerita", target_section: "cerita", location: "navbar" },
      { label: "Kontak", href: "#kontak", target_section: "kontak", location: "navbar" },
    ];
  }

  return items;
}

export async function getAnnouncementBar(): Promise<AnnouncementBarData | null> {
  const bar = await queryOne<AnnouncementBarRow>(
    `SELECT text FROM announcement_bars WHERE is_active = 1 ORDER BY sort_order ASC LIMIT 1`
  );
  return bar ? { text: bar.text } : null;
}

export async function getSiteSettings(): Promise<SiteSettingsData> {
  const settings = await query<SiteSettingRow>("SELECT setting_key, setting_value FROM site_settings");
  const settingsMap = Object.fromEntries(settings.map((s) => [s.setting_key, s.setting_value]));

  return {
    site_title: settingsMap.site_title || "GENSA — Generasi Sangurejo",
    site_description: settingsMap.site_description || "Organisasi kepemudaan di Sangurejo, Turi, Sleman, Yogyakarta.",
    site_locale: settingsMap.site_locale || "id_ID",
    og_image: settingsMap.og_image || "",
    favicon: settingsMap.favicon || "",
  };
}