-- ============================================================================
-- Suhail AI — per-user domain data
-- All non-task domain entities (jobs, classes, workshops, courses, skills,
-- projects, notifications, activities, ai-insights) live in ONE generic table.
-- Each row holds the full entity as `data` jsonb and is owned by auth.uid().
-- New users start empty (no seed) — everything is their own real data.
-- ============================================================================

create table if not exists public.user_data (
  kind text not null,             -- 'jobs' | 'classes' | 'workshops' | 'courses' | 'skills' | 'projects' | 'notifications' | 'activities' | 'ai_insights'
  id text not null,               -- client id string (cls_*, job_*, ws_*, etc.)
  user_id uuid not null references auth.users (id) on delete cascade,
  data jsonb not null,            -- full camelCase entity
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (kind, id, user_id)
);

create index if not exists user_data_user_kind_idx on public.user_data (user_id, kind);

alter table public.user_data enable row level security;

create policy user_data_select_own on public.user_data
  for select using (auth.uid() = user_id);
create policy user_data_insert_own on public.user_data
  for insert with check (auth.uid() = user_id);
create policy user_data_update_own on public.user_data
  for update using (auth.uid() = user_id);
create policy user_data_delete_own on public.user_data
  for delete using (auth.uid() = user_id);