-- Recently viewed players (college recruiting browsing history)
create table if not exists public.recently_viewed_players (
  id uuid primary key default gen_random_uuid(),
  college_id uuid not null references public.colleges (id) on delete cascade,
  player_id uuid not null references public.players (id) on delete cascade,
  viewed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (college_id, player_id)
);

create index if not exists recently_viewed_players_college_id_idx
  on public.recently_viewed_players (college_id);

create index if not exists recently_viewed_players_player_id_idx
  on public.recently_viewed_players (player_id);

create index if not exists recently_viewed_players_viewed_at_idx
  on public.recently_viewed_players (college_id, viewed_at desc);

alter table public.recently_viewed_players enable row level security;

drop policy if exists "Colleges can view own recently viewed players"
  on public.recently_viewed_players;
create policy "Colleges can view own recently viewed players"
  on public.recently_viewed_players
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.colleges c
      where c.id = recently_viewed_players.college_id
        and c.user_id = auth.uid()
    )
  );

drop policy if exists "Colleges can insert own recently viewed players"
  on public.recently_viewed_players;
create policy "Colleges can insert own recently viewed players"
  on public.recently_viewed_players
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.colleges c
      where c.id = recently_viewed_players.college_id
        and c.user_id = auth.uid()
    )
  );

drop policy if exists "Colleges can update own recently viewed players"
  on public.recently_viewed_players;
create policy "Colleges can update own recently viewed players"
  on public.recently_viewed_players
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.colleges c
      where c.id = recently_viewed_players.college_id
        and c.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.colleges c
      where c.id = recently_viewed_players.college_id
        and c.user_id = auth.uid()
    )
  );

drop policy if exists "Colleges can delete own recently viewed players"
  on public.recently_viewed_players;
create policy "Colleges can delete own recently viewed players"
  on public.recently_viewed_players
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.colleges c
      where c.id = recently_viewed_players.college_id
        and c.user_id = auth.uid()
    )
  );
