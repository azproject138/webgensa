import { getDatabasePool } from "@/lib/db";
import type { Pool } from "mysql2/promise";

export interface PageSection {
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
}

export class PageSectionRepository {
  private pool: Pool;

  constructor() {
    this.pool = getDatabasePool();
  }

  async findByPage(pageId: number): Promise<PageSection[]> {
    const [rows] = await this.pool.execute(
      "SELECT id, page_id, section_key, section_type, title, description, content, sort_order, is_active, created_at, updated_at FROM page_sections WHERE page_id = ? ORDER BY sort_order ASC",
      [pageId]
    );
    return rows as PageSection[];
  }

  async findById(id: string): Promise<PageSection | null> {
    const [rows] = await this.pool.execute(
      "SELECT id, page_id, section_key, section_type, title, description, content, sort_order, is_active, created_at, updated_at FROM page_sections WHERE id = ? LIMIT 1",
      [id]
    );
    const items = rows as PageSection[];
    return items.length > 0 ? items[0] : null;
  }

  async findBySectionKey(pageId: number, sectionKey: string): Promise<PageSection | null> {
    const [rows] = await this.pool.execute(
      "SELECT id, page_id, section_key, section_type, title, description, content, sort_order, is_active, created_at, updated_at FROM page_sections WHERE page_id = ? AND section_key = ? LIMIT 1",
      [pageId, sectionKey]
    );
    const items = rows as PageSection[];
    return items.length > 0 ? items[0] : null;
  }

  async create(data: {
    page_id: number;
    section_key: string;
    section_type: string;
    title?: string;
    description?: string;
    content?: string;
    sort_order?: number;
    is_active?: boolean;
  }): Promise<string> {
    const id = crypto.randomUUID();
    await this.pool.execute(
      `INSERT INTO page_sections (id, page_id, section_key, section_type, title, description, content, sort_order, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, data.page_id, data.section_key, data.section_type, data.title ?? null, data.description ?? null, data.content ?? null, data.sort_order ?? 0, data.is_active ?? true]
    );
    return id;
  }

  async update(id: string, data: {
    section_key?: string;
    section_type?: string;
    title?: string;
    description?: string;
    content?: string;
    sort_order?: number;
    is_active?: boolean;
  }): Promise<void> {
    const fields: string[] = [];
    const values: (string | number | boolean)[] = [];
    if (data.section_key !== undefined) { fields.push("section_key = ?"); values.push(data.section_key); }
    if (data.section_type !== undefined) { fields.push("section_type = ?"); values.push(data.section_type); }
    if (data.title !== undefined) { fields.push("title = ?"); values.push(data.title); }
    if (data.description !== undefined) { fields.push("description = ?"); values.push(data.description); }
    if (data.content !== undefined) { fields.push("content = ?"); values.push(data.content); }
    if (data.sort_order !== undefined) { fields.push("sort_order = ?"); values.push(data.sort_order); }
    if (data.is_active !== undefined) { fields.push("is_active = ?"); values.push(data.is_active ? 1 : 0); }
    if (fields.length === 0) return;
    values.push(id);
    await this.pool.execute(
      `UPDATE page_sections SET ${fields.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      values
    );
  }

  async delete(id: string): Promise<void> {
    await this.pool.execute("DELETE FROM page_sections WHERE id = ?", [id]);
  }
}

import crypto from "crypto";
