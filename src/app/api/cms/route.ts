import { NextResponse } from "next/server";
import { getCMSConfig, updateCMSConfig } from "@/lib/cms";
import { verifyAdminToken, COOKIE_NAME } from "@/lib/auth";

export async function GET(request: Request) {
  const config = getCMSConfig();
  return NextResponse.json(config);
}

export async function POST(request: Request) {
  try {
    const cookieHeader = request.headers.get("cookie") || "";
    const cookies = Object.fromEntries(
      cookieHeader.split("; ").map(v => {
        const parts = v.split("=");
        return [decodeURIComponent(parts[0]), decodeURIComponent(parts.slice(1).join("="))];
      })
    );
    const token = cookies[COOKIE_NAME];
    
    if (!(await verifyAdminToken(token))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const result = await updateCMSConfig(body);
    if (result.success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: "Failed to save config" }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
