import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/services/auth.service";

export const runtime = "nodejs";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const token = request.cookies.get("gensa_session")?.value;

    if (!token) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      );
    }

    const authService = new AuthService();
    const result = await authService.verify(token);

    if (!result.authenticated) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      );
    }

    return NextResponse.json({
      authenticated: true,
      admin: result.admin,
    });
  } catch (error) {
    console.error("[Auth Me] Error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}
