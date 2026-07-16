-- Extend colleges for full program settings profile
alter table public.colleges
  add column if not exists conference text,
  add column if not exists state text,
  add column if not exists city text,
  add column if not exists website text,
  add column if not exists head_coach text,
  add column if not exists assistant_coach text,
  add column if not exists contact_email text,
  add column if not exists about_program text,
  add column if not exists facilities text,
  add column if not exists recruiting_information text,
  add column if not exists logo_url text,
  add column if not exists updated_at timestamptz not null default now();

-- College logo storage (mirrors player-avatars)
insert into storage.buckets (id, name, public)
values ('college-logos', 'college-logos', true)
on conflict (id) do nothing;

drop policy if exists "College logos are publicly accessible" on storage.objects;
create policy "College logos are publicly accessible"
  on storage.objects
  for select
  using (bucket_id = 'college-logos');

drop policy if exists "Colleges can upload own logo" on storage.objects;
create policy "Colleges can upload own logo"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'college-logos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Colleges can update own logo" on storage.objects;
create policy "Colleges can update own logo"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'college-logos'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'college-logos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Colleges can delete own logo" on storage.objects;
create policy "Colleges can delete own logo"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'college-logos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
