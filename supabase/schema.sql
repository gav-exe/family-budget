-- Run this once in your Supabase project:
--   Dashboard -> SQL Editor -> New query -> paste -> Run
--
-- It creates one table that stores your whole budget as a single JSON blob
-- per user, and locks it down so a logged-in user can only ever read/write
-- their OWN row (row-level security).

create table if not exists public.budgets (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.budgets enable row level security;

-- A user can read only their own budget row.
create policy "read own budget"
  on public.budgets for select
  using (auth.uid() = user_id);

-- A user can create only their own budget row.
create policy "insert own budget"
  on public.budgets for insert
  with check (auth.uid() = user_id);

-- A user can update only their own budget row.
create policy "update own budget"
  on public.budgets for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
