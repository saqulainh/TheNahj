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
  content_blocks: ContentBlock[];
  arabic_content?: string | null;
  urdu_content?: string | null;
  english_content?: string | null;
  reading_time?: number;
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

async function fetchUnifiedArticleBySlug(slug: string): Promise<UnifiedArticle | null> {
  if (isSupabaseConfigured && supabase) {
    const { data } = await supabase.from("articles_unified").select("*").eq("slug", slug).maybeSingle();
    if (data) {
      return {
        ...data,
        tags: data.tags ?? [],
        content_blocks: data.content_blocks ?? [],
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
      revalidate: 300,
      tags: ["articles-unified", `article:${slug}`],
    }
  )();
}

export async function getRelatedUnifiedArticles(slug: string, category: string) {
  return unstable_cache(
    async () => {
      if (isSupabaseConfigured && supabase) {
        const { data } = await supabase
          .from("articles_unified")
          .select("slug,title,category")
          .neq("slug", slug)
          .eq("category", category)
          .limit(5);
        if (data?.length) return data;
      }

      const all = await getAllArticles();
      return all
        .filter((item) => item.slug !== slug)
        .slice(0, 5)
        .map((item) => ({ slug: item.slug, title: item.title, category: item.type }));
    },
    [`related:${slug}:${category}`],
    {
      revalidate: 300,
      tags: ["articles-unified", `article-related:${slug}`],
    }
  )();
}
