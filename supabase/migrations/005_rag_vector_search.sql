-- TheNahj RAG vector search (pgvector extension, embeddings table, RPC function)
-- RUN THIS IN SUPABASE SQL EDITOR (or supabase db push). Idempotent — safe to re-run.

-- 1. Enable pgvector extension
create extension if not exists vector;

-- 2. Wisdom embeddings table
create table if not exists wisdom_embeddings (
  id uuid primary key default gen_random_uuid(),
  content text not null,
  metadata jsonb not null default '{}'::jsonb,
  embedding vector(768),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. HNSW index for fast cosine similarity search
create index if not exists wisdom_embeddings_embedding_idx
on wisdom_embeddings
using hnsw (embedding vector_cosine_ops);

-- 4. RLS + read policy (idempotent)
alter table wisdom_embeddings enable row level security;
drop policy if exists "Anon read wisdom embeddings" on wisdom_embeddings;
create policy "Anon read wisdom embeddings"
on wisdom_embeddings for select
to anon using (true);

-- 5. RPC function for cosine similarity search
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