import { NextRequest, NextResponse } from "next/server";
import { getAdminFromRequest } from "@/lib/session";
import { PageRepository } from "@/repositories/page.repository";

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
    const repository = new PageRepository();
    const pages = await repository.findAll();
    return NextResponse.json({ pages });
  } catch (error) {
    console.error("[Pages GET] Error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan pada server" }, { status: 500 });
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const admin = await requireAdmin(request);
  if (admin instanceof NextResponse) return admin;

  try {
    const body = await request.json();
    const { slug, title, content } = body;

    if (!slug || !title) {
      return NextResponse.json({ error: "Slug dan title wajib diisi" }, { status: 400 });
    }

    const repository = new PageRepository();
    const exists = await repository.findBySlug(slug);
    if (exists) {
      return NextResponse.json({ error: "Slug sudah digunakan" }, { status: 409 });
    }

    const id = await repository.create(slug, title, content ?? "");
    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("[Pages POST] Error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan pada server" }, { status: 500 });
  }
}
