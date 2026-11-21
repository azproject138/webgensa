import { getDatabasePool } from "@/lib/db";
import type { Pool } from "mysql2/promise";

export interface AnnouncementBar {
  id: string;
  text: string;
  is_active: boolean;
  sort_order: number;
  created_at: Date;
  updated_at: Date;
}

export class AnnouncementRepository {
  private pool: Pool;

  constructor() {
    this.pool = getDatabasePool();
  }

  async findAll(): Promise<AnnouncementBar[]> {
    const [rows] = await this.pool.execute(
      "SELECT id, text, is_active, sort_order, created_at, updated_at FROM announcement_bars ORDER BY sort_order ASC"
    );
    return rows as AnnouncementBar[];
  }

  async findById(id: string): Promise<AnnouncementBar | null> {
    const [rows] = await this.pool.execute(
      "SELECT id, text, is_active, sort_order, created_at, updated_at FROM announcement_bars WHERE id = ? LIMIT 1",
      [id]
    );
    const items = rows as AnnouncementBar[];
    return items.length > 0 ? items[0] : null;
  }

  async create(data: { text: string; is_active?: boolean; sort_order?: number }): Promise<string> {
    const id = crypto.randomUUID();
    await this.pool.execute(
      "INSERT INTO announcement_bars (id, text, is_active, sort_order) VALUES (?, ?, ?, ?)",
      [id, data.text, data.is_active ?? true, data.sort_order ?? 0]
    );
    return id;
  }

  async update(id: string, data: { text?: string; is_active?: boolean; sort_order?: number }): Promise<void> {
    const fields: string[] = [];
    const values: (string | number | boolean)[] = [];
    if (data.text !== undefined) { fields.push("text = ?"); values.push(data.text); }
    if (data.is_active !== undefined) { fields.push("is_active = ?"); values.push(data.is_active ? 1 : 0); }
    if (data.sort_order !== undefined) { fields.push("sort_order = ?"); values.push(data.sort_order); }
    if (fields.length === 0) return;
    values.push(id);
    await this.pool.execute(
      `UPDATE announcement_bars SET ${fields.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      values
    );
  }

  async delete(id: string): Promise<void> {
    await this.pool.execute("DELETE FROM announcement_bars WHERE id = ?", [id]);
  }
}

import crypto from "crypto";
