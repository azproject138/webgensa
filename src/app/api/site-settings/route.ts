import { NextRequest, NextResponse } from "next/server";
import { getAdminFromRequest } from "@/lib/session";
import { SiteSettingRepository } from "@/repositories/site-setting.repository";

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
    const repository = new SiteSettingRepository();
    const settings = await repository.findAll();
    return NextResponse.json({ settings });
  } catch (error) {
    console.error("[Site Settings GET] Error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan pada server" }, { status: 500 });
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const admin = await requireAdmin(request);
  if (admin instanceof NextResponse) return admin;

  try {
    const body = await request.json();
    const { key, value, type } = body;

    if (!key) {
      return NextResponse.json({ error: "Kunci pengaturan wajib diisi" }, { status: 400 });
    }

    const repository = new SiteSettingRepository();
    await repository.upsert(key, value ?? null, type ?? "text", admin.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Site Settings POST] Error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan pada server" }, { status: 500 });
  }
}
