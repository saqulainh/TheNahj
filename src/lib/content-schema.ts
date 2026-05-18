import { z } from "zod";

export const unifiedCategories = [
  "Imam Ali Says",
  "Student Corner",
  "Youth Corner",
  "Nahjul Balagha",
  "Articles",
  "Audio Reflections",
  "Self Discipline",
  "Relationships",
  "Focus",
  "Productivity",
  "Modern Issues",
  "Reflection",
  "Knowledge",
  "Spirituality",
] as const;

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

export const articlePayloadSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(5, "Title is required"),
  slug: z.string().min(3, "Slug is required"),
  excerpt: z.string().min(12, "Excerpt is required"),
  category: z.enum(unifiedCategories),
  tags: z.array(z.string()).default([]),
  layout_type: z.string().default("editorial"),
  featured_image: z.string().optional().nullable(),
  hero_image: z.string().optional().nullable(),
  sidebar_banner: z.string().optional().nullable(),
  content_blocks: z.array(contentBlockSchema).min(1, "At least one block is required"),
  arabic_content: z.string().optional().nullable(),
  english_content: z.string().optional().nullable(),
  urdu_content: z.string().optional().nullable(),
  reading_time: z.number().int().nonnegative().default(0),
  featured: z.boolean().default(false),
  seo_title: z.string().optional().nullable(),
  seo_description: z.string().optional().nullable(),
  schedule_publish_at: z.string().optional().nullable(),
  status: z.enum(["draft", "scheduled", "published"]).default("draft"),
});

export type ArticlePayload = z.infer<typeof articlePayloadSchema>;
export type ContentBlock = z.infer<typeof contentBlockSchema>;
