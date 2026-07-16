-- Coach notes: one note per college–player pair

create table if not exists public.coach_notes (
  id uuid primary key default gen_random_uuid(),
  college_id uuid not null references public.colleges (id) on delete cascade,
  player_id uuid not null references public.players (id) on delete cascade,
  status text not null,
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (college_id, player_id)
);

create index if not exists coach_notes_college_id_idx
  on public.coach_notes (college_id);

create index if not exists coach_notes_player_id_idx
  on public.coach_notes (player_id);

create index if not exists coach_notes_updated_at_idx
  on public.coach_notes (updated_at desc);

alter table public.coach_notes enable row level security;

drop policy if exists "Colleges can view own coach notes" on public.coach_notes;
create policy "Colleges can view own coach notes"
  on public.coach_notes
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.colleges c
      where c.id = coach_notes.college_id
        and c.user_id = auth.uid()
    )
  );

drop policy if exists "Colleges can insert own coach notes" on public.coach_notes;
create policy "Colleges can insert own coach notes"
  on public.coach_notes
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.colleges c
      where c.id = coach_notes.college_id
        and c.user_id = auth.uid()
    )
  );

drop policy if exists "Colleges can update own coach notes" on public.coach_notes;
create policy "Colleges can update own coach notes"
  on public.coach_notes
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.colleges c
      where c.id = coach_notes.college_id
        and c.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.colleges c
      where c.id = coach_notes.college_id
        and c.user_id = auth.uid()
    )
  );

drop policy if exists "Colleges can delete own coach notes" on public.coach_notes;
create policy "Colleges can delete own coach notes"
  on public.coach_notes
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.colleges c
      where c.id = coach_notes.college_id
        and c.user_id = auth.uid()
    )
  );
