import { NextResponse } from "next/server";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

export async function POST(request: Request) {
  const body = await request.json();

  const slug = slugify(body.english_translation ?? body.arabic_text ?? "wisdom");

  const record = {
    slug,
    arabic_text: body.arabic_text,
    urdu_translation: body.urdu_translation,
    english_translation: body.english_translation,
    short_reflection: body.short_reflection,
    deep_reflection: body.deep_reflection,
    simple_meaning: body.simple_meaning || null,
    why_today: body.why_today || null,
    reflection_questions: body.reflection_questions ?? [],
    source: body.source,
    category_id: body.category_id,
    action_steps: body.action_steps ?? [],
    tags: body.tags ?? [],
    corner_topics: body.corner_topics ?? [],
    featured: Boolean(body.featured),
    trending: Boolean(body.trending),
  };

  if (!isSupabaseConfigured || !supabase) {
    return NextResponse.json(
      {
        error:
          "Supabase not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local",
        draft: record,
      },
      { status: 503 }
    );
  }

  const { data, error } = await supabase.from("wisdom").insert(record).select().single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data });
}
