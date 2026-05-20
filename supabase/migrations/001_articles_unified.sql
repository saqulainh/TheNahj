-- ============================================
-- TheNahj — articles_unified table migration
-- Run this in Supabase SQL Editor
-- ============================================

CREATE TABLE IF NOT EXISTS articles_unified (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Section 1: Basic Information
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'Imam Ali Says',
  tags TEXT[] DEFAULT '{}',
  featured_image TEXT,
  hero_image TEXT,
  sidebar_banner TEXT,
  reading_time INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'published')),
  featured BOOLEAN DEFAULT false,
  schedule_publish_at TIMESTAMPTZ,

  -- Section 2: Original Wisdom Content
  arabic_text TEXT DEFAULT '',
  urdu_translation TEXT DEFAULT '',
  english_translation TEXT DEFAULT '',
  source TEXT DEFAULT '',
  source_number TEXT DEFAULT '',
  book_name TEXT DEFAULT '',

  -- Section 3: Explanation Area
  main_explanation TEXT DEFAULT '',
  detailed_explanation TEXT DEFAULT '',
  tafseer TEXT DEFAULT '',
  historical_context TEXT DEFAULT '',

  -- Section 4: Related Narrations (stored as JSONB array)
  narrations JSONB DEFAULT '[]'::jsonb,

  -- Section 5: Modern Relevance
  current_issues TEXT DEFAULT '',
  youth_relevance TEXT DEFAULT '',
  student_relevance TEXT DEFAULT '',
  practical_application TEXT DEFAULT '',

  -- Section 6: Reflection
  reflection_questions TEXT DEFAULT '',
  action_steps TEXT DEFAULT '',
  personal_reflection TEXT DEFAULT '',

  -- Section 7: Conclusion
  summary TEXT DEFAULT '',
  closing_reflection TEXT DEFAULT '',

  -- Section 8: SEO
  seo_title TEXT,
  seo_description TEXT,

  -- Legacy compat
  layout_type TEXT DEFAULT 'wisdom-editorial',
  content_blocks JSONB DEFAULT '[]'::jsonb,
  arabic_content TEXT,
  english_content TEXT,
  urdu_content TEXT,

  -- Timestamps
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_articles_unified_category ON articles_unified(category);
CREATE INDEX IF NOT EXISTS idx_articles_unified_status ON articles_unified(status);
CREATE INDEX IF NOT EXISTS idx_articles_unified_slug ON articles_unified(slug);
CREATE INDEX IF NOT EXISTS idx_articles_unified_updated ON articles_unified(updated_at DESC);

-- Enable Row Level Security
ALTER TABLE articles_unified ENABLE ROW LEVEL SECURITY;

-- Public read access for published articles
CREATE POLICY "Public read published" ON articles_unified
  FOR SELECT USING (status = 'published');

-- Authenticated full access (for admin CMS)
CREATE POLICY "Admin full access" ON articles_unified
  FOR ALL USING (auth.role() = 'authenticated');

-- Allow anon read for all statuses (needed for admin panel without auth)
-- Remove this once you add proper auth to admin routes
CREATE POLICY "Anon read all" ON articles_unified
  FOR SELECT TO anon USING (true);

-- Allow anon insert/update/delete (needed for admin panel without auth)
-- Remove this once you add proper auth to admin routes
CREATE POLICY "Anon write all" ON articles_unified
  FOR ALL TO anon USING (true) WITH CHECK (true);

-- ============================================
-- article_revisions table (for revision history)
-- ============================================
CREATE TABLE IF NOT EXISTS article_revisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_slug TEXT NOT NULL,
  title TEXT,
  excerpt TEXT,
  content_blocks JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_revisions_slug ON article_revisions(article_slug);
CREATE INDEX IF NOT EXISTS idx_revisions_created ON article_revisions(created_at DESC);

-- Enable RLS
ALTER TABLE article_revisions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anon read revisions" ON article_revisions FOR SELECT TO anon USING (true);
CREATE POLICY "Anon write revisions" ON article_revisions FOR ALL TO anon USING (true) WITH CHECK (true);
