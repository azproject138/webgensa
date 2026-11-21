import { NextRequest, NextResponse } from "next/server";
import { verifyPassword, hashPassword } from "@/lib/auth";
import { getAdminFromRequest } from "@/lib/session";
import { AuthRepository } from "@/repositories/auth.repository";

export const runtime = "nodejs";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const admin = await getAdminFromRequest(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { current_password, new_password } = body;

    if (!current_password || !new_password) {
      return NextResponse.json({ error: "Password lama dan password baru wajib diisi" }, { status: 400 });
    }
    if (new_password.length < 8) {
      return NextResponse.json({ error: "Password baru minimal 8 karakter" }, { status: 400 });
    }

    const repository = new AuthRepository();
    const user = await repository.findAdminById(admin.id);
    if (!user) {
      return NextResponse.json({ error: "Admin tidak ditemukan" }, { status: 404 });
    }

    const isValid = await verifyPassword(current_password, user.password_hash);
    if (!isValid) {
      return NextResponse.json({ error: "Password lama salah" }, { status: 401 });
    }

    const passwordHash = await hashPassword(new_password);
    await repository.updatePassword(admin.id, passwordHash);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Change Password] Error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan pada server" }, { status: 500 });
  }
}
