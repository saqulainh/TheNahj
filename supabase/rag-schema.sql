-- ─── RAG Vector Extension & Table Setup ─────────────────────────────────────
-- Enable the pgvector extension for high-performance vector similarity search
create extension if not exists vector;

-- Create the wisdom_embeddings table for storing vector chunks of Nahjul Balagha & site content
create table if not exists wisdom_embeddings (
  id uuid primary key default gen_random_uuid(),
  content text not null,
  metadata jsonb not null default '{}'::jsonb, -- e.g., { title, source, slug, category, type: "sermon"|"saying"|"letter"|"article" }
  embedding vector(768), -- Dimensions for Gemini embedding-001 (or 1536 for OpenAI)
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Index for ultra-fast HNSW vector search
create index if not exists wisdom_embeddings_embedding_idx 
on wisdom_embeddings 
using hnsw (embedding vector_cosine_ops);

-- Enable RLS
alter table wisdom_embeddings enable row level security;

-- Public read access policy
create policy "Anon read wisdom embeddings" 
on wisdom_embeddings for select 
to anon using (true);

-- ─── RPC Function for Cosine Similarity Search ────────────────────────────────
create or replace function match_wisdom_embeddings(
  query_embedding vector(768),
  match_threshold float default 0.4,
  match_count int default 5
)
returns table (
  id uuid,
  content text,
  metadata jsonb,
  similarity float
)
language sql stable
as $$
  select
    wisdom_embeddings.id,
    wisdom_embeddings.content,
    wisdom_embeddings.metadata,
    1 - (wisdom_embeddings.embedding <=> query_embedding) as similarity
  from wisdom_embeddings
  where 1 - (wisdom_embeddings.embedding <=> query_embedding) > match_threshold
  order by wisdom_embeddings.embedding <=> query_embedding
  limit match_count;
$$;
