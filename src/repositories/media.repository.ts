import { getDatabasePool } from "@/lib/db";
import type { Pool } from "mysql2/promise";

export interface MediaItem {
  id: string;
  original_name: string;
  file_name: string;
  file_path: string;
  file_url: string;
  mime_type: string;
  file_size: number;
  width: number | null;
  height: number | null;
  uploaded_by: string | null;
  created_at: Date;
}

export interface MediaListOptions {
  search?: string;
  page?: number;
  limit?: number;
}

export class MediaRepository {
  private pool: Pool;

  constructor() {
    this.pool = getDatabasePool();
  }

  async findAll(options: MediaListOptions = {}): Promise<{ items: MediaItem[]; total: number }> {
    const search = options.search ?? "";
    const page = Math.max(options.page ?? 1, 1);
    const limit = Math.max(options.limit ?? 20, 1);
    const offset = (page - 1) * limit;

    const conditions: string[] = [];
    const values: (string | number)[] = [];

    if (search) {
      conditions.push("(original_name LIKE ? OR file_name LIKE ?)");
      values.push(`%${search}%`, `%${search}%`);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const [rows] = await this.pool.execute(
      `SELECT id, original_name, file_name, file_path, file_url, mime_type, file_size, width, height, uploaded_by, created_at FROM media ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...values, limit, offset]
    );
    const items = rows as MediaItem[];

    const [countRows] = await this.pool.execute(
      `SELECT COUNT(*) as total FROM media ${where}`,
      values
    );
    const total = (countRows as { total: number }[])[0]?.total ?? 0;

    return { items, total };
  }

  async findById(id: string): Promise<MediaItem | null> {
    const [rows] = await this.pool.execute(
      "SELECT id, original_name, file_name, file_path, file_url, mime_type, file_size, width, height, uploaded_by, created_at FROM media WHERE id = ? LIMIT 1",
      [id]
    );
    const items = rows as MediaItem[];
    return items.length > 0 ? items[0] : null;
  }

  async create(data: {
    original_name: string;
    file_name: string;
    file_path: string;
    file_url: string;
    mime_type: string;
    file_size: number;
    width?: number;
    height?: number;
    uploaded_by?: string;
  }): Promise<string> {
    const id = crypto.randomUUID();
    await this.pool.execute(
      `INSERT INTO media (id, original_name, file_name, file_path, file_url, mime_type, file_size, width, height, uploaded_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, data.original_name, data.file_name, data.file_path, data.file_url, data.mime_type, data.file_size, data.width ?? null, data.height ?? null, data.uploaded_by ?? null]
    );
    return id;
  }

  async delete(id: string): Promise<void> {
    await this.pool.execute("DELETE FROM media WHERE id = ?", [id]);
  }

  async findByIds(ids: string[]): Promise<MediaItem[]> {
    if (ids.length === 0) return [];
    const placeholders = ids.map(() => "?").join(",");
    const [rows] = await this.pool.execute(
      `SELECT id, original_name, file_name, file_path, file_url, mime_type, file_size, width, height, uploaded_by, created_at FROM media WHERE id IN (${placeholders})`,
      ids
    );
    return rows as MediaItem[];
  }

  async findByFileUrl(fileUrl: string): Promise<MediaItem | null> {
    const [rows] = await this.pool.execute(
      "SELECT id, original_name, file_name, file_path, file_url, mime_type, file_size, width, height, uploaded_by, created_at FROM media WHERE file_url = ? LIMIT 1",
      [fileUrl]
    );
    const items = rows as MediaItem[];
    return items.length > 0 ? items[0] : null;
  }
}

import crypto from "crypto";