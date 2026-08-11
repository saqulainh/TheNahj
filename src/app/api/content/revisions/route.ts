import { NextResponse } from "next/server";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { verifyAdminToken } from "@/lib/auth";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");

  if (!slug) {
    return NextResponse.json({ success: false, error: "slug is required" }, { status: 400 });
  }

  const cookieHeader = request.headers.get("cookie") || "";
  const match = cookieHeader.match(/thenahj-admin=([^;]+)/);
  const token = match ? match[1] : null;

  if (!(await verifyAdminToken(token))) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  if (!isSupabaseConfigured || !supabase) {
    return NextResponse.json({ success: true, items: [], source: "fallback" });
  }

  const { data, error } = await supabase
    .from("article_revisions")
    .select("id,article_slug,title,excerpt,content_blocks,status,created_at")
    .eq("article_slug", slug)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, items: data ?? [], source: "supabase" });
}
