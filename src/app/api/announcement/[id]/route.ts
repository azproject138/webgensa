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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const admin = await requireAdmin(request);
  if (admin instanceof NextResponse) return admin;

  try {
    const { id } = await params;
    const body = await request.json();
    const { text, is_active, sort_order } = body;

    const repository = new AnnouncementRepository();
    const existing = await repository.findById(id);
    if (!existing) {
      return NextResponse.json({ error: "Pengumuman tidak ditemukan" }, { status: 404 });
    }

    await repository.update(id, { text, is_active, sort_order });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Announcement PUT] Error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan pada server" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const admin = await requireAdmin(request);
  if (admin instanceof NextResponse) return admin;

  try {
    const { id } = await params;
    const repository = new AnnouncementRepository();
    const existing = await repository.findById(id);
    if (!existing) {
      return NextResponse.json({ error: "Pengumuman tidak ditemukan" }, { status: 404 });
    }

    await repository.delete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Announcement DELETE] Error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan pada server" }, { status: 500 });
  }
}