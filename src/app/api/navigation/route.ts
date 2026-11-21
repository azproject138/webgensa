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

export async function GET(request: NextRequest): Promise<NextResponse> {
  const admin = await requireAdmin(request);
  if (admin instanceof NextResponse) return admin;

  try {
    const { searchParams } = new URL(request.url);
    const location = searchParams.get("location") ?? "";
    const search = searchParams.get("search") ?? "";

    const repository = new NavigationRepository();
    const items = await repository.findAll({ location: location || undefined, search });
    return NextResponse.json({ items });
  } catch (error) {
    console.error("[Navigation GET] Error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan pada server" }, { status: 500 });
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const admin = await requireAdmin(request);
  if (admin instanceof NextResponse) return admin;

  try {
    const body = await request.json();
    const { label, href, target_section, location, sort_order, is_active } = body;

    if (!label || !href) {
      return NextResponse.json({ error: "Label dan href wajib diisi" }, { status: 400 });
    }

    const repository = new NavigationRepository();
    const id = await repository.create({ label, href, target_section, location, sort_order, is_active, updated_by: admin.id });
    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("[Navigation POST] Error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan pada server" }, { status: 500 });
  }
}
