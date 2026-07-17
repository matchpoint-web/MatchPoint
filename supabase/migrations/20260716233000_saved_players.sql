-- Link colleges to auth users (needed for saved_players RLS)
alter table public.colleges
  add column if not exists user_id uuid unique references auth.users (id) on delete cascade;

create index if not exists colleges_user_id_idx on public.colleges (user_id);

alter table public.colleges enable row level security;

drop policy if exists "Colleges can view own profile" on public.colleges;
create policy "Colleges can view own profile"
  on public.colleges
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Colleges can insert own profile" on public.colleges;
create policy "Colleges can insert own profile"
  on public.colleges
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Colleges can update own profile" on public.colleges;
create policy "Colleges can update own profile"
  on public.colleges
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Auto-create college row for new college accounts
create or replace function public.handle_new_college_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.raw_user_meta_data->>'role' = 'college' then
    insert into public.colleges (user_id, school_name)
    values (
      new.id,
      coalesce(new.raw_user_meta_data->>'school_name', 'My College')
    )
    on conflict (user_id) do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_college on auth.users;
create trigger on_auth_user_created_college
  after insert on auth.users
  for each row
  execute function public.handle_new_college_user();

-- Saved players (college recruiting bookmarks)
create table if not exists public.saved_players (
  id uuid primary key default gen_random_uuid(),
  college_id uuid not null references public.colleges (id) on delete cascade,
  player_id uuid not null references public.players (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (college_id, player_id)
);

create index if not exists saved_players_college_id_idx
  on public.saved_players (college_id);

create index if not exists saved_players_player_id_idx
  on public.saved_players (player_id);

alter table public.saved_players enable row level security;

drop policy if exists "Colleges can view own saved players" on public.saved_players;
create policy "Colleges can view own saved players"
  on public.saved_players
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.colleges c
      where c.id = saved_players.college_id
        and c.user_id = auth.uid()
    )
  );

drop policy if exists "Colleges can insert own saved players" on public.saved_players;
create policy "Colleges can insert own saved players"
  on public.saved_players
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.colleges c
      where c.id = saved_players.college_id
        and c.user_id = auth.uid()
    )
  );

drop policy if exists "Colleges can delete own saved players" on public.saved_players;
create policy "Colleges can delete own saved players"
  on public.saved_players
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.colleges c
      where c.id = saved_players.college_id
        and c.user_id = auth.uid()
    )
  );
