import { NextResponse } from "next/server";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { IMAM_ALI_THEMES, THEME_TOPICS, normalizeTheme } from "@/lib/taxonomy";

// Smart default fallbacks for each category page to guide the user's initial choices.
const defaultTagsByCategory: Record<string, string[]> = {
  "Student Corner": [
    "Self Discipline",
    "Focus",
    "Productivity",
    "Exam Anxiety",
    "Time Management",
    "Social Media Addiction",
    "Career Pressure",
    "Laziness"
  ],
  "Youth Corner": [
    "Relationships",
    "Modern Issues",
    "Identity Crisis",
    "Validation Addiction",
    "Overthinking",
    "Purpose",
    "Self Respect",
    "Emotional Discipline",
    "Haram Relationships"
  ],
  "Imam Ali Says": [
    "Discipline",
    "Knowledge",
    "Time",
    "Patience",
    "Leadership",
    "Character",
    "Friendship",
    "Anger",
    "Spirituality",
    "Success"
  ],
  "Nahjul Balagha": [
    "Discipline",
    "Knowledge",
    "Time",
    "Patience",
    "Leadership",
    "Character",
    "Friendship",
    "Anger",
    "Spirituality",
    "Success"
  ],
  "Articles": [
    "Reflection",
    "Spirituality",
    "Character",
    "Modern Issues"
  ],
  "Audio Reflections": [
    "Reflection",
    "Spirituality",
    "Focus"
  ],
};

/**
 * GET /api/tags?category=Student+Corner
 * Returns unique tags used in the specified category.
 * Integrates database-saved tags with predefined smart fallbacks.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const theme = searchParams.get("theme");

  if (theme) {
    const resolved = normalizeTheme(theme);
    if (!resolved) return NextResponse.json({ tags: [] });
    return NextResponse.json({ tags: THEME_TOPICS[resolved] || [] });
  }

  // Load defaults for this category
  const defaults = category ? (defaultTagsByCategory[category] || []) : [];

  if (category === "Imam Ali Says") {
    return NextResponse.json({ tags: IMAM_ALI_THEMES as unknown as string[] });
  }

  if (!isSupabaseConfigured || !supabase) {
    return NextResponse.json({ tags: defaults });
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
      // Table may not exist yet — return defaults gracefully
      if (
        error.message.includes("schema cache") ||
        error.message.includes("relation") ||
        error.code === "PGRST204" ||
        error.code === "PGRST116"
      ) {
        return NextResponse.json({ tags: defaults });
      }
      return NextResponse.json({ tags: defaults, error: error.message }, { status: 500 });
    }

    // Flatten all tags arrays, combine with defaults, and deduplicate case-insensitively
    const allTagsMap = new Map<string, string>();
    
    // Add defaults first so their original casings are registered
    defaults.forEach(tag => allTagsMap.set(tag.toLowerCase(), tag));
    
    // Add tags from the database (will overwrite or add new ones)
    (data ?? [])
      .flatMap((row: { tags: string[] | null }) => row.tags ?? [])
      .map((tag: string) => tag.trim())
      .filter(Boolean)
      .forEach(tag => {
        allTagsMap.set(tag.toLowerCase(), tag);
      });

    const uniqueTags = Array.from(allTagsMap.values()).sort((a, b) =>
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
      tags: defaults,
      error: err instanceof Error ? err.message : "Unexpected error",
    });
  }
}
