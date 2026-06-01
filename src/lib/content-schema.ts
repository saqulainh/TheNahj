import { z } from "zod";

export const unifiedCategories = [
  "Imam Ali Says",
  "Student Corner",
  "Youth Corner",
  "Nahjul Balagha",
  "Articles",
  "Audio Reflections",
] as const;

/* ─────────────────────────────────────────────
   Legacy block types (kept for backward compat)
   ───────────────────────────────────────────── */
export const blockTypes = [
  "heading",
  "paragraph",
  "arabic_quote",
  "urdu_translation",
  "english_translation",
  "reflection_block",
  "highlight_quote",
  "verse_block",
  "hadith_block",
  "image_block",
  "callout",
  "divider",
  "question_block",
  "modern_relevance",
  "side_note",
  "timeline",
] as const;

export const contentBlockSchema = z.object({
  id: z.string().min(1),
  type: z.enum(blockTypes),
  value: z.string().optional(),
  values: z.array(z.string()).optional(),
  mediaId: z.string().optional(),
  mediaUrl: z.string().optional(),
  meta: z.record(z.string(), z.any()).optional(),
});

/* ─────────────────────────────────────────────
   Narration schema — repeatable entries
   ───────────────────────────────────────────── */
export const narrationSchema = z.object({
  id: z.string().min(1),
  // Split fields for better narration structure
  arabic: z.string().default(""),
  translation: z.string().default(""),
  urdu: z.string().default(""),
  narrator: z.string().default("") ,
  source: z.string().default(""),
  explanation: z.string().default(""),
});

export type Narration = z.infer<typeof narrationSchema>;

/* ─────────────────────────────────────────────
   Wisdom Article Schema (Structured Sections)
   ───────────────────────────────────────────── */
export const wisdomArticleSchema = z.object({
  id: z.string().uuid().optional(),

  // ── Section 1: Basic Information ──
  title: z.string().min(5, "Title is required"),
  slug: z.string().min(3, "Slug is required"),
  excerpt: z.string().min(12, "Excerpt is required"),
  category: z.enum(unifiedCategories),
  theme: z.string().optional().nullable(),
  topic: z.string().optional().nullable(),
  audiences: z.array(z.enum(["student", "youth", "general"])) .optional().default(["general"]),
  tags: z.array(z.string()).default([]),
  featured_image: z.string().optional().nullable(),
  hero_image: z.string().optional().nullable(),
  sidebar_banner: z.string().optional().nullable(),
  hero_focal_point: z.object({ x: z.number().min(0).max(100), y: z.number().min(0).max(100) }).optional().nullable(),
  featured_focal_point: z.object({ x: z.number().min(0).max(100), y: z.number().min(0).max(100) }).optional().nullable(),
  sidebar_focal_point: z.object({ x: z.number().min(0).max(100), y: z.number().min(0).max(100) }).optional().nullable(),
  reading_time: z.number().int().nonnegative().default(0),
  status: z.enum(["draft", "scheduled", "published"]).default("draft"),
  featured: z.boolean().default(false),
  schedule_publish_at: z.string().optional().nullable(),

  // ── Section 2: Original Wisdom Content ──
  arabic_text: z.string().default(""),
  urdu_translation: z.string().default(""),
  english_translation: z.string().default(""),
  source: z.string().default(""),
  source_number: z.string().default(""),
  book_name: z.string().default(""),

  // ── Section 3: Explanation Area ──
  main_explanation: z.string().default(""),
  detailed_explanation: z.string().default(""),
  tafseer: z.string().default(""),
  historical_context: z.string().default(""),

  // ── Section 4: Related Narrations (repeatable) ──
  narrations: z.array(narrationSchema).default([]),

  // ── Section 5: Modern Relevance ──
  current_issues: z.string().default(""),
  youth_relevance: z.string().default(""),
  student_relevance: z.string().default(""),
  practical_application: z.string().default(""),

  // ── Section 6: Reflection ──
  reflection_questions: z.string().default(""),
  action_steps: z.string().default(""),
  personal_reflection: z.string().default(""),

  // ── Section 7: Conclusion ──
  summary: z.string().default(""),
  closing_reflection: z.string().default(""),

  // ── Section 8: SEO ──
  seo_title: z.string().optional().nullable(),
  seo_description: z.string().optional().nullable(),

  // ── Legacy compat (optional, for old articles) ──
  layout_type: z.string().default("wisdom-editorial"),
  content_blocks: z.array(contentBlockSchema).optional().default([]),
  arabic_content: z.string().optional().nullable(),
  english_content: z.string().optional().nullable(),
  urdu_content: z.string().optional().nullable(),
});

export type WisdomArticle = z.infer<typeof wisdomArticleSchema>;

/* ─── Legacy type alias ─── */
export const articlePayloadSchema = wisdomArticleSchema;
export type ArticlePayload = WisdomArticle;
export type ContentBlock = z.infer<typeof contentBlockSchema>;
