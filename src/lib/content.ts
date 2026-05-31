import { getAllArticles, getArticleBySlug } from "@/lib/wisdom";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import type { ContentBlock } from "@/lib/content-schema";
import { unstable_cache } from "next/cache";

export interface UnifiedArticle {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  tags: string[];
  hero_image?: string | null;
  featured_image?: string | null;
  sidebar_banner?: string | null;
  hero_focal_point?: { x: number; y: number } | null;
  featured_focal_point?: { x: number; y: number } | null;
  sidebar_focal_point?: { x: number; y: number } | null;
  content_blocks: ContentBlock[];
  arabic_content?: string | null;
  urdu_content?: string | null;
  english_content?: string | null;
  reading_time?: number;
  status?: "draft" | "scheduled" | "published";
  featured?: boolean;
  schedule_publish_at?: string | null;
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
  narrations?: Array<{
    id: string;
    narration: string;
    narrator: string;
    source: string;
    explanation: string;
  }>;
  current_issues?: string | null;
  youth_relevance?: string | null;
  student_relevance?: string | null;
  practical_application?: string | null;
  reflection_questions?: string | null;
  action_steps?: string | null;
  personal_reflection?: string | null;
  summary?: string | null;
  closing_reflection?: string | null;
  created_at?: string;
  published_at?: string | null;
  seo_title?: string | null;
  seo_description?: string | null;
}

function fallbackBlocks(text: string): ContentBlock[] {
  const chunks = text
    .split("\n\n")
    .map((item) => item.trim())
    .filter(Boolean);
  return chunks.map((chunk, idx) => ({
    id: `fallback-${idx}`,
    type: idx === 0 ? "heading" : "paragraph",
    value: chunk,
  }));
}

/**
 * Dynamically converts the unified structured fields from the Content Studio
 * into beautifully formatted visual block sections that ImmersiveArticle renders.
*/
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function generateBlocksFromStructured(data: any): ContentBlock[] {
  const blocks: ContentBlock[] = [];
  
  // Section 2: Original Wisdom Content
  if (data.arabic_text) {
    blocks.push({
      id: "ar-wisdom",
      type: "arabic_quote",
      value: data.arabic_text
    });
  }
  if (data.urdu_translation) {
    blocks.push({
      id: "ur-translation",
      type: "urdu_translation",
      value: data.urdu_translation
    });
  }
  if (data.english_translation) {
    blocks.push({
      id: "en-translation",
      type: "english_translation",
      value: data.english_translation
    });
  }

  // Section 3: Explanation Area
  if (data.main_explanation) {
    blocks.push({ id: "h-expl", type: "heading", value: "Explanation & Reflection" });
    blocks.push({
      id: "main-explanation",
      type: "paragraph",
      value: data.main_explanation
    });
  }
  if (data.detailed_explanation) {
    blocks.push({
      id: "detailed-explanation",
      type: "paragraph",
      value: data.detailed_explanation
    });
  }
  if (data.tafseer) {
    blocks.push({ id: "h-tafseer", type: "heading", value: "Tafseer & Depth" });
    blocks.push({
      id: "tafseer-block",
      type: "callout",
      value: data.tafseer
    });
  }
  if (data.historical_context) {
    blocks.push({ id: "h-history", type: "heading", value: "Historical Context" });
    blocks.push({
      id: "historical-context",
      type: "paragraph",
      value: data.historical_context
    });
  }

  // Section 5: Modern Relevance
  if (data.current_issues || data.youth_relevance || data.student_relevance || data.practical_application) {
    blocks.push({ id: "h-relevance", type: "heading", value: "Modern Relevance & Action" });
    
    if (data.current_issues) {
      blocks.push({ id: "current-issues", type: "paragraph", value: `**Modern Challenges:** ${data.current_issues}` });
    }
    if (data.youth_relevance) {
      blocks.push({ id: "youth-relevance", type: "paragraph", value: `**For Youth:** ${data.youth_relevance}` });
    }
    if (data.student_relevance) {
      blocks.push({ id: "student-relevance", type: "paragraph", value: `**For Students:** ${data.student_relevance}` });
    }
    if (data.practical_application) {
      blocks.push({ id: "practical-application", type: "callout", value: `**Practical Application:**\n${data.practical_application}` });
    }
  }

  // Section 6: Reflection & Actions
  if (data.reflection_questions || data.action_steps) {
    blocks.push({ id: "h-reflection", type: "heading", value: "Self Reflection & Steps" });
    
    if (data.reflection_questions) {
      blocks.push({
        id: "reflection-questions",
        type: "reflection_block",
        value: data.reflection_questions
      });
    }
    if (data.action_steps) {
      blocks.push({
        id: "action-steps",
        type: "side_note",
        value: `**Key Action Steps:**\n${data.action_steps}`
      });
    }
  }

  // Section 7: Conclusion
  if (data.summary || data.closing_reflection) {
    blocks.push({ id: "h-conclusion", type: "heading", value: "Conclusion" });
    if (data.summary) {
      blocks.push({ id: "summary", type: "paragraph", value: data.summary });
    }
    if (data.closing_reflection) {
      blocks.push({ id: "closing-reflection", type: "highlight_quote", value: data.closing_reflection });
    }
  }

  return blocks;
}

async function fetchUnifiedArticleBySlug(slug: string): Promise<UnifiedArticle | null> {
  if (isSupabaseConfigured && supabase) {
    const { data } = await supabase.from("articles_unified").select("*").eq("slug", slug).maybeSingle();
    if (data) {
      let blocks = data.content_blocks ?? [];
      if (!blocks || blocks.length === 0) {
        blocks = generateBlocksFromStructured(data);
      }
      return {
        ...data,
        tags: data.tags ?? [],
        narrations: data.narrations ?? [],
        content_blocks: blocks,
      } as UnifiedArticle;
    }
  }

  const legacy = await getArticleBySlug(slug);
  if (!legacy) return null;

  return {
    id: legacy.id,
    title: legacy.title,
    slug: legacy.slug,
    excerpt: legacy.excerpt,
    category: legacy.type,
    tags: legacy.corner_topics ?? [],
    featured_image: legacy.cover_image,
    hero_image: legacy.cover_image,
    content_blocks: fallbackBlocks(legacy.content),
    english_content: legacy.excerpt,
    reading_time: Math.max(1, Math.round(legacy.content.split(/\s+/).length / 180)),
    created_at: legacy.created_at,
  };
}

export async function getUnifiedArticleBySlug(slug: string): Promise<UnifiedArticle | null> {
  return unstable_cache(
    async () => fetchUnifiedArticleBySlug(slug),
    [`article:${slug}`],
    {
      revalidate: 1, // Set to 1 second to make publishing instant
      tags: ["articles-unified", `article:${slug}`],
    }
  )();
}

function normalizeTag(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export async function getRelatedUnifiedArticles(slug: string, category: string, tags: string[] = []) {
  const normalizedTags = tags.map(normalizeTag).filter(Boolean);
  const legacyCategory = category.toLowerCase().includes("student")
    ? "student"
    : category.toLowerCase().includes("youth")
    ? "youth"
    : "reflection";

  return unstable_cache(
    async () => {
      if (isSupabaseConfigured && supabase) {
        const { data } = await supabase
          .from("articles_unified")
          .select("slug,title,category,tags,published_at")
          .neq("slug", slug)
          .eq("status", "published");

        if (data?.length) {
          const scored = data
            .map((item) => {
              const itemTags = (item.tags ?? []).map(normalizeTag).filter(Boolean);
              const sharedTags = itemTags.filter((tag: string) => normalizedTags.includes(tag)).length;
              const score = (item.category === category ? 8 : 0) + sharedTags * 4 + (itemTags.length > 0 && sharedTags > 0 ? 2 : 0);

              return {
                ...item,
                score,
              };
            })
            .filter((item) => item.score > 0)
            .sort((a, b) => b.score - a.score || String(b.published_at || "").localeCompare(String(a.published_at || "")))
            .slice(0, 6)
            .map((it) => ({ slug: it.slug, title: it.title, category: it.category, tags: it.tags, published_at: it.published_at }));

          if (scored.length > 0) return scored;
        }
      }

      const all = await getAllArticles();
      return all
        .filter((item) => item.slug !== slug)
        .filter(
          (item) =>
            item.type === legacyCategory ||
            item.type === "wisdom" ||
            item.corner_topics?.some((tag) => normalizedTags.includes(normalizeTag(tag)))
        )
        .slice(0, 6)
        .map((item) => ({ slug: item.slug, title: item.title, category: item.type }));
    },
    [`related:${slug}:${category}:${normalizedTags.join("|")}`],
    {
      revalidate: 1, // Set to 1 second to make publishing instant
      tags: ["articles-unified", `article-related:${slug}`],
    }
  )();
}
