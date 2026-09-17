-- 006_rag_hybrid_fts.sql
-- Adds Full-Text Search capabilities and Hybrid Search to wisdom_embeddings

-- 1. Add tsvector column for FTS
ALTER TABLE wisdom_embeddings 
ADD COLUMN IF NOT EXISTS fts tsvector 
GENERATED ALWAYS AS (to_tsvector('english', content || ' ' || coalesce(metadata->>'source', ''))) STORED;

-- 2. Create GIN index on the new fts column
CREATE INDEX IF NOT EXISTS wisdom_embeddings_fts_idx ON wisdom_embeddings USING GIN (fts);

-- 3. Create hybrid search RPC
CREATE OR REPLACE FUNCTION hybrid_search_wisdom(
  query_text text,
  query_embedding vector(1536),
  match_count int DEFAULT 5,
  filter_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS TABLE (
  id uuid,
  content text,
  metadata jsonb,
  similarity float,
  rank real
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH semantic_search AS (
    SELECT
      we.id,
      we.content,
      we.metadata,
      1 - (we.embedding <=> query_embedding) as similarity,
      0::real as rank
    FROM wisdom_embeddings we
    WHERE (filter_metadata = '{}'::jsonb OR we.metadata @> filter_metadata)
    ORDER BY we.embedding <=> query_embedding
    LIMIT match_count * 2
  ),
  lexical_search AS (
    SELECT
      we.id,
      we.content,
      we.metadata,
      0::float as similarity,
      ts_rank(we.fts, websearch_to_tsquery('english', query_text)) as rank
    FROM wisdom_embeddings we
    WHERE we.fts @@ websearch_to_tsquery('english', query_text)
      AND (filter_metadata = '{}'::jsonb OR we.metadata @> filter_metadata)
    ORDER BY rank DESC
    LIMIT match_count * 2
  )
  SELECT
    COALESCE(s.id, l.id) as id,
    COALESCE(s.content, l.content) as content,
    COALESCE(s.metadata, l.metadata) as metadata,
    MAX(COALESCE(s.similarity, 0)) as similarity,
    MAX(COALESCE(l.rank, 0)) as rank
  FROM semantic_search s
  FULL OUTER JOIN lexical_search l ON s.id = l.id
  GROUP BY COALESCE(s.id, l.id), COALESCE(s.content, l.content), COALESCE(s.metadata, l.metadata)
  -- Simple formula to combine similarity and rank (can be tuned)
  ORDER BY (MAX(COALESCE(s.similarity, 0)) * 0.7) + (MAX(COALESCE(l.rank, 0)) * 0.3) DESC
  LIMIT match_count;
END;
$$;
