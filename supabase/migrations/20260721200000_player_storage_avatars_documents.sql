-- Player Storage: avatars + documents buckets keyed by players.id
-- Path shapes:
--   avatars/{playerId}/avatar.{ext}
--   documents/{playerId}/transcript.{ext}
--   documents/{playerId}/resume.{ext}
--   documents/{playerId}/english-test.{ext}
--   documents/{playerId}/sat-act.{ext}

-- Resolve the authenticated user's players.id for Storage RLS.
create or replace function public.current_player_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select p.id
  from public.players p
  where p.user_id = auth.uid()
  limit 1;
$$;

revoke all on function public.current_player_id() from public;
grant execute on function public.current_player_id() to authenticated;

-- Public avatars bucket (profile images)
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do update
set public = excluded.public;

-- Private documents bucket
insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do update
set public = excluded.public;

-- ---------------------------------------------------------------------------
-- avatars policies: first folder must be current player's id
-- ---------------------------------------------------------------------------

drop policy if exists "Players can view own avatars" on storage.objects;
drop policy if exists "Public can view avatars" on storage.objects;
create policy "Public can view avatars"
  on storage.objects
  for select
  to public
  using (bucket_id = 'avatars');

drop policy if exists "Players can upload own avatars" on storage.objects;
create policy "Players can upload own avatars"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'avatars'
    and public.current_player_id() is not null
    and (storage.foldername(name))[1] = public.current_player_id()::text
  );

drop policy if exists "Players can update own avatars" on storage.objects;
create policy "Players can update own avatars"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'avatars'
    and public.current_player_id() is not null
    and (storage.foldername(name))[1] = public.current_player_id()::text
  )
  with check (
    bucket_id = 'avatars'
    and public.current_player_id() is not null
    and (storage.foldername(name))[1] = public.current_player_id()::text
  );

drop policy if exists "Players can delete own avatars" on storage.objects;
create policy "Players can delete own avatars"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'avatars'
    and public.current_player_id() is not null
    and (storage.foldername(name))[1] = public.current_player_id()::text
  );

-- ---------------------------------------------------------------------------
-- documents policies: first folder must be current player's id
-- ---------------------------------------------------------------------------

drop policy if exists "Players can view own documents storage" on storage.objects;
create policy "Players can view own documents storage"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'documents'
    and public.current_player_id() is not null
    and (storage.foldername(name))[1] = public.current_player_id()::text
  );

drop policy if exists "Players can upload own documents storage" on storage.objects;
create policy "Players can upload own documents storage"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'documents'
    and public.current_player_id() is not null
    and (storage.foldername(name))[1] = public.current_player_id()::text
  );

drop policy if exists "Players can update own documents storage" on storage.objects;
create policy "Players can update own documents storage"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'documents'
    and public.current_player_id() is not null
    and (storage.foldername(name))[1] = public.current_player_id()::text
  )
  with check (
    bucket_id = 'documents'
    and public.current_player_id() is not null
    and (storage.foldername(name))[1] = public.current_player_id()::text
  );

drop policy if exists "Players can delete own documents storage" on storage.objects;
create policy "Players can delete own documents storage"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'documents'
    and public.current_player_id() is not null
    and (storage.foldername(name))[1] = public.current_player_id()::text
  );
