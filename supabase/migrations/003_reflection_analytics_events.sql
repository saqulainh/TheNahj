CREATE TABLE IF NOT EXISTS reflection_analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_slug TEXT NOT NULL,
  event_type TEXT NOT NULL,
  question_index INTEGER,
  step_index INTEGER,
  checked BOOLEAN,
  completed_steps INTEGER,
  total_steps INTEGER,
  client_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reflection_analytics_created_at ON reflection_analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reflection_analytics_article_slug ON reflection_analytics_events(article_slug);
CREATE INDEX IF NOT EXISTS idx_reflection_analytics_event_type ON reflection_analytics_events(event_type);

ALTER TABLE reflection_analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anon insert reflection analytics" ON reflection_analytics_events
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Anon read reflection analytics" ON reflection_analytics_events
  FOR SELECT TO anon USING (true);

CREATE POLICY "Authenticated insert reflection analytics" ON reflection_analytics_events
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated read reflection analytics" ON reflection_analytics_events
  FOR SELECT TO authenticated USING (true);
