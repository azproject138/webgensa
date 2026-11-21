import { NextRequest, NextResponse } from "next/server";
import { getAdminFromRequest } from "@/lib/session";
import { ProgramCategoryRepository } from "@/repositories/program-category.repository";

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
    const repository = new ProgramCategoryRepository();
    const category = await repository.findById(id);
    if (!category) {
      return NextResponse.json({ error: "Kategori tidak ditemukan" }, { status: 404 });
    }
    return NextResponse.json({ category });
  } catch (error) {
    console.error("[Program Categories GET by id] Error:", error);
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
    const { name, description, image_url, accent_color, accent_text_color, sort_order, is_published } = body;

    const repository = new ProgramCategoryRepository();
    const category = await repository.findById(id);
    if (!category) {
      return NextResponse.json({ error: "Kategori tidak ditemukan" }, { status: 404 });
    }

    if (name !== undefined && name !== category.name) {
      const exists = await repository.findByName(name);
      if (exists) {
        return NextResponse.json({ error: "Nama kategori sudah digunakan" }, { status: 409 });
      }
    }

    await repository.update(id, { name, description, image_url, accent_color, accent_text_color, sort_order, is_published });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Program Categories PUT] Error:", error);
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
    const repository = new ProgramCategoryRepository();
    const category = await repository.findById(id);
    if (!category) {
      return NextResponse.json({ error: "Kategori tidak ditemukan" }, { status: 404 });
    }

    await repository.delete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Program Categories DELETE] Error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan pada server" }, { status: 500 });
  }
}