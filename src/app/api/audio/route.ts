import { NextResponse } from "next/server";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { verifyAdminToken } from "@/lib/auth";
import { consumeRateLimit, getRequestClientIp } from "@/lib/rate-limit";

export async function GET() {
  if (!isSupabaseConfigured || !supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const { data, error } = await supabase
    .from("audio_tracks")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  if (!isSupabaseConfigured || !supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const ip = getRequestClientIp(request);
  const rl = await consumeRateLimit({ key: `audio:post:${ip}`, limit: 10, windowMs: 60000 });
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429, headers: { "Retry-After": rl.retryAfterSec.toString() } });
  }

  // Very simple auth check for admin panel using cookies
  const cookieHeader = request.headers.get("cookie") || "";
  const match = cookieHeader.match(/thenahj-admin=([^;]+)/);
  const token = match ? match[1] : null;

  const isValid = await verifyAdminToken(token);
  if (!isValid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, subtitle, category, reciter, cover_image, duration, audio_url, is_focus_ambient } = body;

    const { error } = await supabase.from("audio_tracks").insert([
      { title, subtitle, category, reciter, cover_image, duration, audio_url, is_focus_ambient: Boolean(is_focus_ambient) },
    ]);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  if (!isSupabaseConfigured || !supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const cookieHeader = request.headers.get("cookie") || "";
  const match = cookieHeader.match(/thenahj-admin=([^;]+)/);
  const token = match ? match[1] : null;

  const isValid = await verifyAdminToken(token);
  if (!isValid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id, is_focus_ambient } = await request.json();
    if (!id) return NextResponse.json({ error: "Track ID required" }, { status: 400 });

    const { error } = await supabase
      .from("audio_tracks")
      .update({ is_focus_ambient })
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
