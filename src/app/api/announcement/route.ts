import { NextRequest, NextResponse } from "next/server";
import { getAdminFromRequest } from "@/lib/session";
import { AnnouncementRepository } from "@/repositories/announcement.repository";

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
    const repository = new AnnouncementRepository();
    const bars = await repository.findAll();
    return NextResponse.json({ bars });
  } catch (error) {
    console.error("[Announcement GET] Error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan pada server" }, { status: 500 });
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const admin = await requireAdmin(request);
  if (admin instanceof NextResponse) return admin;

  try {
    const body = await request.json();
    const { text, is_active, sort_order } = body;

    if (!text) {
      return NextResponse.json({ error: "Teks pengumuman wajib diisi" }, { status: 400 });
    }

    const repository = new AnnouncementRepository();
    const id = await repository.create({ text, is_active, sort_order });

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("[Announcement POST] Error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan pada server" }, { status: 500 });
  }
}
