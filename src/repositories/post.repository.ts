import { getDatabasePool } from "@/lib/db";
import type { Pool } from "mysql2/promise";

export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  thumbnail_url: string | null;
  category: string | null;
  published_at: Date | null;
  status: "draft" | "published" | "archived";
  seo_title: string | null;
  seo_description: string | null;
  author_id: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface PostListItem {
  id: string;
  title: string;
  slug: string;
  status: string;
  category: string | null;
  created_at: Date;
  updated_at: Date;
}

export class PostRepository {
  private pool: Pool;

  constructor() {
    this.pool = getDatabasePool();
  }

  async findAll(options: { search?: string; status?: string; page?: number; limit?: number } = {}): Promise<{ posts: PostListItem[]; total: number }> {
    const search = options.search ?? "";
    const status = options.status ?? "";
    const page = Math.max(options.page ?? 1, 1);
    const limit = Math.max(options.limit ?? 10, 1);
    const offset = (page - 1) * limit;

    const conditions: string[] = [];
    const values: (string | number)[] = [];

    if (search) {
      conditions.push("(title LIKE ? OR slug LIKE ? OR content LIKE ?)");
      values.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (status) {
      conditions.push("status = ?");
      values.push(status);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const [rows] = await this.pool.execute(
      `SELECT id, title, slug, status, category, created_at, updated_at FROM posts ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...values, limit, offset]
    );
    const posts = rows as PostListItem[];

    const [countRows] = await this.pool.execute(
      `SELECT COUNT(*) as total FROM posts ${where}`,
      values
    );
    const total = (countRows as { total: number }[])[0]?.total ?? 0;

    return { posts, total };
  }

  async findById(id: string): Promise<Post | null> {
    const [rows] = await this.pool.execute(
      "SELECT id, title, slug, excerpt, content, thumbnail_url, category, published_at, status, seo_title, seo_description, author_id, created_at, updated_at FROM posts WHERE id = ? LIMIT 1",
      [id]
    );
    const items = rows as Post[];
    return items.length > 0 ? items[0] : null;
  }

  async findBySlug(slug: string): Promise<Post | null> {
    const [rows] = await this.pool.execute(
      "SELECT id, title, slug, excerpt, content, thumbnail_url, category, published_at, status, seo_title, seo_description, author_id, created_at, updated_at FROM posts WHERE slug = ? LIMIT 1",
      [slug]
    );
    const items = rows as Post[];
    return items.length > 0 ? items[0] : null;
  }

  async slugExists(slug: string, excludeId?: string): Promise<boolean> {
    if (excludeId) {
      const [rows] = await this.pool.execute(
        "SELECT id FROM posts WHERE slug = ? AND id <> ? LIMIT 1",
        [slug, excludeId]
      );
      const items = rows as { id: string }[];
      return items.length > 0;
    }
    const [rows] = await this.pool.execute(
      "SELECT id FROM posts WHERE slug = ? LIMIT 1",
      [slug]
    );
    const items = rows as { id: string }[];
    return items.length > 0;
  }

  async create(data: {
    title: string;
    slug: string;
    excerpt?: string;
    content: string;
    thumbnail_url?: string;
    category?: string;
    status?: "draft" | "published" | "archived";
    seo_title?: string;
    seo_description?: string;
    author_id?: string;
  }): Promise<string> {
    const id = crypto.randomUUID();
    const status = data.status ?? "draft";
    const publishedAt = status === "published" ? new Date() : null;
    await this.pool.execute(
      `INSERT INTO posts (id, title, slug, excerpt, content, thumbnail_url, category, published_at, status, seo_title, seo_description, author_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, data.title, data.slug, data.excerpt ?? null, data.content, data.thumbnail_url ?? null, data.category ?? null, publishedAt, status, data.seo_title ?? null, data.seo_description ?? null, data.author_id ?? null]
    );
    return id;
  }

  async update(id: string, data: {
    title?: string;
    slug?: string;
    excerpt?: string;
    content?: string;
    thumbnail_url?: string;
    category?: string;
    status?: "draft" | "published" | "archived";
    seo_title?: string;
    seo_description?: string;
  }): Promise<void> {
    const fields: string[] = [];
    const values: (string | null)[] = [];
    if (data.title !== undefined) { fields.push("title = ?"); values.push(data.title); }
    if (data.slug !== undefined) { fields.push("slug = ?"); values.push(data.slug); }
    if (data.excerpt !== undefined) { fields.push("excerpt = ?"); values.push(data.excerpt); }
    if (data.content !== undefined) { fields.push("content = ?"); values.push(data.content); }
    if (data.thumbnail_url !== undefined) { fields.push("thumbnail_url = ?"); values.push(data.thumbnail_url); }
    if (data.category !== undefined) { fields.push("category = ?"); values.push(data.category); }
    if (data.status !== undefined) {
      fields.push("status = ?");
      values.push(data.status);
      if (data.status === "published") {
        fields.push("published_at = CURRENT_TIMESTAMP");
      } else if (data.status === "draft") {
        fields.push("published_at = NULL");
      }
    }
    if (data.seo_title !== undefined) { fields.push("seo_title = ?"); values.push(data.seo_title); }
    if (data.seo_description !== undefined) { fields.push("seo_description = ?"); values.push(data.seo_description); }
    if (fields.length === 0) return;
    values.push(id);
    await this.pool.execute(
      `UPDATE posts SET ${fields.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      values
    );
  }

  async delete(id: string): Promise<void> {
    await this.pool.execute("DELETE FROM posts WHERE id = ?", [id]);
  }
}

import crypto from "crypto";
