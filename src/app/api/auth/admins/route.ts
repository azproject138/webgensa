import { NextRequest, NextResponse } from "next/server";
import { getAdminFromRequest } from "@/lib/session";
import { getDatabasePool } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const admin = await getAdminFromRequest(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (admin.role !== "super_admin") {
      return NextResponse.json({ error: "Hanya super_admin yang dapat mengakses" }, { status: 403 });
    }

    const pool = getDatabasePool();
    const [rows] = await pool.execute(
      `SELECT id, name, email, role, is_active, last_login_at, created_at FROM admin_users ORDER BY created_at DESC`
    );

    return NextResponse.json({
      success: true,
      admins: rows,
    });
  } catch (error) {
    console.error("[Auth Admins] Error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan pada server" }, { status: 500 });
  }
}