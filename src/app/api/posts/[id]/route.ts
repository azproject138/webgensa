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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const admin = await requireAdmin(request);
  if (admin instanceof NextResponse) return admin;

  try {
    const { id } = await params;
    const repository = new PostRepository();
    const post = await repository.findById(id);
    if (!post) {
      return NextResponse.json({ error: "Artikel tidak ditemukan" }, { status: 404 });
    }
    return NextResponse.json({ post });
  } catch (error) {
    console.error("[Posts GET by id] Error:", error);
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
    const { title, slug, excerpt, content, thumbnail_url, category, status, seo_title, seo_description } = body;

    const repository = new PostRepository();
    const post = await repository.findById(id);
    if (!post) {
      return NextResponse.json({ error: "Artikel tidak ditemukan" }, { status: 404 });
    }

    if (slug !== undefined && slug !== post.slug) {
      const exists = await repository.slugExists(slug, id);
      if (exists) {
        return NextResponse.json({ error: "Slug sudah digunakan" }, { status: 409 });
      }
    }

    await repository.update(id, { title, slug, excerpt, content, thumbnail_url, category, status, seo_title, seo_description });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Posts PUT] Error:", error);
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
    const repository = new PostRepository();
    const post = await repository.findById(id);
    if (!post) {
      return NextResponse.json({ error: "Artikel tidak ditemukan" }, { status: 404 });
    }

    await repository.delete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Posts DELETE] Error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan pada server" }, { status: 500 });
  }
}