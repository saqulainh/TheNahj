import { NextResponse } from "next/server";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

export async function GET(request: Request) {
  if (!isSupabaseConfigured || !supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const authHeader = request.headers.get('Authorization');
  if (!authHeader) {
     return NextResponse.json({ error: "Missing authorization header" }, { status: 401 });
  }

  const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("saved_wisdom")
    .select("wisdom_slug")
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const slugs = data.map((d) => d.wisdom_slug);
  return NextResponse.json({ saved: slugs });
}

export async function POST(request: Request) {
  if (!isSupabaseConfigured || !supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const authHeader = request.headers.get('Authorization');
  if (!authHeader) {
     return NextResponse.json({ error: "Missing authorization header" }, { status: 401 });
  }

  const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { slug, action } = body;

  if (!slug) return NextResponse.json({ error: "Missing slug" }, { status: 400 });

  if (action === "save") {
    const { error } = await supabase
      .from("saved_wisdom")
      .upsert({ user_id: user.id, wisdom_slug: slug }, { onConflict: 'user_id, wisdom_slug' });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  } else if (action === "unsave") {
    const { error } = await supabase
      .from("saved_wisdom")
      .delete()
      .match({ user_id: user.id, wisdom_slug: slug });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
