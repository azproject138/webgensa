import { NextRequest, NextResponse } from "next/server";
import { getAdminFromRequest } from "@/lib/session";
import { AuthService } from "@/services/auth.service";
import { validateRegister } from "@/validators/auth.validator";

export const runtime = "nodejs";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Verifikasi session - hanya super_admin yang bisa buat admin baru
    const admin = await getAdminFromRequest(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (admin.role !== "super_admin") {
      return NextResponse.json({ error: "Hanya super_admin yang dapat membuat admin baru" }, { status: 403 });
    }

    const body = await request.json();
    const { name, email, password, role } = body;

    // Validasi input
    const validation = validateRegister({ name, email, password, role });
    if (!validation.valid) {
      return NextResponse.json({ error: "Validasi gagal", details: validation.errors }, { status: 400 });
    }

    const authService = new AuthService();
    const result = await authService.createAdmin(name, email, password, role);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      admin: {
        id: result.adminId,
        name,
        email,
        role,
      },
    });
  } catch (error) {
    console.error("[Auth Register] Error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan pada server" }, { status: 500 });
  }
}