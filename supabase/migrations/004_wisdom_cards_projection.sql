-- TheNahj wisdom card projection table
-- Run this in Supabase SQL Editor

create table if not exists wisdom_cards (
  id uuid primary key default uuid_generate_v4(),
  article_slug text not null unique,
  section text not null,
  theme text,
  topic text,
  audiences text[] default '{}',
  title text not null,
  excerpt text not null default '',
  slug text not null unique,
  arabic_text text not null default '',
  urdu_translation text not null default '',
  english_translation text not null default '',
  source text not null default '',
  source_number text default '',
  book_name text default '',
  featured_image text,
  hero_image text,
  sidebar_banner text,
  reading_time integer default 0,
  status text not null default 'draft' check (status in ('draft', 'scheduled', 'published')),
  featured boolean default false,
  published_at timestamptz,
  updated_at timestamptz default now(),
  metadata jsonb default '{}'::jsonb
);

create index if not exists idx_wisdom_cards_section on wisdom_cards(section);
create index if not exists idx_wisdom_cards_status on wisdom_cards(status);
create index if not exists idx_wisdom_cards_slug on wisdom_cards(slug);
create index if not exists idx_wisdom_cards_updated on wisdom_cards(updated_at desc);

alter table wisdom_cards enable row level security;
create policy "Public read wisdom cards" on wisdom_cards for select using (status = 'published');
create policy "Admin full access wisdom cards" on wisdom_cards for all using (auth.role() = 'authenticated');
create policy "Anon read all wisdom cards" on wisdom_cards for select to anon using (true);
create policy "Anon write all wisdom cards" on wisdom_cards for all to anon using (true) with check (true);