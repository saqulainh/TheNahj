export type TaxonomySection =
  | "Imam Ali Says"
  | "Nahjul Balagha"
  | "Ahlul Bayt (AS)"
  | "Khilafat"
  | "Important Events"
  | "Student Corner"
  | "Youth Corner"
  | "Future Knowledge Sections"
  | string;

export interface SectionTaxonomyConfig {
  themes: readonly string[];
  topics: Record<string, readonly string[]>;
}

export const SECTION_TAXONOMY: Record<string, SectionTaxonomyConfig> = {
  "Imam Ali Says": {
    themes: [
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
    ],
    topics: {
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
    },
  },
  "Nahjul Balagha": {
    themes: ["Sermons", "Letters", "Wisdom Sayings", "Governance", "Spirituality", "Ethics", "Social Justice"],
    topics: {
      Sermons: ["Sermon 1", "Sermon 21", "Sermon 83", "Sermon 192"],
      Letters: ["Letter to Malik al-Ashtar", "Letter 31", "Letter 53"],
      "Wisdom Sayings": ["Wisdom 31", "Wisdom 97", "Wisdom 147"],
      Governance: ["Justice in Rule", "Public Welfare", "Accountability", "Authority"],
      Spirituality: ["Taqwa", "Self Purification", "Prayer", "Remembrance"],
      Ethics: ["Truthfulness", "Humility", "Mercy", "Integrity"],
      "Social Justice": ["Rights", "Fairness", "Oppression", "Community"],
    },
  },
  "Ahlul Bayt (AS)": {
    themes: ["Imam Hasan (AS)", "Imam Husayn (AS)", "Imam Zayn al-Abidin (AS)", "Imam Baqir (AS)", "Imam Jafar al-Sadiq (AS)", "Sayyida Fatima (SA)"],
    topics: {
      "Imam Hasan (AS)": ["Biography", "Teachings", "Character", "Legacy"],
      "Imam Husayn (AS)": ["Biography", "Teachings", "Karbala", "Legacy"],
      "Imam Zayn al-Abidin (AS)": ["Biography", "Teachings", "Duas", "Legacy"],
      "Imam Baqir (AS)": ["Biography", "Teachings", "Knowledge", "Legacy"],
      "Imam Jafar al-Sadiq (AS)": ["Biography", "Teachings", "Knowledge", "Legacy"],
      "Sayyida Fatima (SA)": ["Biography", "Teachings", "Character", "Legacy"],
    },
  },
  Khilafat: {
    themes: ["Early Islamic Governance", "Administrative System", "Justice", "Treasury", "Military Affairs", "Public Welfare"],
    topics: {
      "Early Islamic Governance": ["Policy", "Consultation", "Leadership", "Statecraft"],
      "Administrative System": ["Appointments", "Administration", "Institutions", "Records"],
      Justice: ["Courts", "Rights", "Fairness", "Accountability"],
      Treasury: ["Bayt al-Mal", "Distribution", "Public Funds", "Economic Ethics"],
      "Military Affairs": ["Defense", "Strategy", "Campaigns", "Security"],
      "Public Welfare": ["Poverty", "Social Care", "Community Support", "Service"],
    },
  },
  "Important Events": {
    themes: ["Ghadir", "Karbala", "Saqifa", "Hijrah", "Battle Events", "Historical Milestones"],
    topics: {
      Ghadir: ["Event Summary", "Historical Context", "Teachings", "Impact"],
      Karbala: ["Event Summary", "Historical Context", "Lessons", "Impact"],
      Saqifa: ["Event Summary", "Historical Context", "Debates", "Impact"],
      Hijrah: ["Event Summary", "Historical Context", "Migration", "Impact"],
      "Battle Events": ["Badr", "Uhud", "Khandaq", "Khaybar"],
      "Historical Milestones": ["Timeline", "Context", "Lessons", "Impact"],
    },
  },
  "Student Corner": {
    themes: ["Focus & Productivity", "Study Discipline", "Time Management", "Character", "Confidence", "Purpose"],
    topics: {
      "Focus & Productivity": ["Deep Work", "Concentration", "Routine", "Procrastination"],
      "Study Discipline": ["Exam Preparation", "Consistency", "Revision", "Learning Habits"],
      "Time Management": ["Planning", "Priorities", "Deadlines", "Balance"],
      Character: ["Honesty", "Respect", "Self Control", "Discipline"],
      Confidence: ["Self Worth", "Pressure", "Speaking Up", "Growth Mindset"],
      Purpose: ["Goals", "Identity", "Direction", "Service"],
    },
  },
  "Youth Corner": {
    themes: ["Purpose", "Identity", "Relationships", "Social Media", "Discipline", "Self Improvement"],
    topics: {
      Purpose: ["Direction", "Meaning", "Ambition", "Service"],
      Identity: ["Self Worth", "Belonging", "Beliefs", "Values"],
      Relationships: ["Boundaries", "Friendship", "Marriage", "Respect"],
      "Social Media": ["Attention", "Comparison", "Validation", "Screen Time"],
      Discipline: ["Habits", "Restraint", "Consistency", "Focus"],
      "Self Improvement": ["Growth", "Healing", "Reflection", "Action"],
    },
  },
  "Future Knowledge Sections": {
    themes: ["General"],
    topics: {
      General: ["Overview"],
    },
  },
};

export const IMAM_ALI_THEMES = SECTION_TAXONOMY["Imam Ali Says"].themes as readonly string[];

export const THEME_TOPICS: Record<string, string[]> = Object.fromEntries(
  Object.entries(SECTION_TAXONOMY["Imam Ali Says"].topics).map(([theme, topics]) => [theme, [...topics]])
);

export function slugifyTaxonomy(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function normalizeSection(section?: string | null): string | null {
  if (!section) return null;
  const normalized = slugifyTaxonomy(section);
  const found = Object.keys(SECTION_TAXONOMY).find((key) => slugifyTaxonomy(key) === normalized);
  return found || null;
}

export function getThemesForSection(section?: string | null): string[] {
  const resolved = normalizeSection(section);
  if (!resolved) return [];
  return [...(SECTION_TAXONOMY[resolved]?.themes || [])];
}

export function getTopicsForSection(section: string | null | undefined, theme?: string | null): string[] {
  const resolvedSection = normalizeSection(section);
  if (!resolvedSection || !theme) return [];
  const sectionConfig = SECTION_TAXONOMY[resolvedSection];
  const normalizedTheme = slugifyTaxonomy(theme);
  const resolvedTheme = sectionConfig.themes.find((candidate) => slugifyTaxonomy(candidate) === normalizedTheme);
  if (!resolvedTheme) return [];
  return [...(sectionConfig.topics[resolvedTheme] || [])];
}

export function normalizeTheme(theme?: string | null): string | null {
  if (!theme) return null;
  const normalized = slugifyTaxonomy(theme);
  for (const sectionConfig of Object.values(SECTION_TAXONOMY)) {
    const found = sectionConfig.themes.find((candidate) => slugifyTaxonomy(candidate) === normalized);
    if (found) return found;
  }
  return null;
}

export function normalizeThemeForSection(section: string | null | undefined, theme?: string | null): string | null {
  const themes = getThemesForSection(section);
  if (themes.length === 0 || !theme) return null;
  const normalized = slugifyTaxonomy(theme);
  const found = themes.find((candidate) => slugifyTaxonomy(candidate) === normalized);
  return found || null;
}

export function normalizeTopic(theme: string | null, topic?: string | null): string | null {
  if (!theme || !topic) return null;
  const candidates = THEME_TOPICS[theme] || [];
  const normalized = slugifyTaxonomy(topic);
  const found = candidates.find((t) => slugifyTaxonomy(t) === normalized);
  return found || null;
}

export function normalizeTopicForSection(section: string | null | undefined, theme: string | null, topic?: string | null): string | null {
  const candidates = getTopicsForSection(section, theme);
  if (!theme || !topic || candidates.length === 0) return null;
  const normalized = slugifyTaxonomy(topic);
  const found = candidates.find((candidate) => slugifyTaxonomy(candidate) === normalized);
  return found || null;
}

export function isValidThemeTopic(theme?: string | null, topic?: string | null): boolean {
  const resolvedTheme = normalizeTheme(theme);
  if (!resolvedTheme) return false;
  return !!normalizeTopic(resolvedTheme, topic);
}

export function isValidSectionThemeTopic(section?: string | null, theme?: string | null, topic?: string | null): boolean {
  const resolvedSection = normalizeSection(section);
  if (!resolvedSection) return false;
  const resolvedTheme = normalizeThemeForSection(resolvedSection, theme);
  if (!resolvedTheme) return false;
  return !!normalizeTopicForSection(resolvedSection, resolvedTheme, topic);
}

export function inferThemeTopicFromTags(tags: string[]): { theme: string | null; topic: string | null } {
  return inferThemeTopicFromTagsForSection(null, tags);
}

export function inferThemeTopicFromTagsForSection(section: string | null | undefined, tags: string[]): { theme: string | null; topic: string | null } {
  const normalized = tags.map((t) => slugifyTaxonomy(t));
  const themes = getThemesForSection(section).length > 0 ? getThemesForSection(section) : IMAM_ALI_THEMES;

  for (const theme of themes) {
    const themeSlug = slugifyTaxonomy(theme);
    if (!normalized.includes(themeSlug)) continue;

    const topics = getTopicsForSection(section, theme);
    const topic = topics.find((candidate) => normalized.includes(slugifyTaxonomy(candidate))) || null;
    return { theme, topic };
  }

  for (const theme of themes) {
    const topics = getTopicsForSection(section, theme);
    const topic = topics.find((candidate) => normalized.includes(slugifyTaxonomy(candidate))) || null;
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
