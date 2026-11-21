import { NextRequest, NextResponse } from "next/server";
import { getAdminFromRequest } from "@/lib/session";
import { getDatabasePool } from "@/lib/db";

export const runtime = "nodejs";

async function requireAdmin(request: NextRequest) {
  const admin = await getAdminFromRequest(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return admin;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const admin = await requireAdmin(request);
  if (admin instanceof NextResponse) return admin;

  try {
    const pool = getDatabasePool();

    const [postRows] = await pool.execute(
      "SELECT status, COUNT(*) as total FROM posts GROUP BY status"
    );
    const stats = (postRows as { status: string; total: number }[]).reduce(
      (acc, s) => {
        acc[s.status] = s.total;
        return acc;
      },
      {} as Record<string, number>
    );

    const [galleryRows] = await pool.execute("SELECT COUNT(*) as total FROM gallery_items");
    const galleryTotal = (galleryRows as { total: number }[])[0]?.total ?? 0;

    const [categoryRows] = await pool.execute("SELECT COUNT(*) as total FROM program_categories");
    const categoryTotal = (categoryRows as { total: number }[])[0]?.total ?? 0;

    const [pageRows] = await pool.execute("SELECT COUNT(*) as total FROM pages");
    const pageTotal = (pageRows as { total: number }[])[0]?.total ?? 0;

    const [adminRows] = await pool.execute(
      "SELECT id, name, email, last_login_at FROM admin_users WHERE is_active = TRUE ORDER BY last_login_at DESC LIMIT 5"
    );
    const recentAdmins = adminRows as { id: string; name: string; email: string; last_login_at: Date | null }[];

    const [updatedRows] = await pool.execute(
      "SELECT 'post' as type, title, updated_at FROM posts WHERE updated_at IS NOT NULL UNION ALL SELECT 'section' as type, title, updated_at FROM page_sections WHERE updated_at IS NOT NULL ORDER BY updated_at DESC LIMIT 5"
    );
    const recentlyUpdated = updatedRows as { type: string; title: string; updated_at: Date }[];

    return NextResponse.json({
      posts: {
        total: stats.published ?? 0 + (stats.draft ?? 0) + (stats.archived ?? 0),
        published: stats.published ?? 0,
        draft: stats.draft ?? 0,
        archived: stats.archived ?? 0,
      },
      gallery: galleryTotal,
      categories: categoryTotal,
      pages: pageTotal,
      recentAdmins,
      recentlyUpdated,
    });
  } catch (error) {
    console.error("[Dashboard Stats] Error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan pada server" }, { status: 500 });
  }
}
