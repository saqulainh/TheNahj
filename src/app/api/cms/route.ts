import { NextResponse } from "next/server";
import { getCMSConfig, updateCMSConfig } from "@/lib/cms";

export async function GET() {
  const config = getCMSConfig();
  return NextResponse.json(config);
}

export async function POST(request: Request) {
  try {
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
