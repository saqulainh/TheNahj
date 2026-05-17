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

create policy "Service insert wisdom" on wisdom for insert with check (true);

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
