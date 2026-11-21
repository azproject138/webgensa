import { NextRequest, NextResponse } from "next/server";
import { getAdminFromRequest } from "@/lib/session";
import { NavigationRepository } from "@/repositories/navigation.repository";

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
    const repository = new NavigationRepository();
    const item = await repository.findById(id);
    if (!item) {
      return NextResponse.json({ error: "Item navigasi tidak ditemukan" }, { status: 404 });
    }
    return NextResponse.json({ item });
  } catch (error) {
    console.error("[Navigation GET by id] Error:", error);
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
    const { label, href, target_section, location, sort_order, is_active } = body;

    const repository = new NavigationRepository();
    const item = await repository.findById(id);
    if (!item) {
      return NextResponse.json({ error: "Item navigasi tidak ditemukan" }, { status: 404 });
    }

    await repository.update(id, { label, href, target_section, location, sort_order, is_active, updated_by: admin.id });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Navigation PUT] Error:", error);
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
    const repository = new NavigationRepository();
    const item = await repository.findById(id);
    if (!item) {
      return NextResponse.json({ error: "Item navigasi tidak ditemukan" }, { status: 404 });
    }

    await repository.delete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Navigation DELETE] Error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan pada server" }, { status: 500 });
  }
}