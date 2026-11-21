import { NextRequest, NextResponse } from "next/server";
import { getAdminFromRequest } from "@/lib/session";
import { ProgramItemRepository } from "@/repositories/program-item.repository";

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
    const categoryId = searchParams.get("category_id");

    const repository = new ProgramItemRepository();
    if (!categoryId) {
      return NextResponse.json({ error: "category_id wajib diisi" }, { status: 400 });
    }

    const items = await repository.findByCategory(categoryId);
    return NextResponse.json({ items });
  } catch (error) {
    console.error("[Program Items GET] Error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan pada server" }, { status: 500 });
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const admin = await requireAdmin(request);
  if (admin instanceof NextResponse) return admin;

  try {
    const body = await request.json();
    const { category_id, title, sort_order } = body;

    if (!category_id || !title) {
      return NextResponse.json({ error: "category_id dan title wajib diisi" }, { status: 400 });
    }

    const repository = new ProgramItemRepository();
    const id = await repository.create({ category_id, title, sort_order });
    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("[Program Items POST] Error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan pada server" }, { status: 500 });
  }
}
