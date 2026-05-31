import { NextResponse } from "next/server";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

/**
 * GET /api/tags?category=Student+Corner
 * Returns unique tags used in the specified category.
 * Falls back to an empty array when the table or Supabase is unavailable.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");

  if (!isSupabaseConfigured || !supabase) {
    return NextResponse.json({ tags: [] });
  }

  try {
    let query = supabase
      .from("articles_unified")
      .select("tags");

    if (category) {
      query = query.eq("category", category);
    }

    const { data, error } = await query;

    if (error) {
      // Table may not exist yet — return empty gracefully
      if (
        error.message.includes("schema cache") ||
        error.message.includes("relation") ||
        error.code === "PGRST204" ||
        error.code === "PGRST116"
      ) {
        return NextResponse.json({ tags: [] });
      }
      return NextResponse.json({ tags: [], error: error.message }, { status: 500 });
    }

    // Flatten all tags arrays and deduplicate
    const allTags = (data ?? [])
      .flatMap((row: { tags: string[] | null }) => row.tags ?? [])
      .map((tag: string) => tag.trim())
      .filter(Boolean);

    const uniqueTags = [...new Set(allTags)].sort((a, b) =>
      a.localeCompare(b, undefined, { sensitivity: "base" })
    );

    return NextResponse.json(
      { tags: uniqueTags },
      {
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120",
        },
      }
    );
  } catch (err) {
    return NextResponse.json({
      tags: [],
      error: err instanceof Error ? err.message : "Unexpected error",
    });
  }
}
