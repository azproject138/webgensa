import { getDatabasePool } from "@/lib/db";
import type { Pool } from "mysql2/promise";

export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  target_section: string | null;
  location: string;
  sort_order: number;
  is_active: boolean;
  updated_by: string | null;
  created_at: Date;
  updated_at: Date;
}

export class NavigationRepository {
  private pool: Pool;

  constructor() {
    this.pool = getDatabasePool();
  }

  async findAll(options: { location?: string; search?: string } = {}): Promise<NavigationItem[]> {
    const location = options.location ?? "";
    const search = options.search ?? "";

    const conditions: string[] = [];
    const values: string[] = [];

    if (location) {
      conditions.push("location = ?");
      values.push(location);
    }
    if (search) {
      conditions.push("(label LIKE ? OR href LIKE ?)");
      values.push(`%${search}%`, `%${search}%`);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const [rows] = await this.pool.execute(
      `SELECT id, label, href, target_section, location, sort_order, is_active, updated_by, created_at, updated_at FROM navigation_items ${where} ORDER BY location ASC, sort_order ASC, label ASC`,
      values
    );
    return rows as NavigationItem[];
  }

  async findById(id: string): Promise<NavigationItem | null> {
    const [rows] = await this.pool.execute(
      "SELECT id, label, href, target_section, location, sort_order, is_active, updated_by, created_at, updated_at FROM navigation_items WHERE id = ? LIMIT 1",
      [id]
    );
    const items = rows as NavigationItem[];
    return items.length > 0 ? items[0] : null;
  }

  async findByLocation(location: string): Promise<NavigationItem[]> {
    return this.findAll({ location });
  }

  async create(data: {
    label: string;
    href: string;
    target_section?: string;
    location?: string;
    sort_order?: number;
    is_active?: boolean;
    updated_by?: string;
  }): Promise<string> {
    const id = crypto.randomUUID();
    await this.pool.execute(
      `INSERT INTO navigation_items (id, label, href, target_section, location, sort_order, is_active, updated_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, data.label, data.href, data.target_section ?? null, data.location ?? "navbar", data.sort_order ?? 0, data.is_active ?? true, data.updated_by ?? null]
    );
    return id;
  }

  async update(id: string, data: {
    label?: string;
    href?: string;
    target_section?: string;
    location?: string;
    sort_order?: number;
    is_active?: boolean;
    updated_by?: string;
  }): Promise<void> {
    const fields: string[] = [];
    const values: (string | number | boolean)[] = [];
    if (data.label !== undefined) { fields.push("label = ?"); values.push(data.label); }
    if (data.href !== undefined) { fields.push("href = ?"); values.push(data.href); }
    if (data.target_section !== undefined) { fields.push("target_section = ?"); values.push(data.target_section); }
    if (data.location !== undefined) { fields.push("location = ?"); values.push(data.location); }
    if (data.sort_order !== undefined) { fields.push("sort_order = ?"); values.push(data.sort_order); }
    if (data.is_active !== undefined) { fields.push("is_active = ?"); values.push(data.is_active ? 1 : 0); }
    if (data.updated_by !== undefined) { fields.push("updated_by = ?"); values.push(data.updated_by); }
    if (fields.length === 0) return;
    values.push(id);
    await this.pool.execute(
      `UPDATE navigation_items SET ${fields.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      values
    );
  }

  async delete(id: string): Promise<void> {
    await this.pool.execute("DELETE FROM navigation_items WHERE id = ?", [id]);
  }
}

import crypto from "crypto";
