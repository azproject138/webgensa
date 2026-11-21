import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/services/auth.service";

export const runtime = "nodejs";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const token = request.cookies.get("gensa_session")?.value;

    if (token) {
      const authService = new AuthService();
      await authService.logout(token);
    }

    const response = NextResponse.json({ success: true });
    response.headers.set(
      "Set-Cookie",
      "gensa_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0"
    );

    return response;
  } catch (error) {
    console.error("[Auth Logout] Error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}
