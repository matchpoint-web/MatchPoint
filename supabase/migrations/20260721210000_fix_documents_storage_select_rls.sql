-- Harden Storage SELECT policies for private documents.
-- createSignedUrl returns "Object not found" when SELECT RLS fails,
-- which is easy to mistake for a path mismatch after a successful upload.

drop policy if exists "Players can view own documents storage" on storage.objects;
create policy "Players can view own documents storage"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'documents'
    and public.current_player_id() is not null
    and (
      (storage.foldername(name))[1] = public.current_player_id()::text
      or name like public.current_player_id()::text || '/%'
    )
  );

drop policy if exists "Players can upload own documents storage" on storage.objects;
create policy "Players can upload own documents storage"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'documents'
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
    and public.current_player_id() is not null
    and (
      (storage.foldername(name))[1] = public.current_player_id()::text
      or name like public.current_player_id()::text || '/%'
    )
  )
  with check (
    bucket_id = 'documents'
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
    and public.current_player_id() is not null
    and (
      (storage.foldername(name))[1] = public.current_player_id()::text
      or name like public.current_player_id()::text || '/%'
    )
  );
