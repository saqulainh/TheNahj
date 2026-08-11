import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { COOKIE_NAME, verifyAdminToken } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(COOKIE_NAME)?.value;
  const isAuthed = await verifyAdminToken(token);
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  const isUnsafeMethod = ["POST", "PUT", "PATCH", "DELETE"].includes(request.method);

  if (isUnsafeMethod && pathname.startsWith("/api/")) {
    if (origin && host && !origin.includes(host)) {
      return NextResponse.json({ error: "CSRF validation failed: Origin mismatch" }, { status: 403 });
    }
    const contentType = request.headers.get("content-type") || "";
    // Allow multipart/form-data for media uploads, require application/json for everything else.
    if (!contentType.includes("application/json") && !contentType.includes("multipart/form-data")) {
      return NextResponse.json({ error: "CSRF validation failed: Invalid Content-Type" }, { status: 415 });
    }
  }

  if (
    (pathname === "/admin" || pathname.startsWith("/admin/")) &&
    pathname !== "/admin/login"
  ) {
    if (!isAuthed) {
      const login = new URL("/admin/login", request.url);
      login.searchParams.set("next", pathname);
      return NextResponse.redirect(login);
    }
  }

  const adminWriteRoutes = ["/api/wisdom", "/api/articles", "/api/content", "/api/media"];
  if (adminWriteRoutes.includes(pathname) && isUnsafeMethod && !isAuthed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (pathname.startsWith("/api/content/revisions") && !isAuthed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/api/wisdom", "/api/articles", "/api/content", "/api/content/:path*", "/api/media"],
};
