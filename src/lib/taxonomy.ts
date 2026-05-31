export const IMAM_ALI_THEMES = [
  "Self Discipline",
  "Leadership",
  "Justice",
  "Knowledge",
  "Patience",
  "Character",
  "Purpose",
  "Relationships",
  "Time Management",
  "Spiritual Growth",
] as const;

export const THEME_TOPICS: Record<string, string[]> = {
  "Self Discipline": ["Focus & Productivity", "Consistency", "Laziness", "Self Control", "Anger Management"],
  "Leadership": ["Responsibility", "Decision Making", "Justice in Leadership", "Trust", "Service"],
  "Justice": ["Fairness", "Rights", "Social Responsibility", "Truth", "Accountability"],
  "Knowledge": ["Learning", "Study Discipline", "Seeking Knowledge", "Critical Thinking", "Teaching"],
  "Patience": ["Sabr in Hardship", "Delayed Gratification", "Exam Stress", "Emotional Stability", "Resilience"],
  "Character": ["Honesty", "Humility", "Respect", "Speech Discipline", "Integrity"],
  "Purpose": ["Direction", "Identity", "Career Pressure", "Meaningful Life", "Service to Others"],
  "Relationships": ["Family", "Friendship", "Boundaries", "Conflict Resolution", "Companionship"],
  "Time Management": ["Priorities", "Planning", "Procrastination", "Routine", "Deep Work"],
  "Spiritual Growth": ["Taqwa", "Salah Discipline", "Dua", "Self Accountability", "Connection with Allah"],
};

export function slugifyTaxonomy(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function normalizeTheme(theme?: string | null): string | null {
  if (!theme) return null;
  const normalized = slugifyTaxonomy(theme);
  const found = IMAM_ALI_THEMES.find((t) => slugifyTaxonomy(t) === normalized);
  return found || null;
}

export function normalizeTopic(theme: string | null, topic?: string | null): string | null {
  if (!theme || !topic) return null;
  const candidates = THEME_TOPICS[theme] || [];
  const normalized = slugifyTaxonomy(topic);
  const found = candidates.find((t) => slugifyTaxonomy(t) === normalized);
  return found || null;
}

export function isValidThemeTopic(theme?: string | null, topic?: string | null): boolean {
  const resolvedTheme = normalizeTheme(theme);
  if (!resolvedTheme) return false;
  return !!normalizeTopic(resolvedTheme, topic);
}

export function inferThemeTopicFromTags(tags: string[]): { theme: string | null; topic: string | null } {
  const normalized = tags.map((t) => slugifyTaxonomy(t));

  for (const theme of IMAM_ALI_THEMES) {
    const themeSlug = slugifyTaxonomy(theme);
    if (!normalized.includes(themeSlug)) continue;

    const topics = THEME_TOPICS[theme] || [];
    const topic = topics.find((t) => normalized.includes(slugifyTaxonomy(t))) || null;
    return { theme, topic };
  }

  for (const theme of IMAM_ALI_THEMES) {
    const topics = THEME_TOPICS[theme] || [];
    const topic = topics.find((t) => normalized.includes(slugifyTaxonomy(t))) || null;
    if (topic) return { theme, topic };
  }

  return { theme: null, topic: null };
}

export function uniqueTagsWithTaxonomy(tags: string[], theme?: string | null, topic?: string | null): string[] {
  const set = new Map<string, string>();
  [...tags, ...(theme ? [theme] : []), ...(topic ? [topic] : [])]
    .map((t) => t.trim())
    .filter(Boolean)
    .forEach((tag) => set.set(tag.toLowerCase(), tag));
  return Array.from(set.values());
}
