import { NextRequest, NextResponse } from "next/server";
import { getAdminFromRequest } from "@/lib/session";
import { PostRepository } from "@/repositories/post.repository";

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
    const status = searchParams.get("status") ?? "";
    const page = Math.max(Number(searchParams.get("page") ?? "1"), 1);
    const limit = Math.max(Number(searchParams.get("limit") ?? "10"), 1);

    const repository = new PostRepository();
    const result = await repository.findAll({ search, status, page, limit });
    return NextResponse.json(result);
  } catch (error) {
    console.error("[Posts GET] Error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan pada server" }, { status: 500 });
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const admin = await requireAdmin(request);
  if (admin instanceof NextResponse) return admin;

  try {
    const body = await request.json();
    const { title, slug, excerpt, content, thumbnail_url, category, status, seo_title, seo_description } = body;

    if (!title || !slug) {
      return NextResponse.json({ error: "Judul dan slug wajib diisi" }, { status: 400 });
    }

    const repository = new PostRepository();
    const exists = await repository.slugExists(slug);
    if (exists) {
      return NextResponse.json({ error: "Slug sudah digunakan" }, { status: 409 });
    }

    const id = await repository.create({
      title,
      slug,
      excerpt,
      content: content ?? "",
      thumbnail_url,
      category,
      status,
      seo_title,
      seo_description,
      author_id: admin.id,
    });
    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("[Posts POST] Error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan pada server" }, { status: 500 });
  }
}
