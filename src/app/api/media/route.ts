import { NextRequest, NextResponse } from "next/server";
import { getAdminFromRequest } from "@/lib/session";
import { MediaRepository } from "@/repositories/media.repository";

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
    const page = Math.max(parseInt(searchParams.get("page") ?? "1", 10), 1);
    const limit = Math.max(parseInt(searchParams.get("limit") ?? "20", 10), 1);

    const repository = new MediaRepository();
    const result = await repository.findAll({ search, page, limit });

    return NextResponse.json(result);
  } catch (error) {
    console.error("[Media GET] Error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan pada server" }, { status: 500 });
  }
}