import type { Article, Category, Wisdom } from "@/lib/types";
import { isSupabaseConfigured, supabase } from "./supabase";

/**
 * Dynamically extract and generate categories/topics list.
 * Seed categories are loaded from the database, and then all distinct tags 
 * from published unified articles are appended dynamically as category objects.
 */
export async function getCategories(): Promise<Category[]> {
  let dbCategories: Category[] = [];
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from("categories").select("*").order("name");
    if (!error && data?.length) {
      dbCategories = data as Category[];
    }
  }

  // Dynamically extract any custom topics/tags from published articles
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("articles_unified")
        .select("tags")
        .eq("status", "published");
      if (!error && data?.length) {
        const allTags = data
          .flatMap((row: { tags: string[] | null }) => row.tags ?? [])
          .map((t: string) => t.trim())
          .filter(Boolean);
        const uniqueTags = Array.from(new Set(allTags));
        uniqueTags.forEach((tag) => {
          const slug = tag.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
          if (slug && !dbCategories.some((c) => c.slug === slug || c.name.toLowerCase() === tag.toLowerCase())) {
            dbCategories.push({
              id: slug,
              name: tag,
              slug: slug,
            });
          }
        });
      }
    } catch (e) {
      console.error("Error dynamically loading categories:", e);
    }
  }

  return dbCategories;
}

/**
 * Fetch all published short-form wisdom cards (Imam Ali Says, Nahjul Balagha, Audio Reflections).
 */
export async function getAllWisdom(): Promise<Wisdom[]> {
  const dbCategories = await getCategories();

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("articles_unified")
        .select("*")
        .eq("status", "published")
        .in("category", ["Imam Ali Says", "Nahjul Balagha", "Audio Reflections"])
        .order("published_at", { ascending: false });

      if (!error && data?.length) {
        return data.map((row: any) => {
          const tags = row.tags ?? [];
          // Try to match tags with a category in dbCategories
          const matchedCategory = dbCategories.find(c =>
            tags.some((tag: string) => tag.toLowerCase() === c.name.toLowerCase() || tag.toLowerCase() === c.slug.toLowerCase())
          );
          
          // If not matched, fallback to first tag or General
          const firstTag = tags[0] || "General";
          const firstTagSlug = firstTag.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
          const categoryObj = matchedCategory || {
            id: firstTagSlug || "general",
            name: firstTag,
            slug: firstTagSlug || "general"
          };

          // Parse reflection questions and action steps from newline-separated texts
          const reflectionQuestions = row.reflection_questions 
            ? row.reflection_questions.split("\n").map((q: string) => q.replace(/^[-\*\s\d\.\)]+/, "").trim()).filter(Boolean)
            : [];
          const actionSteps = row.action_steps 
            ? row.action_steps.split("\n").map((s: string) => s.replace(/^[-\*\s\d\.\)]+/, "").trim()).filter(Boolean)
            : [];

          return {
            id: row.id,
            slug: row.slug,
            arabic_text: row.arabic_text || "",
            urdu_translation: row.urdu_translation || "",
            english_translation: row.english_translation || "",
            short_reflection: row.excerpt || "",
            deep_reflection: row.main_explanation || "",
            simple_meaning: row.summary || "",
            why_today: row.current_issues || "",
            reflection_questions: reflectionQuestions,
            action_steps: actionSteps,
            source: row.source || "",
            category_id: categoryObj.id,
            category: categoryObj,
            audio_url: row.sidebar_banner || undefined,
            featured_image: row.featured_image || row.hero_image || undefined,
            tags: tags,
            corner_topics: tags.map((t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")),
            related_slugs: [],
            featured: row.featured || false,
            trending: row.featured || false,
            created_at: row.published_at || row.created_at || new Date().toISOString(),
          };
        });
      }
    } catch (e) {
      console.error("Error in getAllWisdom:", e);
    }
  }

  return [];
}

export async function getWisdomBySlug(slug: string): Promise<Wisdom | null> {
  const all = await getAllWisdom();
  return all.find((w) => w.slug === slug) ?? null;
}

export async function getWisdomByCategory(categorySlug: string): Promise<Wisdom[]> {
  const all = await getAllWisdom();
  return all.filter((w) => w.category?.slug === categorySlug);
}

export async function getFeaturedWisdom(): Promise<Wisdom[]> {
  const all = await getAllWisdom();
  return all.filter((w) => w.featured).slice(0, 3);
}

export async function getTrendingWisdom(): Promise<Wisdom[]> {
  const all = await getAllWisdom();
  return all.filter((w) => w.trending).slice(0, 6);
}

export async function getDailyWisdom(): Promise<Wisdom> {
  const all = await getAllWisdom();
  const dayIndex = new Date().getDate() % all.length;
  return all[dayIndex] ?? all[0];
}

export async function getRelatedWisdom(wisdom: Wisdom): Promise<Wisdom[]> {
  const all = await getAllWisdom();
  if (wisdom.related_slugs?.length) {
    return all.filter((w) => wisdom.related_slugs?.includes(w.slug));
  }
  return all
    .filter((w) => w.category_id === wisdom.category_id && w.id !== wisdom.id)
    .slice(0, 3);
}

/**
 * Fetch all published articles (Student Corner, Youth Corner, Articles).
 */
export async function getAllArticles(): Promise<Article[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("articles_unified")
        .select("*")
        .eq("status", "published")
        .in("category", ["Student Corner", "Youth Corner", "Articles"])
        .order("published_at", { ascending: false });

      if (!error && data?.length) {
        return data.map((row: any) => {
          const tags = row.tags ?? [];
          
          let type: Article["type"] = "reflection";
          if (row.category === "Student Corner") type = "student";
          else if (row.category === "Youth Corner") type = "youth";

          return {
            id: row.id,
            title: row.title,
            slug: row.slug,
            excerpt: row.excerpt || "",
            content: row.main_explanation || "",
            cover_image: row.featured_image || row.hero_image || undefined,
            seo_description: row.seo_description || row.excerpt || "",
            type: type,
            corner_topics: tags.map((t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")),
            created_at: row.published_at || row.created_at || new Date().toISOString(),
          };
        });
      }
    } catch (e) {
      console.error("Error in getAllArticles:", e);
    }
  }
  return [];
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const all = await getAllArticles();
  return all.find((a) => a.slug === slug) ?? null;
}

export async function getWisdomByCornerTopic(topicSlug: string): Promise<Wisdom[]> {
  const all = await getAllWisdom();
  const matched = all.filter((w) => w.corner_topics?.includes(topicSlug));
  if (matched.length > 0) return matched;

  const tagFallback: Record<string, string[]> = {
    "focus-productivity": ["focus", "study", "knowledge", "time"],
    "exam-anxiety": ["anxiety", "patience", "study"],
    "social-media-addiction": ["time", "focus"],
    laziness: ["study", "knowledge"],
    "career-pressure": ["success", "purpose"],
    "time-management": ["time"],
    "dopamine-distraction": ["focus", "time"],
    loneliness: ["loneliness", "friendship"],
    "identity-crisis": ["purpose"],
    "validation-addiction": ["friendship"],
    overthinking: ["anxiety", "patience"],
    purpose: ["purpose", "success"],
    "self-respect": ["character", "discipline"],
    "emotional-discipline": ["anger", "patience", "discipline"],
    "haram-relationships": ["friendship", "character"],
  };

  const tags = tagFallback[topicSlug] ?? [];
  return all.filter((w) => w.tags?.some((t) => tags.includes(t.toLowerCase())));
}

export async function getArticlesByCornerTopic(topicSlug: string): Promise<Article[]> {
  const all = await getAllArticles();
  return all.filter((a) => a.corner_topics?.includes(topicSlug));
}

export function getSavedSlugs(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const saved =
      localStorage.getItem("thenahj-saved") ?? localStorage.getItem("hikmah-saved") ?? "[]";
    return JSON.parse(saved) as string[];
  } catch {
    return [];
  }
}

export function toggleSave(slug: string): boolean {
  const saved = getSavedSlugs();
  const exists = saved.includes(slug);
  const next = exists ? saved.filter((s) => s !== slug) : [...saved, slug];
  localStorage.setItem("thenahj-saved", JSON.stringify(next));
  return !exists;
}

export async function toggleSaveAsync(slug: string): Promise<boolean> {
  const isSaved = toggleSave(slug);

  if (isSupabaseConfigured && supabase) {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      await fetch('/api/saved', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ slug, action: isSaved ? 'save' : 'unsave' })
      }).catch(console.error);
    }
  }

  return isSaved;
}

export async function syncSavedSlugs(): Promise<void> {
  if (!isSupabaseConfigured || !supabase || typeof window === "undefined") return;
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    try {
      const res = await fetch('/api/saved', {
        headers: { 'Authorization': `Bearer session.access_token` }
      });
      if (res.ok) {
        const { saved } = await res.json();
        if (Array.isArray(saved)) {
          localStorage.setItem("thenahj-saved", JSON.stringify(saved));
        }
      }
    } catch {}
  }
}
