-- Player documents metadata + private storage bucket

create table if not exists public.player_documents (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.players (id) on delete cascade,
  document_type text not null,
  file_name text,
  storage_path text,
  public_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (player_id, document_type)
);

create index if not exists player_documents_player_id_idx
  on public.player_documents (player_id);

alter table public.player_documents enable row level security;

-- Players can manage only their own document rows
drop policy if exists "Players can view own documents" on public.player_documents;
create policy "Players can view own documents"
  on public.player_documents
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.players p
      where p.id = player_documents.player_id
        and p.user_id = auth.uid()
    )
  );

drop policy if exists "Players can insert own documents" on public.player_documents;
create policy "Players can insert own documents"
  on public.player_documents
  for insert
  to authenticated
  with check (
    exists (
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
    exists (
      select 1
      from public.players p
      where p.id = player_documents.player_id
        and p.user_id = auth.uid()
    )
  )
  with check (
    exists (
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
    exists (
      select 1
      from public.players p
      where p.id = player_documents.player_id
        and p.user_id = auth.uid()
    )
  );

-- Storage bucket: path = <auth.uid()>/<document_type>/<filename>
insert into storage.buckets (id, name, public)
values ('player-documents', 'player-documents', false)
on conflict (id) do nothing;

drop policy if exists "Players can view own document files" on storage.objects;
create policy "Players can view own document files"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'player-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Players can upload own document files" on storage.objects;
create policy "Players can upload own document files"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'player-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Players can update own document files" on storage.objects;
create policy "Players can update own document files"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'player-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'player-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Players can delete own document files" on storage.objects;
create policy "Players can delete own document files"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'player-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
