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

  const slug = slugify(body.english_translation ?? body.arabic_text ?? "imam-ali-says");

  const record = {
    slug,
    arabic_text: body.arabic_text,
    english_translation: body.english_translation,
    source: body.source,
    category: body.category,
    featured_image: body.featured_image,
    publish_date: body.publish_date,
    meta_title: body.meta_title,
    meta_description: body.meta_description,
    tags: body.tags ?? [],
    background_image: body.background_image,
    background_type: body.background_type,
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

  const { data, error } = await supabase.from("imam_ali_says").insert(record).select().single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data });
}