import { NextRequest, NextResponse } from "next/server";
import { getAdminFromRequest } from "@/lib/session";
import { PageSectionRepository } from "@/repositories/page-section.repository";

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
    const { section_key, section_type, title, description, content, sort_order, is_active } = body;

    const repository = new PageSectionRepository();
    const existing = await repository.findById(id);
    if (!existing) {
      return NextResponse.json({ error: "Section tidak ditemukan" }, { status: 404 });
    }

    if (section_key !== undefined && section_key !== existing.section_key) {
      const dup = await repository.findBySectionKey(existing.page_id, section_key);
      if (dup) {
        return NextResponse.json({ error: "Section key sudah digunakan pada halaman ini" }, { status: 409 });
      }
    }

    await repository.update(id, { section_key, section_type, title, description, content, sort_order, is_active });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Page Sections PUT] Error:", error);
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
    const repository = new PageSectionRepository();
    const existing = await repository.findById(id);
    if (!existing) {
      return NextResponse.json({ error: "Section tidak ditemukan" }, { status: 404 });
    }

    await repository.delete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Page Sections DELETE] Error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan pada server" }, { status: 500 });
  }
}