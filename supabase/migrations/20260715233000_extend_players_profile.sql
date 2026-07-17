-- Extend players for profile editing + auth linkage

alter table public.players
  add column if not exists user_id uuid unique references auth.users (id) on delete cascade,
  add column if not exists gpa numeric(3, 2),
  add column if not exists height numeric(5, 1),
  add column if not exists weight numeric(5, 1),
  add column if not exists dominant_hand text,
  add column if not exists backhand text,
  add column if not exists date_of_birth date,
  add column if not exists profile_image_url text,
  add column if not exists updated_at timestamptz not null default now();

create index if not exists players_user_id_idx on public.players (user_id);

alter table public.players enable row level security;

drop policy if exists "Players can view own profile" on public.players;
create policy "Players can view own profile"
  on public.players
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Players can insert own profile" on public.players;
create policy "Players can insert own profile"
  on public.players
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Players can update own profile" on public.players;
create policy "Players can update own profile"
  on public.players
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Auto-create player row for new player accounts
create or replace function public.handle_new_player_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.raw_user_meta_data->>'role' = 'player' then
    insert into public.players (user_id, full_name)
    values (
      new.id,
      coalesce(new.raw_user_meta_data->>'full_name', '')
    )
    on conflict (user_id) do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_player on auth.users;
create trigger on_auth_user_created_player
  after insert on auth.users
  for each row
  execute function public.handle_new_player_user();

-- Profile image storage
insert into storage.buckets (id, name, public)
values ('player-avatars', 'player-avatars', true)
on conflict (id) do nothing;

drop policy if exists "Player avatars are publicly accessible" on storage.objects;
create policy "Player avatars are publicly accessible"
  on storage.objects
  for select
  using (bucket_id = 'player-avatars');

drop policy if exists "Players can upload own avatar" on storage.objects;
create policy "Players can upload own avatar"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'player-avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Players can update own avatar" on storage.objects;
create policy "Players can update own avatar"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'player-avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Players can delete own avatar" on storage.objects;
create policy "Players can delete own avatar"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'player-avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
