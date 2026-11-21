import { getDatabasePool } from "@/lib/db";
import type { Pool } from "mysql2/promise";

export interface GalleryItem {
  id: string;
  title: string;
  category: string | null;
  image_url: string;
  alt_text: string | null;
  caption: string | null;
  sort_order: number;
  is_active: boolean;
  is_placeholder: boolean;
  media_id: string | null;
  uploaded_by: string | null;
  created_at: Date;
  updated_at: Date;
}

export class GalleryRepository {
  private pool: Pool;

  constructor() {
    this.pool = getDatabasePool();
  }

  async findAll(options: { search?: string; category?: string; page?: number; limit?: number } = {}): Promise<{ items: GalleryItem[]; total: number }> {
    const search = options.search ?? "";
    const category = options.category ?? "";
    const page = Math.max(options.page ?? 1, 1);
    const limit = Math.max(options.limit ?? 10, 1);
    const offset = (page - 1) * limit;

    const conditions: string[] = [];
    const values: (string | number)[] = [];

    if (search) {
      conditions.push("(title LIKE ? OR caption LIKE ?)");
      values.push(`%${search}%`, `%${search}%`);
    }
    if (category) {
      conditions.push("category = ?");
      values.push(category);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const [rows] = await this.pool.execute(
      `SELECT id, title, category, image_url, alt_text, caption, sort_order, is_active, is_placeholder, media_id, uploaded_by, created_at, updated_at FROM gallery_items ${where} ORDER BY sort_order ASC, created_at DESC LIMIT ? OFFSET ?`,
      [...values, limit, offset]
    );
    const items = rows as GalleryItem[];

    const [countRows] = await this.pool.execute(
      `SELECT COUNT(*) as total FROM gallery_items ${where}`,
      values
    );
    const total = (countRows as { total: number }[])[0]?.total ?? 0;

    return { items, total };
  }

  async findById(id: string): Promise<GalleryItem | null> {
    const [rows] = await this.pool.execute(
      "SELECT id, title, category, image_url, alt_text, caption, sort_order, is_active, is_placeholder, media_id, uploaded_by, created_at, updated_at FROM gallery_items WHERE id = ? LIMIT 1",
      [id]
    );
    const items = rows as GalleryItem[];
    return items.length > 0 ? items[0] : null;
  }

  async findCategories(): Promise<string[]> {
    const [rows] = await this.pool.execute("SELECT DISTINCT category FROM gallery_items WHERE category IS NOT NULL AND category <> '' ORDER BY category ASC");
    return (rows as { category: string }[]).map((r) => r.category);
  }

  async create(data: {
    title: string;
    category?: string;
    image_url: string;
    alt_text?: string;
    caption?: string;
    sort_order?: number;
    is_active?: boolean;
    is_placeholder?: boolean;
    uploaded_by?: string;
  }): Promise<string> {
    const id = crypto.randomUUID();
    await this.pool.execute(
      `INSERT INTO gallery_items (id, title, category, image_url, alt_text, caption, sort_order, is_active, is_placeholder, uploaded_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, data.title, data.category ?? null, data.image_url, data.alt_text ?? null, data.caption ?? null, data.sort_order ?? 0, data.is_active ?? true, data.is_placeholder ?? false, data.uploaded_by ?? null]
    );
    return id;
  }

  async update(id: string, data: {
    title?: string;
    category?: string;
    image_url?: string;
    alt_text?: string;
    caption?: string;
    sort_order?: number;
    is_active?: boolean;
  }): Promise<void> {
    const fields: string[] = [];
    const values: (string | number | boolean)[] = [];
    if (data.title !== undefined) { fields.push("title = ?"); values.push(data.title); }
    if (data.category !== undefined) { fields.push("category = ?"); values.push(data.category); }
    if (data.image_url !== undefined) { fields.push("image_url = ?"); values.push(data.image_url); }
    if (data.alt_text !== undefined) { fields.push("alt_text = ?"); values.push(data.alt_text); }
    if (data.caption !== undefined) { fields.push("caption = ?"); values.push(data.caption); }
    if (data.sort_order !== undefined) { fields.push("sort_order = ?"); values.push(data.sort_order); }
    if (data.is_active !== undefined) { fields.push("is_active = ?"); values.push(data.is_active ? 1 : 0); }
    if (fields.length === 0) return;
    values.push(id);
    await this.pool.execute(
      `UPDATE gallery_items SET ${fields.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      values
    );
  }

  async delete(id: string): Promise<void> {
    await this.pool.execute("DELETE FROM gallery_items WHERE id = ?", [id]);
  }
}

import crypto from "crypto";
