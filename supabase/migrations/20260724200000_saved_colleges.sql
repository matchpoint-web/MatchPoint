-- Player bookmarks for colleges (mirror of saved_players, opposite direction).
-- Single source of truth for "Saved Colleges" across devices.

create table if not exists public.saved_colleges (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.players (id) on delete cascade,
  college_id uuid not null references public.colleges (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (player_id, college_id)
);

create index if not exists saved_colleges_player_id_idx
  on public.saved_colleges (player_id);

create index if not exists saved_colleges_college_id_idx
  on public.saved_colleges (college_id);

alter table public.saved_colleges enable row level security;

drop policy if exists "Players can view own saved colleges" on public.saved_colleges;
create policy "Players can view own saved colleges"
  on public.saved_colleges
  for select
  to authenticated
  using (
    public.is_player_account()
    and player_id = public.current_player_id()
  );

drop policy if exists "Players can insert own saved colleges" on public.saved_colleges;
create policy "Players can insert own saved colleges"
  on public.saved_colleges
  for insert
  to authenticated
  with check (
    public.is_active_player_account()
    and player_id = public.current_player_id()
  );

drop policy if exists "Players can delete own saved colleges" on public.saved_colleges;
create policy "Players can delete own saved colleges"
  on public.saved_colleges
  for delete
  to authenticated
  using (
    public.is_active_player_account()
    and player_id = public.current_player_id()
  );
