-- 007_chat_queries_tracking.sql
-- Tracks anonymized user queries to power trending suggested questions

CREATE TABLE IF NOT EXISTS chat_queries (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  query_text text NOT NULL,
  topic text NOT NULL DEFAULT 'general',
  asked_count integer NOT NULL DEFAULT 1,
  last_asked_at timestamptz NOT NULL DEFAULT now()
);

-- Index for fast trending queries (most asked, recent)
CREATE INDEX IF NOT EXISTS chat_queries_count_idx ON chat_queries (asked_count DESC);
CREATE INDEX IF NOT EXISTS chat_queries_last_asked_idx ON chat_queries (last_asked_at DESC);

-- Upsert function: increments count if same query already exists, inserts otherwise.
-- Uses normalized lowercase query text as the unique key.
CREATE OR REPLACE FUNCTION upsert_chat_query(p_query text, p_topic text)
RETURNS void AS $$
BEGIN
  INSERT INTO chat_queries (query_text, topic, asked_count, last_asked_at)
  VALUES (lower(trim(p_query)), p_topic, 1, now())
  ON CONFLICT (query_text)
  DO UPDATE SET
    asked_count = chat_queries.asked_count + 1,
    last_asked_at = now(),
    topic = EXCLUDED.topic;
END;
$$ LANGUAGE plpgsql;

-- Unique constraint on normalized query text (required for ON CONFLICT)
ALTER TABLE chat_queries
  ADD CONSTRAINT chat_queries_query_text_unique UNIQUE (query_text);

-- RPC: get top trending questions from the last 7 days
CREATE OR REPLACE FUNCTION get_trending_questions(limit_count int DEFAULT 8)
RETURNS TABLE (query_text text, topic text, asked_count integer) AS $$
  SELECT query_text, topic, asked_count
  FROM chat_queries
  WHERE last_asked_at > now() - interval '7 days'
  ORDER BY asked_count DESC
  LIMIT limit_count;
$$ LANGUAGE sql;
