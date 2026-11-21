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

export async function GET(request: NextRequest): Promise<NextResponse> {
  const admin = await requireAdmin(request);
  if (admin instanceof NextResponse) return admin;

  try {
    const repository = new ProgramCategoryRepository();
    const categories = await repository.findAll();
    return NextResponse.json({ categories });
  } catch (error) {
    console.error("[Program Categories GET] Error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan pada server" }, { status: 500 });
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const admin = await requireAdmin(request);
  if (admin instanceof NextResponse) return admin;

  try {
    const body = await request.json();
    const { name, description, image_url, accent_color, accent_text_color, sort_order, is_published } = body;

    if (!name) {
      return NextResponse.json({ error: "Nama kategori wajib diisi" }, { status: 400 });
    }

    const repository = new ProgramCategoryRepository();
    const exists = await repository.findByName(name);
    if (exists) {
      return NextResponse.json({ error: "Nama kategori sudah digunakan" }, { status: 409 });
    }

    const id = await repository.create({ name, description, image_url, accent_color, accent_text_color, sort_order, is_published });
    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("[Program Categories POST] Error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan pada server" }, { status: 500 });
  }
}
