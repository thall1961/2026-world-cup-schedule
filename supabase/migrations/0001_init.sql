-- World Cup 2026 reminders — schema, RLS, and indexes.
-- Run via `supabase db push` or paste into the Supabase SQL editor.

create extension if not exists pgcrypto;

-- ── Who wants reminders ────────────────────────────────────────────────
create table if not exists public.subscriptions (
  id                uuid primary key default gen_random_uuid(),
  email             text not null unique,
  minutes_before    int  not null default 15 check (minutes_before between 1 and 240),
  active            boolean not null default true,
  unsubscribe_token uuid not null default gen_random_uuid(),
  created_at        timestamptz not null default now()
);

-- ── The fixtures (seeded from src/data.js via scripts/gen-seed.mjs) ─────
create table if not exists public.matches (
  id         int  primary key,
  stage      text not null,
  group_name text,
  home       text,
  away       text,
  kickoff    timestamptz not null
);
create index if not exists matches_kickoff_idx on public.matches (kickoff);

-- ── Dedupe: one reminder per (subscriber, match) ───────────────────────
create table if not exists public.sent_reminders (
  subscription_id uuid not null references public.subscriptions(id) on delete cascade,
  match_id        int  not null references public.matches(id) on delete cascade,
  sent_at         timestamptz not null default now(),
  primary key (subscription_id, match_id)
);

-- ── Row-level security ─────────────────────────────────────────────────
alter table public.subscriptions  enable row level security;
alter table public.matches        enable row level security;
alter table public.sent_reminders enable row level security;

-- Anyone with a valid API key may subscribe, but cannot read or modify existing
-- rows. `to public` covers the anon role and whichever role the publishable key
-- resolves to. The Edge Functions use the service-role key, which bypasses RLS.
drop policy if exists "anon can subscribe" on public.subscriptions;
drop policy if exists "anyone can subscribe" on public.subscriptions;
create policy "anyone can subscribe"
  on public.subscriptions for insert
  to public
  with check (true);

-- Fixtures are public to read (handy if you ever query them client-side).
drop policy if exists "matches are public" on public.matches;
create policy "matches are public"
  on public.matches for select
  to anon, authenticated
  using (true);

-- sent_reminders: no anon/authenticated policies => only service role can touch it.
