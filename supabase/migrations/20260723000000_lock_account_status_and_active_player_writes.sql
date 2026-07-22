-- Harden account_status / suspension columns + ACTIVE-only player writes.
-- Depends on: 20260722200000_admin_system_account_status.sql
--             (is_admin_account, is_active_player_account, account_status columns)

-- ---------------------------------------------------------------------------
-- H1: Only admins may change account_status / suspension metadata
-- ---------------------------------------------------------------------------

create or replace function public.enforce_account_status_admin_only()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (
    new.account_status is distinct from old.account_status
    or new.suspended_reason is distinct from old.suspended_reason
    or new.suspended_at is distinct from old.suspended_at
    or new.suspended_by is distinct from old.suspended_by
  ) and not public.is_admin_account() then
    raise exception 'Only MatchPoint admins can change account status fields';
  end if;

  return new;
end;
$$;

drop trigger if exists players_enforce_account_status_admin_only on public.players;
create trigger players_enforce_account_status_admin_only
  before update on public.players
  for each row
  execute function public.enforce_account_status_admin_only();

drop trigger if exists colleges_enforce_account_status_admin_only on public.colleges;
create trigger colleges_enforce_account_status_admin_only
  before update on public.colleges
  for each row
  execute function public.enforce_account_status_admin_only();

-- ---------------------------------------------------------------------------
-- H2: Suspended players cannot write profile / documents / storage / threads
-- SELECT policies stay on is_player_account() so suspended users can still
-- load status for /account/suspended.
-- ---------------------------------------------------------------------------

drop policy if exists "Players can update own profile" on public.players;
create policy "Players can update own profile"
  on public.players
  for update
  to authenticated
  using (public.is_active_player_account() and auth.uid() = user_id)
  with check (public.is_active_player_account() and auth.uid() = user_id);

drop policy if exists "Players can insert own documents" on public.player_documents;
create policy "Players can insert own documents"
  on public.player_documents
  for insert
  to authenticated
  with check (
    public.is_active_player_account()
    and exists (
      select 1
      from public.players p
      where p.id = player_documents.player_id
        and p.user_id = auth.uid()
    )
  );

drop policy if exists "Players can update own documents" on public.player_documents;
create policy "Players can update own documents"
  on public.player_documents
  for update
  to authenticated
  using (
    public.is_active_player_account()
    and exists (
      select 1
      from public.players p
      where p.id = player_documents.player_id
        and p.user_id = auth.uid()
    )
  )
  with check (
    public.is_active_player_account()
    and exists (
      select 1
      from public.players p
      where p.id = player_documents.player_id
        and p.user_id = auth.uid()
    )
  );

drop policy if exists "Players can delete own documents" on public.player_documents;
create policy "Players can delete own documents"
  on public.player_documents
  for delete
  to authenticated
  using (
    public.is_active_player_account()
    and exists (
      select 1
      from public.players p
      where p.id = player_documents.player_id
        and p.user_id = auth.uid()
    )
  );

-- Storage writes (avatars + documents): ACTIVE players only
drop policy if exists "Players can upload own avatars" on storage.objects;
create policy "Players can upload own avatars"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'avatars'
    and public.is_active_player_account()
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
    and public.is_active_player_account()
    and public.current_player_id() is not null
    and (storage.foldername(name))[1] = public.current_player_id()::text
  )
  with check (
    bucket_id = 'avatars'
    and public.is_active_player_account()
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
    and public.is_active_player_account()
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
    and public.is_active_player_account()
    and public.current_player_id() is not null
    and (
      (storage.foldername(name))[1] = public.current_player_id()::text
      or name like public.current_player_id()::text || '/%'
    )
  );

drop policy if exists "Players can update own documents storage" on storage.objects;
create policy "Players can update own documents storage"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'documents'
    and public.is_active_player_account()
    and public.current_player_id() is not null
    and (
      (storage.foldername(name))[1] = public.current_player_id()::text
      or name like public.current_player_id()::text || '/%'
    )
  )
  with check (
    bucket_id = 'documents'
    and public.is_active_player_account()
    and public.current_player_id() is not null
    and (
      (storage.foldername(name))[1] = public.current_player_id()::text
      or name like public.current_player_id()::text || '/%'
    )
  );

drop policy if exists "Players can delete own documents storage" on storage.objects;
create policy "Players can delete own documents storage"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'documents'
    and public.is_active_player_account()
    and public.current_player_id() is not null
    and (
      (storage.foldername(name))[1] = public.current_player_id()::text
      or name like public.current_player_id()::text || '/%'
    )
  );

-- Players cannot start conversations while suspended
drop policy if exists "Players can insert own conversations" on public.conversations;
create policy "Players can insert own conversations"
  on public.conversations
  for insert
  to authenticated
  with check (
    public.is_active_player_account()
    and exists (
      select 1
      from public.players p
      where p.id = conversations.player_id
        and p.user_id = auth.uid()
    )
  );
