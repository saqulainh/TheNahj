import type { Article, Category, Wisdom } from "@/lib/types";
import { isSupabaseConfigured, supabase } from "./supabase";

const LIFE_THEME_SEED: Category[] = [
  { id: "self-discipline", name: "Self Discipline", slug: "self-discipline" },
  { id: "leadership", name: "Leadership", slug: "leadership" },
  { id: "justice", name: "Justice", slug: "justice" },
  { id: "knowledge", name: "Knowledge", slug: "knowledge" },
  { id: "patience", name: "Patience", slug: "patience" },
  { id: "character", name: "Character", slug: "character" },
  { id: "purpose", name: "Purpose", slug: "purpose" },
  { id: "relationships", name: "Relationships", slug: "relationships" },
  { id: "time-management", name: "Time Management", slug: "time-management" },
  { id: "spiritual-growth", name: "Spiritual Growth", slug: "spiritual-growth" },
];

const THEME_ALIAS: Record<string, string> = {
  "discipline": "self-discipline",
  "self-control": "self-discipline",
  "leadership": "leadership",
  "justice": "justice",
  "knowledge": "knowledge",
  "study": "knowledge",
  "patience": "patience",
  "character": "character",
  "purpose": "purpose",
  "friendship": "relationships",
  "relationships": "relationships",
  "relationship": "relationships",
  "time": "time-management",
  "focus": "time-management",
  "productivity": "time-management",
  "spirituality": "spiritual-growth",
  "spiritual": "spiritual-growth",
};

function normalizeSlug(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function resolveThemeFromTags(tags: string[]): Category {
  for (const tag of tags) {
    const mapped = THEME_ALIAS[normalizeSlug(tag)];
    if (mapped) {
      const found = LIFE_THEME_SEED.find((t) => t.slug === mapped);
      if (found) return found;
    }
  }
  return LIFE_THEME_SEED[0] as Category;
}

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

  // Keep life themes stable; do not replace master themes with individual post tags.
  const merged = LIFE_THEME_SEED.map((theme) => {
    const dbMatch = dbCategories.find((c) => normalizeSlug(c.slug) === theme.slug || normalizeSlug(c.name) === theme.slug);
    return dbMatch
      ? { ...dbMatch, name: theme.name, slug: theme.slug, id: dbMatch.id || theme.id }
      : theme;
  });

  return merged;
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
        .in("category", ["Imam Ali Says", "Nahjul Balagha", "Audio Reflections", "Student Corner", "Youth Corner"])
        .order("published_at", { ascending: false });

      if (!error && data?.length) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return data.map((row: any) => {
          const tags = row.tags ?? [];
          const resolved = resolveThemeFromTags(tags);
          const categoryObj = dbCategories.find((c) => c.slug === resolved.slug) || resolved;

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
            corner_topics: tags.map((t: string) => normalizeSlug(t)),
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

export const fallbackWisdom: Wisdom = {
  id: "welcome-wisdom",
  slug: "welcome-to-thenahj",
  arabic_text: "العِلْمُ كَنْزٌ عَظِيمٌ لاَ يَفْنَى",
  urdu_translation: "علم ایک ایسا عظیم خزانہ ہے جو کبھی ختم نہیں ہوتا۔",
  english_translation: "Knowledge is a great treasure that never perishes.",
  short_reflection: "A single step toward knowledge is a step toward self-discovery.",
  deep_reflection: "Welcome to TheNahj. Start your journey by publishing your first wisdom cards from the admin Content Studio.",
  simple_meaning: "Knowledge is a light that guides your path.",
  why_today: "In a world of noise, seeking authentic knowledge is your greatest strength.",
  reflection_questions: ["What is one thing I want to learn today?"],
  action_steps: ["Read one page of a beneficial book today."],
  source: "Ghurar al-Hikam",
  category_id: "general",
  category: { id: "general", name: "General", slug: "general" },
  created_at: new Date().toISOString(),
};

export async function getDailyWisdom(): Promise<Wisdom> {
  const all = await getAllWisdom();
  if (all.length === 0) return fallbackWisdom;
  const dayIndex = new Date().getDate() % all.length;
  return all[dayIndex] ?? all[0] ?? fallbackWisdom;
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
 * Fetch all published articles (strictly in Articles category).
 */
export async function getAllArticles(): Promise<Article[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("articles_unified")
        .select("*")
        .eq("status", "published")
        .in("category", ["Articles"])
        .order("published_at", { ascending: false });

      if (!error && data?.length) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  const matched = all.filter((a) => a.corner_topics?.includes(topicSlug));
  if (matched.length > 0) return matched;

  const tagFallback: Record<string, string[]> = {
    "focus-productivity": ["focus", "productivity", "study", "knowledge", "time"],
    "exam-anxiety": ["anxiety", "patience", "study", "exam", "exams"],
    "social-media-addiction": ["time", "focus", "social media", "addiction"],
    laziness: ["study", "knowledge", "laziness"],
    "career-pressure": ["success", "purpose", "career", "pressure"],
    "time-management": ["time", "management"],
    "dopamine-distraction": ["focus", "time", "dopamine", "distraction"],
    loneliness: ["loneliness", "friendship"],
    "identity-crisis": ["purpose", "identity", "crisis"],
    "validation-addiction": ["friendship", "validation", "approval"],
    overthinking: ["anxiety", "patience", "overthinking"],
    purpose: ["purpose", "success"],
    "self-respect": ["character", "discipline", "self-respect", "respect"],
    "emotional-discipline": ["anger", "patience", "discipline", "emotion", "emotions"],
    "haram-relationships": ["friendship", "character", "relationship", "relationships", "haram"],
  };

  const tags = tagFallback[topicSlug] ?? [];
  return all.filter((a) => a.corner_topics?.some((t) => tags.includes(t.toLowerCase())));
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
