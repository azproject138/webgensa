import { getDatabasePool } from "@/lib/db";
import type { Pool } from "mysql2/promise";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: string;
  is_active: boolean;
  last_login_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface AdminSession {
  id: string;
  admin_id: string;
  token_hash: string;
  expires_at: Date;
  created_at: Date;
  updated_at: Date;
}

export class AuthRepository {
  private pool: Pool;

  constructor() {
    this.pool = getDatabasePool();
  }

  async findAdminByEmail(email: string): Promise<AdminUser | null> {
    const [rows] = await this.pool.execute(
      "SELECT id, name, email, password_hash, role, is_active, last_login_at, created_at, updated_at FROM admin_users WHERE email = ? LIMIT 1",
      [email]
    );
    const users = rows as AdminUser[];
    return users.length > 0 ? users[0] : null;
  }

  async findAdminById(id: string): Promise<AdminUser | null> {
    const [rows] = await this.pool.execute(
      "SELECT id, name, email, password_hash, role, is_active, last_login_at, created_at, updated_at FROM admin_users WHERE id = ? LIMIT 1",
      [id]
    );
    const users = rows as AdminUser[];
    return users.length > 0 ? users[0] : null;
  }

  async updateLastLogin(adminId: string): Promise<void> {
    await this.pool.execute(
      "UPDATE admin_users SET last_login_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [adminId]
    );
  }

  async createSession(adminId: string, tokenHash: string, expiresAt: Date): Promise<string> {
    const id = crypto.randomUUID();
    await this.pool.execute(
      "INSERT INTO admin_sessions (id, admin_id, token_hash, expires_at) VALUES (?, ?, ?, ?)",
      [id, adminId, tokenHash, expiresAt]
    );
    return id;
  }

  async findValidSession(tokenHash: string): Promise<AdminSession | null> {
    const [rows] = await this.pool.execute(
      "SELECT id, admin_id, token_hash, expires_at, created_at, updated_at FROM admin_sessions WHERE token_hash = ? AND expires_at > CURRENT_TIMESTAMP LIMIT 1",
      [tokenHash]
    );
    const sessions = rows as AdminSession[];
    return sessions.length > 0 ? sessions[0] : null;
  }

  async deleteSession(tokenHash: string): Promise<void> {
    await this.pool.execute(
      "DELETE FROM admin_sessions WHERE token_hash = ?",
      [tokenHash]
    );
  }

  async deleteAllSessionsForAdmin(adminId: string): Promise<void> {
    await this.pool.execute(
      "DELETE FROM admin_sessions WHERE admin_id = ?",
      [adminId]
    );
  }

  async deleteExpiredSessions(): Promise<void> {
    await this.pool.execute(
      "DELETE FROM admin_sessions WHERE expires_at <= CURRENT_TIMESTAMP"
    );
  }

  async adminExists(email: string): Promise<boolean> {
    const [rows] = await this.pool.execute(
      "SELECT id FROM admin_users WHERE email = ? LIMIT 1",
      [email]
    );
    const users = rows as { id: string }[];
    return users.length > 0;
  }

  async adminCount(): Promise<number> {
    const [rows] = await this.pool.execute("SELECT COUNT(*) as count FROM admin_users");
    const result = rows as { count: number }[];
    return result[0]?.count ?? 0;
  }

  async createAdmin(
    id: string,
    name: string,
    email: string,
    passwordHash: string,
    role: string
  ): Promise<void> {
    await this.pool.execute(
      "INSERT INTO admin_users (id, name, email, password_hash, role, is_active) VALUES (?, ?, ?, ?, ?, TRUE)",
      [id, name, email, passwordHash, role]
    );
  }

  async updatePassword(adminId: string, passwordHash: string): Promise<void> {
    await this.pool.execute(
      "UPDATE admin_users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [passwordHash, adminId]
    );
  }
}

import crypto from "crypto";
