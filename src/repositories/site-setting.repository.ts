import { getDatabasePool } from "@/lib/db";
import type { Pool } from "mysql2/promise";

export interface SiteSetting {
  id: string;
  setting_key: string;
  setting_value: string | null;
  setting_type: string;
  updated_by: string | null;
  updated_at: Date;
}

export class SiteSettingRepository {
  private pool: Pool;

  constructor() {
    this.pool = getDatabasePool();
  }

  async findAll(): Promise<Record<string, string | null>> {
    const [rows] = await this.pool.execute(
      "SELECT setting_key, setting_value FROM site_settings"
    );
    const items = rows as SiteSetting[];
    const result: Record<string, string | null> = {};
    for (const item of items) {
      result[item.setting_key] = item.setting_value;
    }
    return result;
  }

  async findByKey(key: string): Promise<string | null> {
    const [rows] = await this.pool.execute(
      "SELECT setting_value FROM site_settings WHERE setting_key = ? LIMIT 1",
      [key]
    );
    const items = rows as { setting_value: string | null }[];
    return items.length > 0 ? items[0].setting_value : null;
  }

  async upsert(key: string, value: string | null, type: string = "text", updatedBy: string | null = null): Promise<void> {
    const existing = await this.findByKey(key);
    if (existing === null) {
      await this.pool.execute(
        "INSERT INTO site_settings (setting_key, setting_value, setting_type, updated_by) VALUES (?, ?, ?, ?)",
        [key, value, type, updatedBy]
      );
    } else {
      await this.pool.execute(
        "UPDATE site_settings SET setting_value = ?, setting_type = ?, updated_by = ?, updated_at = CURRENT_TIMESTAMP WHERE setting_key = ?",
        [value, type, updatedBy, key]
      );
    }
  }
}
