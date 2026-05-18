export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Wisdom {
  id: string;
  slug: string;
  arabic_text: string;
  urdu_translation: string;
  english_translation: string;
  short_reflection: string;
  deep_reflection: string;
  simple_meaning?: string;
  why_today?: string;
  reflection_questions?: string[];
  action_steps?: string[];
  source: string;
  category_id: string;
  category?: Category;
  audio_url?: string;
  featured_image?: string;
  tags?: string[];
  corner_topics?: string[];
  related_slugs?: string[];
  created_at: string;
  featured?: boolean;
  trending?: boolean;
  background_type?: "cinematic" | "abstract" | "architectural" | "minimal";
  background_url?: string;
  background_image?: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image?: string;
  seo_description: string;
  type: "reflection" | "story" | "student" | "youth" | "self-improvement" | "wisdom";
  corner_topics?: string[];
  created_at: string;
}

export interface CornerTopic {
  slug: string;
  title: string;
  description: string;
  icon: string;
}

export interface Topic {
  slug: string;
  title: string;
  description: string;
}
