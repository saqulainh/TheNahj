-- Add focal point columns to articles_unified
-- Run this in Supabase SQL Editor or via psql

ALTER TABLE articles_unified
  ADD COLUMN IF NOT EXISTS hero_focal_point JSONB DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS featured_focal_point JSONB DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS sidebar_focal_point JSONB DEFAULT NULL;

-- Optionally backfill existing rows with null objects or defaults if needed
-- UPDATE articles_unified SET hero_focal_point = NULL WHERE hero_focal_point IS NULL;
