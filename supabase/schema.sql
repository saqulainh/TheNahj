-- TheNahj Platform Schema
-- Run in Supabase SQL Editor

create extension if not exists "uuid-ossp";

create table if not exists categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  created_at timestamptz default now()
);

create table if not exists wisdom (
   id uuid primary key default uuid_generate_v4(),
   slug text not null unique,
   arabic_text text not null,
   urdu_translation text not null,
   english_translation text not null,
   short_reflection text,
   deep_reflection text,
   simple_meaning text,
   why_today text,
   reflection_questions jsonb default '[]',
   action_steps jsonb default '[]',
   source text,
   category_id uuid references categories(id),
   audio_url text,
   featured_image text,
   background_type text,
   background_url text,
   tags text[] default '{}',
   corner_topics text[] default '{}',
   related_slugs text[] default '{}',
   featured boolean default false,
   trending boolean default false,
   created_at timestamptz default now()
 );

create table if not exists articles (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  slug text not null unique,
  excerpt text,
  content text not null,
  cover_image text,
  seo_description text,
  type text default 'reflection',
  corner_topics text[] default '{}',
  created_at timestamptz default now()
);

-- Seed categories
insert into categories (name, slug) values
  ('Discipline', 'discipline'),
  ('Knowledge', 'knowledge'),
  ('Time', 'time'),
  ('Patience', 'patience'),
  ('Leadership', 'leadership'),
  ('Character', 'character'),
  ('Friendship', 'friendship'),
  ('Anger', 'anger'),
  ('Spirituality', 'spirituality'),
  ('Success', 'success')
on conflict (slug) do nothing;

-- RLS: public read, authenticated write (adjust for your admin auth)
-- RLS: public read, authenticated write (adjust for your admin auth)
alter table categories enable row level security;
alter table wisdom enable row level security;
alter table articles enable row level security;

create policy "Public read categories" on categories for select using (true);
create policy "Public read wisdom" on wisdom for select using (true);
create policy "Public read articles" on articles for select using (true);

create policy "Admin write categories" on categories for all using (auth.uid() is not null);
create policy "Admin write wisdom" on wisdom for all using (auth.uid() is not null);
create policy "Admin write articles" on articles for all using (auth.uid() is not null);

-- User Saved Wisdom
create table if not exists saved_wisdom (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  wisdom_slug text not null,
  created_at timestamptz default now(),
  unique(user_id, wisdom_slug)
);

alter table saved_wisdom enable row level security;

create policy "Users can read own saved wisdom" on saved_wisdom for select using (auth.uid() = user_id);
create policy "Users can insert own saved wisdom" on saved_wisdom for insert with check (auth.uid() = user_id);
create policy "Users can delete own saved wisdom" on saved_wisdom for delete using (auth.uid() = user_id);

-- Audio Tracks
create table if not exists audio_tracks (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  subtitle text,
  category text not null,
  duration text,
  audio_url text,
  created_at timestamptz default now()
);

alter table audio_tracks enable row level security;

create policy "Public read audio tracks" on audio_tracks for select using (true);
create policy "Admin write audio tracks" on audio_tracks for all using (auth.uid() is not null);

-- Unified Content Engine (single source for all categories)
create table if not exists articles_unified (
  id uuid primary key default uuid_generate_v4(),

  -- Section 1: Basic Information
  title text not null,
  slug text unique not null,
  excerpt text not null default '',
  category text not null default 'Imam Ali Says',
  tags text[] default '{}',
  featured_image text,
  hero_image text,
  sidebar_banner text,
  hero_focal_point jsonb,
  featured_focal_point jsonb,
  sidebar_focal_point jsonb,
  reading_time integer default 0,
  status text not null default 'draft' check (status in ('draft', 'scheduled', 'published')),
  featured boolean default false,
  schedule_publish_at timestamptz,

  -- Section 2: Original Wisdom Content
  arabic_text text default '',
  urdu_translation text default '',
  english_translation text default '',
  source text default '',
  source_number text default '',
  book_name text default '',

  -- Section 3: Explanation Area
  main_explanation text default '',
  detailed_explanation text default '',
  tafseer text default '',
  historical_context text default '',

  -- Section 4: Related Narrations (stored as JSONB array)
  narrations jsonb default '[]'::jsonb,

  -- Section 5: Modern Relevance
  current_issues text default '',
  youth_relevance text default '',
  student_relevance text default '',
  practical_application text default '',

  -- Section 6: Reflection
  reflection_questions text default '',
  action_steps text default '',
  personal_reflection text default '',

  -- Section 7: Conclusion
  summary text default '',
  closing_reflection text default '',

  -- Section 8: SEO
  seo_title text,
  seo_description text,

  -- Legacy compat
  layout_type text default 'wisdom-editorial',
  content_blocks jsonb default '[]'::jsonb,
  arabic_content text,
  english_content text,
  urdu_content text,

  -- Timestamps
  published_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);


create table if not exists article_revisions (
  id uuid primary key default uuid_generate_v4(),
  article_slug text not null,
  title text,
  excerpt text,
  content_blocks jsonb not null default '[]',
  status text default 'draft',
  created_at timestamptz default now()
);

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
create policy "Admin full access wisdom cards" on wisdom_cards for all using (auth.uid() is not null);

create table if not exists uploads (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  file_name text not null,
  storage_path text not null,
  mime_type text not null,
  size_bytes bigint not null default 0,
  width integer,
  height integer,
  created_at timestamptz default now()
);

create table if not exists seo_metadata (
  id uuid primary key default uuid_generate_v4(),
  article_slug text not null unique,
  seo_title text,
  seo_description text,
  canonical_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists reflections (
  id uuid primary key default uuid_generate_v4(),
  article_slug text not null,
  user_id uuid references auth.users(id) on delete set null,
  reflection_text text not null,
  created_at timestamptz default now()
);

create table if not exists bookmarks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  article_slug text not null,
  created_at timestamptz default now(),
  unique(user_id, article_slug)
);

create table if not exists activity_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity text not null,
  entity_id text,
  payload jsonb default '{}',
  created_at timestamptz default now()
);

create table if not exists reflection_analytics_events (
  id uuid primary key default uuid_generate_v4(),
  article_slug text not null,
  event_type text not null,
  question_index integer,
  step_index integer,
  checked boolean,
  completed_steps integer,
  total_steps integer,
  client_id text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

alter table articles_unified enable row level security;
alter table article_revisions enable row level security;
alter table uploads enable row level security;
alter table seo_metadata enable row level security;
alter table reflections enable row level security;
alter table bookmarks enable row level security;
alter table activity_logs enable row level security;
alter table reflection_analytics_events enable row level security;

create policy "Public read unified articles" on articles_unified for select using (true);
create policy "Admin write unified articles" on articles_unified for all using (auth.uid() is not null);

create policy "Admin write article revisions" on article_revisions for all using (auth.uid() is not null);
create policy "Admin write uploads" on uploads for all using (auth.uid() is not null);
create policy "Admin write seo metadata" on seo_metadata for all using (auth.uid() is not null);
create policy "Admin write activity logs" on activity_logs for all using (auth.uid() is not null);

create policy "Public read reflections" on reflections for select using (true);
create policy "Users manage own bookmarks" on bookmarks for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Public read reflection analytics" on reflection_analytics_events for select using (true);
create policy "Public insert reflection analytics" on reflection_analytics_events for insert with check (true);
