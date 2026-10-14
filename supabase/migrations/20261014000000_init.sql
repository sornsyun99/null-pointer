create extension if not exists pgcrypto;

create table if not exists public.news_items (
  id uuid primary key default gen_random_uuid(),
  url text not null unique,
  title text not null,
  source text not null,
  score int default 0,
  published_at timestamptz,
  fetched_at timestamptz not null default now()
);

create table if not exists public.roasts (
  id uuid primary key default gen_random_uuid(),
  roast_date date not null,
  news_item_id uuid references public.news_items(id) on delete set null,
  headline text not null,
  url text not null,
  source text not null,
  roast text not null,
  verdict text,
  model text,
  position int not null default 0,
  created_at timestamptz not null default now(),
  unique (roast_date, url)
);
create index if not exists roasts_date_idx on public.roasts (roast_date desc, position);

create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  company text,
  service text,
  message text not null,
  created_at timestamptz not null default now()
);

alter table public.news_items enable row level security;
alter table public.roasts enable row level security;
alter table public.inquiries enable row level security;

-- Public can read roasts; nothing else.
drop policy if exists "public read roasts" on public.roasts;
create policy "public read roasts" on public.roasts for select to anon, authenticated using (true);
-- news_items and inquiries: no anon policies. Writes happen server-side with the service role key (bypasses RLS).
