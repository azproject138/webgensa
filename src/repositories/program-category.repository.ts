import { getDatabasePool } from "@/lib/db";
import type { Pool } from "mysql2/promise";

export interface ProgramCategory {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  accent_color: string | null;
  accent_text_color: string | null;
  sort_order: number;
  is_published: boolean;
  created_at: Date;
  updated_at: Date;
}

export class ProgramCategoryRepository {
  private pool: Pool;

  constructor() {
    this.pool = getDatabasePool();
  }

  async findAll(): Promise<ProgramCategory[]> {
    const [rows] = await this.pool.execute(
      "SELECT id, name, description, image_url, accent_color, accent_text_color, sort_order, is_published, created_at, updated_at FROM program_categories ORDER BY sort_order ASC, name ASC"
    );
    return rows as ProgramCategory[];
  }

  async findPublished(): Promise<ProgramCategory[]> {
    const [rows] = await this.pool.execute(
      "SELECT id, name, description, image_url, accent_color, accent_text_color, sort_order, is_published, created_at, updated_at FROM program_categories WHERE is_published = 1 ORDER BY sort_order ASC, name ASC"
    );
    return rows as ProgramCategory[];
  }

  async findById(id: string): Promise<ProgramCategory | null> {
    const [rows] = await this.pool.execute(
      "SELECT id, name, description, image_url, accent_color, accent_text_color, sort_order, is_published, created_at, updated_at FROM program_categories WHERE id = ? LIMIT 1",
      [id]
    );
    const items = rows as ProgramCategory[];
    return items.length > 0 ? items[0] : null;
  }

  async findByName(name: string): Promise<ProgramCategory | null> {
    const [rows] = await this.pool.execute(
      "SELECT id, name, description, image_url, accent_color, accent_text_color, sort_order, is_published, created_at, updated_at FROM program_categories WHERE name = ? LIMIT 1",
      [name]
    );
    const items = rows as ProgramCategory[];
    return items.length > 0 ? items[0] : null;
  }

  async create(data: {
    name: string;
    description?: string;
    image_url?: string;
    accent_color?: string;
    accent_text_color?: string;
    sort_order?: number;
    is_published?: boolean;
  }): Promise<string> {
    const id = crypto.randomUUID();
    await this.pool.execute(
      `INSERT INTO program_categories (id, name, description, image_url, accent_color, accent_text_color, sort_order, is_published)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, data.name, data.description ?? null, data.image_url ?? null, data.accent_color ?? "#193B2D", data.accent_text_color ?? "#F3EBDD", data.sort_order ?? 0, data.is_published ?? true]
    );
    return id;
  }

  async update(id: string, data: {
    name?: string;
    description?: string;
    image_url?: string;
    accent_color?: string;
    accent_text_color?: string;
    sort_order?: number;
    is_published?: boolean;
  }): Promise<void> {
    const fields: string[] = [];
    const values: (string | number | boolean)[] = [];
    if (data.name !== undefined) { fields.push("name = ?"); values.push(data.name); }
    if (data.description !== undefined) { fields.push("description = ?"); values.push(data.description); }
    if (data.image_url !== undefined) { fields.push("image_url = ?"); values.push(data.image_url); }
    if (data.accent_color !== undefined) { fields.push("accent_color = ?"); values.push(data.accent_color); }
    if (data.accent_text_color !== undefined) { fields.push("accent_text_color = ?"); values.push(data.accent_text_color); }
    if (data.sort_order !== undefined) { fields.push("sort_order = ?"); values.push(data.sort_order); }
    if (data.is_published !== undefined) { fields.push("is_published = ?"); values.push(data.is_published ? 1 : 0); }
    if (fields.length === 0) return;
    values.push(id);
    await this.pool.execute(
      `UPDATE program_categories SET ${fields.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      values
    );
  }

  async delete(id: string): Promise<void> {
    await this.pool.execute("DELETE FROM program_categories WHERE id = ?", [id]);
  }
}

import crypto from "crypto";
