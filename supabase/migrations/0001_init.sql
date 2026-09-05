-- ============================================================================
-- Suhail AI — initial schema
-- Per-user `profiles` and `tasks`, each owned by auth.uid() with Row Level
-- Security, so no user can read or write another account's data.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- PROFILES — one row per auth user, keyed by the auth user id.
-- The `profile` jsonb column holds the app's Profile shape so the existing
-- ProfilePage keeps working without extra normalization.
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null default '',
  name text not null default '',
  role text not null default 'Aspiring AI Engineer',
  connected_email text null,
  email_connected boolean not null default false,
  last_synced_at timestamptz null,
  profile jsonb null,
  created_at timestamptz not null default now()
);

-- Auto-create a profile row whenever a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, name)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'name', split_part(coalesce(new.email, ''), '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------------------------------------------------------------------------
-- TASKS — one row per user task. `id` stores the client id string
-- (`task_<uuid>`) so the existing string-id threading through the app is
-- untouched. All Task fields are mirrored from src/types/task.ts.
-- ---------------------------------------------------------------------------
create table if not exists public.tasks (
  id text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  description text not null default '',
  priority text not null default 'medium',      -- critical | high | medium | low
  status text not null default 'todo',          -- todo | in_progress | done | cancelled
  category text not null default 'personal',    -- career | learning | job | personal | portfolio | health
  deadline timestamptz null,
  due_time text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  estimated_minutes integer not null default 0,
  actual_minutes integer null,
  recurrence text null,                         -- daily | weekdays | weekly | biweekly | monthly | null
  tags jsonb not null default '[]',
  source text not null default 'user',          -- ai | user | system
  linked_job_id text null,
  linked_course_id text null,
  ord integer not null default 0
);

create index if not exists tasks_user_status_idx on public.tasks (user_id, status);
create index if not exists tasks_user_deadline_idx on public.tasks (user_id, deadline);
create index if not exists tasks_user_ord_idx on public.tasks (user_id, ord);

-- ---------------------------------------------------------------------------
-- ROW LEVEL SECURITY
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.tasks enable row level security;

-- profiles: owner only
create policy profiles_select_own on public.profiles
  for select using (auth.uid() = id);
create policy profiles_insert_own on public.profiles
  for insert with check (auth.uid() = id);
create policy profiles_update_own on public.profiles
  for update using (auth.uid() = id);

-- tasks: owner only
create policy tasks_select_own on public.tasks
  for select using (user_id = auth.uid());
create policy tasks_insert_own on public.tasks
  for insert with check (user_id = auth.uid());
create policy tasks_update_own on public.tasks
  for update using (user_id = auth.uid());
create policy tasks_delete_own on public.tasks
  for delete using (user_id = auth.uid());