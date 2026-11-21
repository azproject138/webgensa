import { getDatabasePool } from "@/lib/db";

export interface PostDetail {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  thumbnail_url: string | null;
  category: string | null;
  published_at: string | null;
  status: string;
  seo_title: string | null;
  seo_description: string | null;
  author_id: string | null;
  created_at: string;
  updated_at: string;
}

async function query<T>(sql: string, params: (string | number)[] = []): Promise<T[]> {
  const pool = getDatabasePool();
  const [rows] = await pool.execute(sql, params);
  return rows as T[];
}

export async function getPostForDetail(slug: string): Promise<PostDetail | null> {
  const posts = await query<PostDetail>(
    `SELECT id, title, slug, excerpt, content, thumbnail_url, category, published_at, status, seo_title, seo_description, author_id, created_at, updated_at FROM posts WHERE slug = ? AND status = 'published' LIMIT 1`,
    [slug]
  );
  return posts.length > 0 ? posts[0] : null;
}

export async function getPostsForSitemap(): Promise<{ slug: string; updated_at: string }[]> {
  return query<{ slug: string; updated_at: string }>(
    `SELECT slug, updated_at FROM posts WHERE status = 'published' ORDER BY updated_at DESC`
  );
}

export async function getSiteSettings(): Promise<{
  site_title: string;
  site_description: string;
  site_locale: string;
  og_image: string;
  favicon: string;
}> {
  const settings = await query<{ setting_key: string; setting_value: string }>(
    `SELECT setting_key, setting_value FROM site_settings`
  );
  const settingsMap = Object.fromEntries(settings.map((s) => [s.setting_key, s.setting_value]));

  return {
    site_title: settingsMap.site_title || "GENSA — Generasi Sangurejo",
    site_description: settingsMap.site_description || "Organisasi kepemudaan di Sangurejo, Turi, Sleman, Yogyakarta.",
    site_locale: settingsMap.site_locale || "id_ID",
    og_image: settingsMap.og_image || "",
    favicon: settingsMap.favicon || "",
  };
}