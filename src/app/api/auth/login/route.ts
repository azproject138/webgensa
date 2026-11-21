import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/services/auth.service";

export const runtime = "nodejs";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { email, password } = body;

    const authService = new AuthService();

    const result = await authService.login(email, password);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 401 }
      );
    }

    const isProduction = process.env.NODE_ENV === "production";
    const cookieValue = `gensa_session=${result.token!}; Path=/; HttpOnly; ${isProduction ? "Secure; " : ""}SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}`;

    const response = NextResponse.json({
      success: true,
      admin: result.admin,
    });

    response.headers.set("Set-Cookie", cookieValue);

    return response;
  } catch (error) {
    console.error("[Auth Login] Error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}
