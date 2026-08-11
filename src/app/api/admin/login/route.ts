import { NextResponse } from "next/server";
import {
  COOKIE_NAME,
  createAdminToken,
  isAdminAuthConfigured,
  verifyAdminPassword,
} from "@/lib/auth";
import { consumeRateLimit, getRequestClientIp } from "@/lib/rate-limit";

export async function POST(request: Request) {
  if (!isAdminAuthConfigured()) {
    return NextResponse.json(
      {
        error: "Set ADMIN_PASSWORD in .env.local to enable admin login.",
      },
      { status: 503 }
    );
  }

  const ip = getRequestClientIp(request);
  const rl = await consumeRateLimit({ key: `admin:login:${ip}`, limit: 5, windowMs: 60000 });
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many login attempts. Please try again later." }, { status: 429, headers: { "Retry-After": rl.retryAfterSec.toString() } });
  }

  const { password } = (await request.json()) as { password?: string };
  if (!password || !verifyAdminPassword(password)) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const token = await createAdminToken();
  if (!token) {
    return NextResponse.json({ error: "Could not create session" }, { status: 500 });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24,
  });

  return response;
}
