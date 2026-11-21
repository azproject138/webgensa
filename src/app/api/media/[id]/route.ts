import { NextRequest, NextResponse } from "next/server";
import { getAdminFromRequest } from "@/lib/session";
import { MediaRepository } from "@/repositories/media.repository";
import { GalleryRepository } from "@/repositories/gallery.repository";
import { PostRepository } from "@/repositories/post.repository";

export const runtime = "nodejs";

async function requireAdmin(request: NextRequest) {
  const admin = await getAdminFromRequest(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return admin;
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const admin = await requireAdmin(request);
  if (admin instanceof NextResponse) return admin;

  try {
    const { id } = await params;

    const mediaRepo = new MediaRepository();
    const media = await mediaRepo.findById(id);

    if (!media) {
      return NextResponse.json({ error: "Media tidak ditemukan" }, { status: 404 });
    }

    const galleryRepo = new GalleryRepository();
    const galleryItems = await galleryRepo.findAll({ search: media.file_url, limit: 1 });
    if (galleryItems.total > 0) {
      return NextResponse.json({ error: "Media masih digunakan oleh galeri. Hapus item galeri terlebih dahulu." }, { status: 409 });
    }

    const postRepo = new PostRepository();
    const posts = await postRepo.findAll({ search: media.file_url, limit: 1 });
    if (posts.total > 0) {
      return NextResponse.json({ error: "Media masih digunakan oleh artikel. Hapus artikel terlebih dahulu." }, { status: 409 });
    }

    const { unlink } = await import("fs/promises");
    try {
      await unlink(media.file_path);
    } catch {
      // file already deleted or not accessible
    }

    await mediaRepo.delete(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Media DELETE] Error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan pada server" }, { status: 500 });
  }
}