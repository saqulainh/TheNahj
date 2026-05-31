import type { Article, Category, Wisdom } from "@/lib/types";
import { isSupabaseConfigured, supabase } from "./supabase";

function attachCategory(wisdom: Wisdom, categories: Category[]): Wisdom {
  const category = categories.find((c) => c.id === wisdom.category_id);
  return { ...wisdom, category };
}

export async function getCategories(): Promise<Category[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from("categories").select("*").order("name");
    if (!error && data?.length) return data as Category[];
  }
  return [];
}

export async function getAllWisdom(): Promise<Wisdom[]> {
  const categories = await getCategories();

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from("wisdom")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data?.length) {
      return (data as Wisdom[]).map((w) => attachCategory(w, categories));
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

export async function getAllArticles(): Promise<Article[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data?.length) return data as Article[];
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
  return all.filter((w) => w.tags?.some((t) => tags.includes(t)));
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
        headers: { 'Authorization': `Bearer ${session.access_token}` }
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
