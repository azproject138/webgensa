import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { hashToken } from "@/lib/auth";
import { getDatabasePool } from "@/lib/db";

const ADMIN_LOGIN_ROUTE = "/admin/login";
const API_AUTH_ROUTES = ["/api/auth/login", "/api/auth/logout", "/api/auth/me"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Izinkan API auth route tanpa proteksi middleware
  if (API_AUTH_ROUTES.includes(pathname)) {
    return NextResponse.next();
  }

  // Izinkan halaman login admin tanpa autentikasi
  if (pathname === ADMIN_LOGIN_ROUTE) {
    return NextResponse.next();
  }

  // Proteksi route /admin/* (kecuali login)
  if (pathname.startsWith("/admin")) {
    const token = request.cookies.get("gensa_session")?.value;

    if (!token) {
      return NextResponse.redirect(new URL(ADMIN_LOGIN_ROUTE, request.url));
    }

    // Verifikasi session ke database
    try {
      const tokenHash = hashToken(token);
      const pool = getDatabasePool();
      const [rows] = await pool.execute(
        "SELECT s.admin_id, s.expires_at, u.is_active FROM admin_sessions s JOIN admin_users u ON s.admin_id = u.id WHERE s.token_hash = ? AND s.expires_at > CURRENT_TIMESTAMP LIMIT 1",
        [tokenHash]
      );
      const sessions = rows as { admin_id: string; expires_at: Date; is_active: boolean }[];

      if (sessions.length === 0 || !sessions[0].is_active) {
        const response = NextResponse.redirect(new URL(ADMIN_LOGIN_ROUTE, request.url));
        response.headers.set("Set-Cookie", "gensa_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0");
        return response;
      }

      return NextResponse.next();
    } catch (error) {
      console.error("[Middleware] Session verification error:", error);
      const response = NextResponse.redirect(new URL(ADMIN_LOGIN_ROUTE, request.url));
      response.headers.set("Set-Cookie", "gensa_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0");
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/auth/:path*"],
};
