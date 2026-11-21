import { hashToken } from "@/lib/auth";
import { getDatabasePool } from "@/lib/db";
import { AuthRepository } from "@/repositories/auth.repository";

export interface AdminSession {
  id: string;
  name: string;
  email: string;
  role: string;
}

export async function getAdminFromRequest(request: Request): Promise<AdminSession | null> {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const match = cookieHeader.match(/(?:^|; )gensa_session=([^;]+)/);
  const token = match ? match[1] : null;
  if (!token) {
    return null;
  }

  try {
    const tokenHash = hashToken(token);
    const pool = getDatabasePool();
    const [rows] = await pool.execute(
      "SELECT s.admin_id FROM admin_sessions s JOIN admin_users u ON s.admin_id = u.id WHERE s.token_hash = ? AND s.expires_at > CURRENT_TIMESTAMP AND u.is_active = TRUE LIMIT 1",
      [tokenHash]
    );
    const sessions = rows as { admin_id: string }[];
    if (sessions.length === 0) {
      return null;
    }

    const repository = new AuthRepository();
    const admin = await repository.findAdminById(sessions[0].admin_id);
    if (!admin || !admin.is_active) {
      return null;
    }

    return {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    };
  } catch {
    return null;
  }
}
