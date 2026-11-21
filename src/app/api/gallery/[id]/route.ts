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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const admin = await requireAdmin(request);
  if (admin instanceof NextResponse) return admin;

  try {
    const { id } = await params;
    const repository = new GalleryRepository();
    const item = await repository.findById(id);
    if (!item) {
      return NextResponse.json({ error: "Item galeri tidak ditemukan" }, { status: 404 });
    }
    return NextResponse.json({ item });
  } catch (error) {
    console.error("[Gallery GET by id] Error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan pada server" }, { status: 500 });
  }
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
    const { title, category, image_url, alt_text, caption, sort_order, is_active } = body;

    const repository = new GalleryRepository();
    const item = await repository.findById(id);
    if (!item) {
      return NextResponse.json({ error: "Item galeri tidak ditemukan" }, { status: 404 });
    }

    await repository.update(id, { title, category, image_url, alt_text, caption, sort_order, is_active });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Gallery PUT] Error:", error);
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
    const repository = new GalleryRepository();
    const item = await repository.findById(id);
    if (!item) {
      return NextResponse.json({ error: "Item galeri tidak ditemukan" }, { status: 404 });
    }

    await repository.delete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Gallery DELETE] Error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan pada server" }, { status: 500 });
  }
}