import { getDatabasePool } from "@/lib/db";
import type { Pool } from "mysql2/promise";

export interface Page {
  id: number;
  slug: string;
  title: string;
  content: string;
  created_at: Date;
  updated_at: Date;
}

export class PageRepository {
  private pool: Pool;

  constructor() {
    this.pool = getDatabasePool();
  }

  async findAll(): Promise<Page[]> {
    const [rows] = await this.pool.execute(
      "SELECT id, slug, title, content, created_at, updated_at FROM pages ORDER BY id ASC"
    );
    return rows as Page[];
  }

  async findById(id: number): Promise<Page | null> {
    const [rows] = await this.pool.execute(
      "SELECT id, slug, title, content, created_at, updated_at FROM pages WHERE id = ? LIMIT 1",
      [id]
    );
    const items = rows as Page[];
    return items.length > 0 ? items[0] : null;
  }

  async findBySlug(slug: string): Promise<Page | null> {
    const [rows] = await this.pool.execute(
      "SELECT id, slug, title, content, created_at, updated_at FROM pages WHERE slug = ? LIMIT 1",
      [slug]
    );
    const items = rows as Page[];
    return items.length > 0 ? items[0] : null;
  }

  async create(slug: string, title: string, content: string): Promise<number> {
    const [result] = await this.pool.execute(
      "INSERT INTO pages (slug, title, content) VALUES (?, ?, ?)",
      [slug, title, content]
    );
    return (result as { insertId: number }).insertId;
  }

  async update(id: number, data: { slug?: string; title?: string; content?: string }): Promise<void> {
    const fields: string[] = [];
    const values: (string | number)[] = [];
    if (data.slug !== undefined) { fields.push("slug = ?"); values.push(data.slug); }
    if (data.title !== undefined) { fields.push("title = ?"); values.push(data.title); }
    if (data.content !== undefined) { fields.push("content = ?"); values.push(data.content); }
    if (fields.length === 0) return;
    values.push(id);
    await this.pool.execute(
      `UPDATE pages SET ${fields.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      values
    );
  }

  async delete(id: number): Promise<void> {
    await this.pool.execute("DELETE FROM pages WHERE id = ?", [id]);
  }
}
