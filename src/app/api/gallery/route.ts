import { NextRequest, NextResponse } from "next/server";
import { getAdminFromRequest } from "@/lib/session";
import { GalleryRepository } from "@/repositories/gallery.repository";

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
    const search = searchParams.get("search") ?? "";
    const category = searchParams.get("category") ?? "";
    const page = Math.max(Number(searchParams.get("page") ?? "1"), 1);
    const limit = Math.max(Number(searchParams.get("limit") ?? "10"), 1);

    const repository = new GalleryRepository();
    const result = await repository.findAll({ search, category, page, limit });
    return NextResponse.json(result);
  } catch (error) {
    console.error("[Gallery GET] Error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan pada server" }, { status: 500 });
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const admin = await requireAdmin(request);
  if (admin instanceof NextResponse) return admin;

  try {
    const body = await request.json();
    const { title, category, image_url, alt_text, caption, sort_order, is_active, is_placeholder } = body;

    if (!title || !image_url) {
      return NextResponse.json({ error: "Judul dan image_url wajib diisi" }, { status: 400 });
    }

    const repository = new GalleryRepository();
    const id = await repository.create({
      title,
      category,
      image_url,
      alt_text,
      caption,
      sort_order,
      is_active,
      is_placeholder,
      uploaded_by: admin.id,
    });
    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("[Gallery POST] Error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan pada server" }, { status: 500 });
  }
}
