import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { normalizeSection, normalizeThemeForSection, normalizeTopicForSection, slugifyTaxonomy } from "@/lib/taxonomy";

type ArticleProjectionSource = Record<string, unknown> & {
  slug?: string;
  title?: string;
  excerpt?: string;
  category?: string;
  theme?: string | null;
  topic?: string | null;
  audiences?: string[] | null;
  tags?: string[] | null;
  featured_image?: string | null;
  hero_image?: string | null;
  sidebar_banner?: string | null;
  reading_time?: number | null;
  status?: string;
  featured?: boolean | null;
  published_at?: string | null;
  arabic_text?: string | null;
  urdu_translation?: string | null;
  english_translation?: string | null;
  source?: string | null;
  source_number?: string | null;
  book_name?: string | null;
  main_explanation?: string | null;
  detailed_explanation?: string | null;
  tafseer?: string | null;
  historical_context?: string | null;
  reflection_questions?: string | null;
  action_steps?: string | null;
  current_issues?: string | null;
  youth_relevance?: string | null;
  student_relevance?: string | null;
  practical_application?: string | null;
  summary?: string | null;
  closing_reflection?: string | null;
};

function safeString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function safeArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function fallbackSlug(source: ArticleProjectionSource): string {
  const base = source.slug || source.title || source.excerpt || "wisdom-card";
  return slugifyTaxonomy(base).slice(0, 90) || "wisdom-card";
}

export function buildWisdomCardProjection(article: ArticleProjectionSource) {
  const section = normalizeSection(safeString(article.category, "Imam Ali Says")) || safeString(article.category, "Imam Ali Says");
  const theme = normalizeThemeForSection(section, safeString(article.theme || null, "")) || null;
  const topic = normalizeTopicForSection(section, theme, safeString(article.topic || null, "")) || null;
  const slug = fallbackSlug(article);
  const title = safeString(article.title, article.excerpt ? String(article.excerpt) : slug);

  return {
    article_slug: slug,
    section,
    theme,
    topic,
    audiences: safeArray(article.audiences),
    title,
    excerpt: safeString(article.excerpt),
    slug,
    arabic_text: safeString(article.arabic_text),
    urdu_translation: safeString(article.urdu_translation),
    english_translation: safeString(article.english_translation),
    source: safeString(article.source),
    source_number: safeString(article.source_number),
    book_name: safeString(article.book_name),
    featured_image: article.featured_image ?? null,
    hero_image: article.hero_image ?? article.featured_image ?? null,
    sidebar_banner: article.sidebar_banner ?? null,
    reading_time: Number.isFinite(Number(article.reading_time)) ? Number(article.reading_time) : 0,
    status: safeString(article.status, "draft"),
    featured: Boolean(article.featured),
    published_at: article.published_at ?? null,
    updated_at: new Date().toISOString(),
    metadata: {
      tags: safeArray(article.tags),
      current_issues: safeString(article.current_issues),
      youth_relevance: safeString(article.youth_relevance),
      student_relevance: safeString(article.student_relevance),
      practical_application: safeString(article.practical_application),
      reflection_questions: safeString(article.reflection_questions),
      action_steps: safeString(article.action_steps),
      summary: safeString(article.summary),
      closing_reflection: safeString(article.closing_reflection),
      main_explanation: safeString(article.main_explanation),
      detailed_explanation: safeString(article.detailed_explanation),
      tafseer: safeString(article.tafseer),
      historical_context: safeString(article.historical_context),
    },
  };
}

function isMissingTableError(error: { message?: string; code?: string } | null | undefined) {
  return Boolean(
    error && (
      (error.message && (error.message.includes("relation") || error.message.includes("schema cache") || error.message.includes("does not exist"))) ||
      error.code === "PGRST204" ||
      error.code === "PGRST116"
    )
  );
}

export async function syncWisdomCardProjection(article: ArticleProjectionSource) {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, skipped: true };
  }

  const projection = buildWisdomCardProjection(article);
  const { error } = await supabase.from("wisdom_cards").upsert(projection, { onConflict: "article_slug" });

  if (error) {
    if (isMissingTableError(error)) {
      return { success: false, skipped: true, error: error.message };
    }
    throw error;
  }

  return { success: true, projection };
}

export async function deleteWisdomCardProjection(slug: string) {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, skipped: true };
  }

  const { error } = await supabase.from("wisdom_cards").delete().eq("article_slug", slug);

  if (error) {
    if (isMissingTableError(error)) {
      return { success: false, skipped: true, error: error.message };
    }
    throw error;
  }

  return { success: true };
}