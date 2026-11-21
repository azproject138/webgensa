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

export async function GET(request: NextRequest): Promise<NextResponse> {
  const admin = await requireAdmin(request);
  if (admin instanceof NextResponse) return admin;

  try {
    const { searchParams } = new URL(request.url);
    const pageId = searchParams.get("page_id");

    if (!pageId) {
      return NextResponse.json({ error: "page_id wajib diisi" }, { status: 400 });
    }

    const repository = new PageSectionRepository();
    const sections = await repository.findByPage(Number(pageId));
    return NextResponse.json({ sections });
  } catch (error) {
    console.error("[Page Sections GET] Error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan pada server" }, { status: 500 });
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const admin = await requireAdmin(request);
  if (admin instanceof NextResponse) return admin;

  try {
    const body = await request.json();
    const { page_id, section_key, section_type, title, description, content, sort_order, is_active } = body;

    if (!page_id || !section_key || !section_type) {
      return NextResponse.json({ error: "page_id, section_key, dan section_type wajib diisi" }, { status: 400 });
    }

    const repository = new PageSectionRepository();
    const existing = await repository.findBySectionKey(Number(page_id), section_key);
    if (existing) {
      return NextResponse.json({ error: "Section key sudah digunakan pada halaman ini" }, { status: 409 });
    }

    const id = await repository.create({ page_id: Number(page_id), section_key, section_type, title, description, content, sort_order, is_active });
    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("[Page Sections POST] Error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan pada server" }, { status: 500 });
  }
}
