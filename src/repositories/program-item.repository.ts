import { getDatabasePool } from "@/lib/db";
import type { Pool } from "mysql2/promise";

export interface ProgramItem {
  id: string;
  category_id: string;
  title: string;
  sort_order: number;
}

export class ProgramItemRepository {
  private pool: Pool;

  constructor() {
    this.pool = getDatabasePool();
  }

  async findByCategory(categoryId: string): Promise<ProgramItem[]> {
    const [rows] = await this.pool.execute(
      "SELECT id, category_id, title, sort_order FROM program_items WHERE category_id = ? ORDER BY sort_order ASC, title ASC",
      [categoryId]
    );
    return rows as ProgramItem[];
  }

  async findById(id: string): Promise<ProgramItem | null> {
    const [rows] = await this.pool.execute(
      "SELECT id, category_id, title, sort_order FROM program_items WHERE id = ? LIMIT 1",
      [id]
    );
    const items = rows as ProgramItem[];
    return items.length > 0 ? items[0] : null;
  }

  async create(data: { category_id: string; title: string; sort_order?: number }): Promise<string> {
    const id = crypto.randomUUID();
    await this.pool.execute(
      "INSERT INTO program_items (id, category_id, title, sort_order) VALUES (?, ?, ?, ?)",
      [id, data.category_id, data.title, data.sort_order ?? 0]
    );
    return id;
  }

  async update(id: string, data: { category_id?: string; title?: string; sort_order?: number }): Promise<void> {
    const fields: string[] = [];
    const values: (string | number)[] = [];
    if (data.category_id !== undefined) { fields.push("category_id = ?"); values.push(data.category_id); }
    if (data.title !== undefined) { fields.push("title = ?"); values.push(data.title); }
    if (data.sort_order !== undefined) { fields.push("sort_order = ?"); values.push(data.sort_order); }
    if (fields.length === 0) return;
    values.push(id);
    await this.pool.execute(
      `UPDATE program_items SET ${fields.join(", ")} WHERE id = ?`,
      values
    );
  }

  async delete(id: string): Promise<void> {
    await this.pool.execute("DELETE FROM program_items WHERE id = ?", [id]);
  }
}

import crypto from "crypto";
