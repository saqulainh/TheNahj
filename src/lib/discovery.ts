import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { inferThemeTopicFromTagsForSection, slugifyTaxonomy } from "@/lib/taxonomy";
import { topicExperienceBySlug } from "@/lib/content-experience";

type DiscoveryKind = "wisdom" | "article";

export interface DiscoveryItem {
  kind: DiscoveryKind;
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  section: string;
  theme: string | null;
  topic: string | null;
  tags: string[];
  audiences: string[];
  source?: string | null;
  sourceNumber?: string | null;
  bookName?: string | null;
  readingTime?: number | null;
  publishedAt?: string | null;
  featured?: boolean;
}

export interface DiscoverySearchResult extends DiscoveryItem {
  score: number;
  reasons: string[];
}

export interface DiscoveryObservability {
  query: string;
  tokenCount: number;
  totalCandidates: number;
  matched: number;
  sourceCounts: Record<DiscoveryKind, number>;
  sectionCounts: Record<string, number>;
  reasonCounts: Record<string, number>;
}

function normalizeText(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9\s]+/g, " ").replace(/\s+/g, " ").trim();
}

function normalizeArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string").map((item) => item.trim()).filter(Boolean) : [];
}

function includesAny(haystack: string, tokens: string[]) {
  return tokens.some((token) => haystack.includes(token));
}

function toTitleFallback(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function inferAudiences(section: string, tags: string[], sourceTags: string[] = []): string[] {
  const normalized = normalizeArray([...tags, ...sourceTags]);
  const audiences = new Set<string>();
  const sectionSlug = slugifyTaxonomy(section);

  if (sectionSlug.includes("student") || normalized.some((tag) => tag.includes("student") || tag.includes("exam") || tag.includes("study"))) {
    audiences.add("student");
  }
  if (sectionSlug.includes("youth") || normalized.some((tag) => tag.includes("youth") || tag.includes("identity") || tag.includes("relationships"))) {
    audiences.add("youth");
  }
  if (audiences.size === 0) audiences.add("general");
  return Array.from(audiences);
}

function toDiscoveryItemFromWisdomCard(row: Record<string, any>): DiscoveryItem {
  const metadata = row.metadata || {};
  const section = typeof row.section === "string" ? row.section : "Imam Ali Says";
  const tags = normalizeArray(metadata.tags);

  return {
    kind: "wisdom",
    id: String(row.id),
    slug: String(row.slug || row.article_slug || ""),
    title: toTitleFallback(row.title, row.slug || "Wisdom"),
    excerpt: typeof row.excerpt === "string" ? row.excerpt : "",
    section,
    theme: typeof row.theme === "string" ? row.theme : null,
    topic: typeof row.topic === "string" ? row.topic : null,
    tags,
    audiences: normalizeArray(row.audiences),
    source: typeof row.source === "string" ? row.source : null,
    sourceNumber: typeof row.source_number === "string" ? row.source_number : null,
    bookName: typeof row.book_name === "string" ? row.book_name : null,
    readingTime: Number.isFinite(Number(row.reading_time)) ? Number(row.reading_time) : null,
    publishedAt: typeof row.published_at === "string" ? row.published_at : null,
    featured: Boolean(row.featured),
  };
}

function toDiscoveryItemFromUnified(row: Record<string, any>): DiscoveryItem {
  const section = typeof row.category === "string" ? row.category : "Imam Ali Says";
  const inferred = inferThemeTopicFromTagsForSection(section, normalizeArray(row.tags));

  return {
    kind: "article",
    id: String(row.id),
    slug: String(row.slug || ""),
    title: toTitleFallback(row.title, row.slug || "Article"),
    excerpt: typeof row.excerpt === "string" ? row.excerpt : "",
    section,
    theme: inferred.theme,
    topic: inferred.topic,
    tags: normalizeArray(row.tags),
    audiences: inferAudiences(section, normalizeArray(row.tags)),
    source: typeof row.source === "string" ? row.source : null,
    sourceNumber: typeof row.source_number === "string" ? row.source_number : null,
    bookName: typeof row.book_name === "string" ? row.book_name : null,
    readingTime: Number.isFinite(Number(row.reading_time)) ? Number(row.reading_time) : null,
    publishedAt: typeof row.published_at === "string" ? row.published_at : null,
    featured: Boolean(row.featured),
  };
}

async function loadDiscoveryCandidates(section?: string | null): Promise<DiscoveryItem[]> {
  const items: DiscoveryItem[] = [];

  if (isSupabaseConfigured && supabase) {
    try {
      let query = supabase
        .from("wisdom_cards")
        .select("id,article_slug,section,theme,topic,audiences,title,excerpt,slug,reading_time,featured,published_at,source,source_number,book_name,metadata,status")
        .eq("status", "published");

      if (section) query = query.eq("section", section);

      const { data, error } = await query;
      if (!error && data?.length) {
        items.push(...data.map((row) => toDiscoveryItemFromWisdomCard(row as Record<string, any>)));
      }
    } catch {
      // best-effort: wisdom_cards may not exist yet
    }

    try {
      let query = supabase
        .from("articles_unified")
        .select("id,title,slug,excerpt,category,tags,reading_time,featured,published_at,source,source_number,book_name,status")
        .eq("status", "published");

      if (section) query = query.eq("category", section);

      const { data, error } = await query;
      if (!error && data?.length) {
        items.push(...data.map((row) => toDiscoveryItemFromUnified(row as Record<string, any>)));
      }
    } catch {
      // ignore fallback query issues
    }
  }

  const seen = new Set<string>();
  return items.filter((item) => {
    const key = `${item.kind}:${item.slug}`;
    if (!item.slug || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function tokenScore(text: string, tokens: string[]) {
  let score = 0;
  tokens.forEach((token) => {
    if (!token) return;
    if (text === token) score += 180;
    else if (text.startsWith(token)) score += 90;
    else if (text.includes(token)) score += 35;
  });
  return score;
}

function scoreSearchCandidate(query: string, tokens: string[], item: DiscoveryItem) {
  const reasons: string[] = [];
  const haystack = normalizeText(
    [
      item.title,
      item.excerpt,
      item.section,
      item.theme || "",
      item.topic || "",
      item.source || "",
      item.sourceNumber || "",
      item.bookName || "",
      ...(item.tags || []),
    ].join(" ")
  );

  const title = normalizeText(item.title);
  const excerpt = normalizeText(item.excerpt);
  const section = normalizeText(item.section);
  const theme = normalizeText(item.theme || "");
  const topic = normalizeText(item.topic || "");
  const tags = normalizeArray(item.tags).map(normalizeText);
  const audiences = normalizeArray(item.audiences).map(normalizeText);

  let score = 0;

  if (title === query) {
    score += 900;
    reasons.push("exact-title");
  } else if (title.includes(query)) {
    score += 420;
    reasons.push("title-match");
  }

  if (excerpt.includes(query)) {
    score += 140;
    reasons.push("excerpt-match");
  }

  if (section.includes(query)) {
    score += 180;
    reasons.push("section-match");
  }

  if (theme.includes(query)) {
    score += 160;
    reasons.push("theme-match");
  }

  if (topic.includes(query)) {
    score += 220;
    reasons.push("topic-match");
  }

  const tokenHits = tokens.reduce((count, token) => count + (includesAny(haystack, [token]) ? 1 : 0), 0);
  if (tokenHits > 0) {
    score += tokenHits * 28;
    reasons.push("keyword-match");
  }

  const tagHits = tags.filter((tag) => tokens.some((token) => tag.includes(token))).length;
  if (tagHits > 0) {
    score += tagHits * 32;
    reasons.push("tag-match");
  }

  const audienceHits = audiences.filter((audience) => tokens.includes(audience)).length;
  if (audienceHits > 0) {
    score += audienceHits * 55;
    reasons.push("audience-match");
  }

  const intentSlug = slugifyTaxonomy(query);
  const relatedSlugs = topicExperienceBySlug[intentSlug]?.relatedTopics || [];
  const relatedTopicMatches = relatedSlugs.filter((slug) => topic === slug || tags.includes(slug) || tokens.some((token) => slug.includes(token))).length;
  if (relatedTopicMatches > 0) {
    score += relatedTopicMatches * 45;
    reasons.push("related-topic");
  }

  if (item.featured) {
    score += 12;
    reasons.push("featured");
  }

  return { score, reasons };
}

export async function searchDiscoveryContent(query: string, options?: { section?: string | null; limit?: number }) {
  const normalizedQuery = normalizeText(query);
  const tokens = normalizedQuery.split(" ").filter(Boolean);
  const limit = options?.limit || 12;
  const section = options?.section || null;

  const candidates = await loadDiscoveryCandidates(section);
  const ranked = candidates
    .map((item) => {
      const { score, reasons } = scoreSearchCandidate(normalizedQuery, tokens, item);
      return { ...item, score, reasons };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || String(b.publishedAt || "").localeCompare(String(a.publishedAt || "")))
    .slice(0, limit);

  const observability: DiscoveryObservability = {
    query,
    tokenCount: tokens.length,
    totalCandidates: candidates.length,
    matched: ranked.length,
    sourceCounts: { wisdom: 0, article: 0 },
    sectionCounts: {},
    reasonCounts: {},
  };

  candidates.forEach((item) => {
    observability.sourceCounts[item.kind] += 1;
    observability.sectionCounts[item.section] = (observability.sectionCounts[item.section] || 0) + 1;
  });

  ranked.forEach((item) => {
    item.reasons.forEach((reason) => {
      observability.reasonCounts[reason] = (observability.reasonCounts[reason] || 0) + 1;
    });
  });

  return { query, results: ranked, observability };
}

export function scoreRelatedDiscoveryCandidate(params: { current: DiscoveryItem; candidate: DiscoveryItem }) {
  const { current, candidate } = params;
  if (candidate.slug === current.slug && candidate.kind === current.kind) {
    return { score: 0, reasons: [] as string[] };
  }

  const currentTax = inferThemeTopicFromTagsForSection(current.section, current.tags || []);
  const candidateTax = inferThemeTopicFromTagsForSection(candidate.section, candidate.tags || []);

  const currentTopicSlug = current.topic ? slugifyTaxonomy(current.topic) : currentTax.topic ? slugifyTaxonomy(currentTax.topic) : null;
  const candidateTopicSlug = candidate.topic ? slugifyTaxonomy(candidate.topic) : candidateTax.topic ? slugifyTaxonomy(candidateTax.topic) : null;
  const currentThemeSlug = current.theme ? slugifyTaxonomy(current.theme) : currentTax.theme ? slugifyTaxonomy(currentTax.theme) : null;
  const candidateThemeSlug = candidate.theme ? slugifyTaxonomy(candidate.theme) : candidateTax.theme ? slugifyTaxonomy(candidateTax.theme) : null;
  const currentSectionSlug = slugifyTaxonomy(current.section);
  const candidateSectionSlug = slugifyTaxonomy(candidate.section);
  const currentTags = normalizeArray(current.tags).map(slugifyTaxonomy);
  const candidateTags = normalizeArray(candidate.tags).map(slugifyTaxonomy);
  const currentAudiences = normalizeArray(current.audiences).map(slugifyTaxonomy);
  const candidateAudiences = normalizeArray(candidate.audiences).map(slugifyTaxonomy);

  const reasons: string[] = [];
  let score = 0;

  if (currentSectionSlug === candidateSectionSlug) {
    score += 120;
    reasons.push("same-section");
  }

  if (currentTopicSlug && candidateTopicSlug && currentTopicSlug === candidateTopicSlug) {
    score += 900;
    reasons.push("same-topic");
  }

  if (currentThemeSlug && candidateThemeSlug && currentThemeSlug === candidateThemeSlug) {
    score += 420;
    reasons.push("same-theme");
  }

  const sharedAudience = currentAudiences.filter((audience) => candidateAudiences.includes(audience));
  if (sharedAudience.length > 0) {
    score += sharedAudience.includes("student") || sharedAudience.includes("youth") ? 220 : 80;
    reasons.push("same-audience");
  }

  const relatedTopicSlugs = currentTopicSlug ? (topicExperienceBySlug[currentTopicSlug]?.relatedTopics || []) : [];
  if (candidateTopicSlug && relatedTopicSlugs.includes(candidateTopicSlug)) {
    score += 180;
    reasons.push("related-concept");
  }

  const sharedTags = candidateTags.filter((tag) => currentTags.includes(tag));
  if (sharedTags.length > 0) {
    score += Math.min(sharedTags.length, 4) * 34;
    reasons.push("shared-tags");
  }

  return { score, reasons };
}
