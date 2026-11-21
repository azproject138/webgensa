import { getDatabasePool } from "@/lib/db";
import type { Pool } from "mysql2/promise";

export interface ContactSetting {
  id: string;
  address: string;
  location_description: string | null;
  whatsapp: string | null;
  email: string | null;
  instagram: string | null;
  facebook: string | null;
  twitter: string | null;
  updated_by: string | null;
  created_at: Date;
  updated_at: Date;
}

export class ContactRepository {
  private pool: Pool;

  constructor() {
    this.pool = getDatabasePool();
  }

  async findOne(): Promise<ContactSetting | null> {
    const [rows] = await this.pool.execute(
      "SELECT id, address, location_description, whatsapp, email, instagram, facebook, twitter, updated_by, created_at, updated_at FROM contact_settings LIMIT 1"
    );
    const items = rows as ContactSetting[];
    return items.length > 0 ? items[0] : null;
  }

  async update(data: {
    address?: string;
    location_description?: string;
    whatsapp?: string;
    email?: string;
    instagram?: string;
    facebook?: string;
    twitter?: string;
    updated_by?: string;
  }): Promise<void> {
    const existing = await this.findOne();
    if (!existing) {
      throw new Error("Data kontak tidak ditemukan");
    }

    const fields: string[] = [];
    const values: (string | null)[] = [];
    if (data.address !== undefined) { fields.push("address = ?"); values.push(data.address); }
    if (data.location_description !== undefined) { fields.push("location_description = ?"); values.push(data.location_description); }
    if (data.whatsapp !== undefined) { fields.push("whatsapp = ?"); values.push(data.whatsapp); }
    if (data.email !== undefined) { fields.push("email = ?"); values.push(data.email); }
    if (data.instagram !== undefined) { fields.push("instagram = ?"); values.push(data.instagram); }
    if (data.facebook !== undefined) { fields.push("facebook = ?"); values.push(data.facebook); }
    if (data.twitter !== undefined) { fields.push("twitter = ?"); values.push(data.twitter); }
    if (data.updated_by !== undefined) { fields.push("updated_by = ?"); values.push(data.updated_by); }
    if (fields.length === 0) return;
    values.push(existing.id);
    await this.pool.execute(
      `UPDATE contact_settings SET ${fields.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      values
    );
  }
}
