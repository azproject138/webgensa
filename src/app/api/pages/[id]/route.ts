import { NextRequest, NextResponse } from "next/server";
import { getAdminFromRequest } from "@/lib/session";
import { PageRepository } from "@/repositories/page.repository";

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
    const repository = new PageRepository();
    const page = await repository.findById(Number(id));
    if (!page) {
      return NextResponse.json({ error: "Halaman tidak ditemukan" }, { status: 404 });
    }
    return NextResponse.json({ page });
  } catch (error) {
    console.error("[Pages GET by id] Error:", error);
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
    const { slug, title, content } = body;

    const repository = new PageRepository();
    const page = await repository.findById(Number(id));
    if (!page) {
      return NextResponse.json({ error: "Halaman tidak ditemukan" }, { status: 404 });
    }

    if (slug !== undefined && slug !== page.slug) {
      const exists = await repository.findBySlug(slug);
      if (exists) {
        return NextResponse.json({ error: "Slug sudah digunakan" }, { status: 409 });
      }
    }

    await repository.update(Number(id), { slug, title, content });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Pages PUT] Error:", error);
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
    const repository = new PageRepository();
    const page = await repository.findById(Number(id));
    if (!page) {
      return NextResponse.json({ error: "Halaman tidak ditemukan" }, { status: 404 });
    }

    await repository.delete(Number(id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Pages DELETE] Error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan pada server" }, { status: 500 });
  }
}