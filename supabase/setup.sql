-- Cox Family Budget — Supabase setup
-- Run once in: Supabase Dashboard → SQL Editor → New query → Run

-- 1. Table: one row per user, holding the whole budget as a JSON document.
--    Simple by design — the app is single-user and the budget is a few KB.
create table if not exists public.budgets (
  user_id uuid primary key references auth.users (id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- 2. Keep updated_at fresh on every write
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists budgets_updated_at on public.budgets;
create trigger budgets_updated_at
  before update on public.budgets
  for each row execute function public.set_updated_at();

-- 3. Row Level Security: only the signed-in owner can touch their row.
--    This is what makes it safe to expose the anon key in the frontend.
alter table public.budgets enable row level security;

drop policy if exists "Users can read own budget" on public.budgets;
create policy "Users can read own budget"
  on public.budgets for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own budget" on public.budgets;
create policy "Users can insert own budget"
  on public.budgets for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own budget" on public.budgets;
create policy "Users can update own budget"
  on public.budgets for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 4. Realtime: broadcast row changes so other signed-in devices update live
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'budgets'
  ) then
    alter publication supabase_realtime add table public.budgets;
  end if;
end $$;
