-- IN DAYS / 一隅 — production-ready starter schema
create extension if not exists pgcrypto;

create table if not exists public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  entry_date date not null,
  title text not null default '',
  content text not null default '',
  background text not null default '#fffdf7',
  stickers jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (user_id, entry_date)
);

create index if not exists journal_entries_user_date_idx
  on public.journal_entries(user_id, entry_date);

alter table public.journal_entries enable row level security;

-- Safe to re-run while developing.
drop policy if exists "users can read own entries" on public.journal_entries;
drop policy if exists "users can insert own entries" on public.journal_entries;
drop policy if exists "users can update own entries" on public.journal_entries;
drop policy if exists "users can delete own entries" on public.journal_entries;

create policy "users can read own entries"
  on public.journal_entries for select
  to authenticated
  using (auth.uid() = user_id);

create policy "users can insert own entries"
  on public.journal_entries for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "users can update own entries"
  on public.journal_entries for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "users can delete own entries"
  on public.journal_entries for delete
  to authenticated
  using (auth.uid() = user_id);
