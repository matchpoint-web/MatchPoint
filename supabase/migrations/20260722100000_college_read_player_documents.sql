-- Allow colleges to read player document metadata and Storage objects
-- for authenticated players (same visibility as college player profiles).
-- Colleges remain SELECT-only; players keep full CRUD on their own rows/objects.
-- createSignedUrl requires Storage SELECT under the college JWT.

-- ---------------------------------------------------------------------------
-- player_documents metadata
-- ---------------------------------------------------------------------------

drop policy if exists "Colleges can view player documents" on public.player_documents;
create policy "Colleges can view player documents"
  on public.player_documents
  for select
  to authenticated
  using (
    public.is_college_account()
    and exists (
      select 1
      from public.players p
      where p.id = player_documents.player_id
        and p.user_id is not null
    )
  );

-- ---------------------------------------------------------------------------
-- documents bucket (private): SELECT only for signing
-- ---------------------------------------------------------------------------

drop policy if exists "Colleges can view player documents storage" on storage.objects;
create policy "Colleges can view player documents storage"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'documents'
    and public.is_college_account()
    and exists (
      select 1
      from public.players p
      where p.user_id is not null
        and p.id::text = (storage.foldername(name))[1]
    )
  );
