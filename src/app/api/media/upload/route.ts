import { NextRequest, NextResponse } from "next/server";
import { getAdminFromRequest } from "@/lib/session";
import { MediaRepository } from "@/repositories/media.repository";

export const runtime = "nodejs";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

function isValidMimeType(mime: string): boolean {
  return ALLOWED_MIME_TYPES.includes(mime);
}

function getFileExtension(mime: string): string {
  switch (mime) {
    case "image/jpeg":
      return ".jpg";
    case "image/png":
      return ".png";
    case "image/webp":
      return ".webp";
    default:
      return ".bin";
  }
}

async function requireAdmin(request: NextRequest) {
  const admin = await getAdminFromRequest(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return admin;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const admin = await requireAdmin(request);
  if (admin instanceof NextResponse) return admin;

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "File tidak ditemukan" }, { status: 400 });
    }

    if (!isValidMimeType(file.type)) {
      return NextResponse.json({ error: "Tipe file tidak diizinkan. Gunakan JPG, PNG, atau WebP." }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "Ukuran file melebihi batas maksimal 10MB" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const originalName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const fileExt = getFileExtension(file.type);
    const randomName = crypto.randomUUID() + fileExt;
    const uploadDir = process.env.MEDIA_UPLOAD_PATH || "./public/uploads";
    const filePath = `${uploadDir}/${randomName}`;
    const fileUrl = `/uploads/${randomName}`;

    await writeFileToDisk(filePath, buffer);

    let width: number | null = null;
    let height: number | null = null;
    try {
      const sharp = (await import("sharp")).default;
      const metadata = await sharp(buffer).metadata();
      width = metadata.width ?? null;
      height = metadata.height ?? null;
    } catch {
      // sharp not available, skip dimensions
    }

    const repository = new MediaRepository();
    const id = await repository.create({
      original_name: originalName,
      file_name: randomName,
      file_path: filePath,
      file_url: fileUrl,
      mime_type: file.type,
      file_size: file.size,
      width: width ?? undefined,
      height: height ?? undefined,
      uploaded_by: admin.id,
    });

    return NextResponse.json({
      success: true,
      media: {
        id,
        original_name: originalName,
        file_name: randomName,
        file_url: fileUrl,
        mime_type: file.type,
        file_size: file.size,
        width,
        height,
      },
    });
  } catch (error) {
    console.error("[Media POST] Error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan saat mengunggah file" }, { status: 500 });
  }
}

import { writeFile as fsWriteFile, mkdir } from "fs/promises";
import crypto from "crypto";

async function writeFileToDisk(path: string, data: Buffer): Promise<void> {
  const uploadDir = process.env.MEDIA_UPLOAD_PATH || "./public/uploads";
  await mkdir(uploadDir, { recursive: true });
  await fsWriteFile(path, data);
}