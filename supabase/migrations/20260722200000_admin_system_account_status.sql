-- MatchPoint Admin System foundation
-- - account_status on players / colleges
-- - is_admin_account() + is_approved_college_account() + is_active_player_account()
-- - New colleges default to PENDING; existing colleges stay APPROVED
-- - Existing players stay ACTIVE
-- - Admin SELECT/UPDATE (status) via RLS
-- - Recruiting features require approved college + active player

-- ---------------------------------------------------------------------------
-- Columns (safe defaults for existing production rows)
-- ---------------------------------------------------------------------------

alter table public.players
  add column if not exists account_status text;

update public.players
set account_status = 'ACTIVE'
where account_status is null;

alter table public.players
  alter column account_status set default 'ACTIVE';

alter table public.players
  alter column account_status set not null;

alter table public.players
  drop constraint if exists players_account_status_check;

alter table public.players
  add constraint players_account_status_check
  check (account_status in ('ACTIVE', 'SUSPENDED'));

alter table public.colleges
  add column if not exists account_status text;

-- Preserve access for colleges already in production.
update public.colleges
set account_status = 'APPROVED'
where account_status is null;

alter table public.colleges
  alter column account_status set default 'PENDING';

alter table public.colleges
  alter column account_status set not null;

alter table public.colleges
  drop constraint if exists colleges_account_status_check;

alter table public.colleges
  add constraint colleges_account_status_check
  check (account_status in ('PENDING', 'APPROVED', 'SUSPENDED'));

create index if not exists players_account_status_idx
  on public.players (account_status);

create index if not exists colleges_account_status_idx
  on public.colleges (account_status);

-- ---------------------------------------------------------------------------
-- Suspension metadata (no audit table; columns live on the account rows)
-- ---------------------------------------------------------------------------

do $$
begin
  create type public.suspended_reason as enum (
    'SPAM',
    'FAKE_ACCOUNT',
    'FAKE_UNIVERSITY',
    'ABUSE',
    'TERMS_VIOLATION',
    'OTHER'
  );
exception
  when duplicate_object then null;
end $$;

alter table public.players
  add column if not exists suspended_reason public.suspended_reason;

alter table public.players
  add column if not exists suspended_at timestamptz;

alter table public.players
  add column if not exists suspended_by uuid;

alter table public.colleges
  add column if not exists suspended_reason public.suspended_reason;

alter table public.colleges
  add column if not exists suspended_at timestamptz;

alter table public.colleges
  add column if not exists suspended_by uuid;

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

create or replace function public.is_admin_account()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.jwt_app_role() = 'admin';
$$;

revoke all on function public.is_admin_account() from public;
grant execute on function public.is_admin_account() to authenticated;

create or replace function public.is_active_player_account()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.jwt_app_role() = 'player'
    and exists (
      select 1
      from public.players p
      where p.user_id = auth.uid()
        and p.account_status = 'ACTIVE'
    );
$$;

revoke all on function public.is_active_player_account() from public;
grant execute on function public.is_active_player_account() to authenticated;

create or replace function public.is_approved_college_account()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.jwt_app_role() = 'college'
    and exists (
      select 1
      from public.colleges c
      where c.user_id = auth.uid()
        and c.account_status = 'APPROVED'
    );
$$;

revoke all on function public.is_approved_college_account() from public;
grant execute on function public.is_approved_college_account() to authenticated;

-- Signup triggers: colleges start PENDING; players ACTIVE (via column default).
create or replace function public.handle_new_college_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  role_value text;
begin
  role_value := public.auth_role_from_user_row(
    new.raw_app_meta_data,
    new.raw_user_meta_data
  );

  if role_value = 'college' then
    insert into public.colleges (user_id, school_name, account_status)
    values (
      new.id,
      coalesce(new.raw_user_meta_data->>'school_name', 'My College'),
      'PENDING'
    )
    on conflict (user_id) do nothing;
  end if;

  return new;
end;
$$;

create or replace function public.handle_new_player_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  role_value text;
begin
  role_value := public.auth_role_from_user_row(
    new.raw_app_meta_data,
    new.raw_user_meta_data
  );

  if role_value = 'player' then
    insert into public.players (user_id, full_name, account_status)
    values (
      new.id,
      coalesce(new.raw_user_meta_data->>'full_name', ''),
      'ACTIVE'
    )
    on conflict (user_id) do nothing;
  end if;

  return new;
end;
$$;

create or replace function public.ensure_college_profile()
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  role_value text;
  college_id uuid;
  school text;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  role_value := nullif(btrim(coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '')), '');
  if role_value is distinct from 'college' then
    raise exception 'Not allowed';
  end if;

  select c.id into college_id
  from public.colleges c
  where c.user_id = auth.uid();

  if college_id is not null then
    return college_id;
  end if;

  school := coalesce(
    nullif(btrim(auth.jwt() -> 'user_metadata' ->> 'school_name'), ''),
    'My College'
  );

  insert into public.colleges (user_id, school_name, account_status)
  values (auth.uid(), school, 'PENDING')
  on conflict (user_id) do update
    set school_name = excluded.school_name
  returning id into college_id;

  return college_id;
end;
$$;

create or replace function public.ensure_player_profile()
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  role_value text;
  player_id uuid;
  display_name text;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  role_value := nullif(btrim(coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '')), '');
  if role_value is distinct from 'player' then
    raise exception 'Not allowed';
  end if;

  select p.id into player_id
  from public.players p
  where p.user_id = auth.uid();

  if player_id is not null then
    return player_id;
  end if;

  display_name := coalesce(
    nullif(btrim(auth.jwt() -> 'user_metadata' ->> 'full_name'), ''),
    ''
  );

  insert into public.players (user_id, full_name, account_status)
  values (auth.uid(), display_name, 'ACTIVE')
  on conflict (user_id) do update
    set full_name = excluded.full_name
  returning id into player_id;

  return player_id;
end;
$$;

-- ---------------------------------------------------------------------------
-- Admin policies (players / colleges)
-- ---------------------------------------------------------------------------

drop policy if exists "Admins can view all players" on public.players;
create policy "Admins can view all players"
  on public.players
  for select
  to authenticated
  using (public.is_admin_account());

drop policy if exists "Admins can update players" on public.players;
create policy "Admins can update players"
  on public.players
  for update
  to authenticated
  using (public.is_admin_account())
  with check (public.is_admin_account());

drop policy if exists "Admins can view all colleges" on public.colleges;
create policy "Admins can view all colleges"
  on public.colleges
  for select
  to authenticated
  using (public.is_admin_account());

drop policy if exists "Admins can update colleges" on public.colleges;
create policy "Admins can update colleges"
  on public.colleges
  for update
  to authenticated
  using (public.is_admin_account())
  with check (public.is_admin_account());

-- ---------------------------------------------------------------------------
-- Recruiting: approved colleges only; hide suspended players from colleges
-- ---------------------------------------------------------------------------

drop policy if exists "Colleges can view player profiles" on public.players;
create policy "Colleges can view player profiles"
  on public.players
  for select
  to authenticated
  using (
    public.is_approved_college_account()
    and user_id is not null
    and account_status = 'ACTIVE'
  );

-- Saved players
drop policy if exists "Colleges can view own saved players" on public.saved_players;
create policy "Colleges can view own saved players"
  on public.saved_players
  for select
  to authenticated
  using (
    public.is_approved_college_account()
    and exists (
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
    public.is_approved_college_account()
    and exists (
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
    public.is_approved_college_account()
    and exists (
      select 1
      from public.colleges c
      where c.id = saved_players.college_id
        and c.user_id = auth.uid()
    )
  );

-- Coach notes
drop policy if exists "Colleges can view own coach notes" on public.coach_notes;
create policy "Colleges can view own coach notes"
  on public.coach_notes
  for select
  to authenticated
  using (
    public.is_approved_college_account()
    and exists (
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
    public.is_approved_college_account()
    and exists (
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
    public.is_approved_college_account()
    and exists (
      select 1
      from public.colleges c
      where c.id = coach_notes.college_id
        and c.user_id = auth.uid()
    )
  )
  with check (
    public.is_approved_college_account()
    and exists (
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
    public.is_approved_college_account()
    and exists (
      select 1
      from public.colleges c
      where c.id = coach_notes.college_id
        and c.user_id = auth.uid()
    )
  );

-- Recently viewed
drop policy if exists "Colleges can view own recently viewed" on public.recently_viewed_players;
drop policy if exists "Colleges can view own recently viewed players" on public.recently_viewed_players;
create policy "Colleges can view own recently viewed players"
  on public.recently_viewed_players
  for select
  to authenticated
  using (
    public.is_approved_college_account()
    and exists (
      select 1
      from public.colleges c
      where c.id = recently_viewed_players.college_id
        and c.user_id = auth.uid()
    )
  );

drop policy if exists "Colleges can insert own recently viewed" on public.recently_viewed_players;
drop policy if exists "Colleges can insert own recently viewed players" on public.recently_viewed_players;
create policy "Colleges can insert own recently viewed players"
  on public.recently_viewed_players
  for insert
  to authenticated
  with check (
    public.is_approved_college_account()
    and exists (
      select 1
      from public.colleges c
      where c.id = recently_viewed_players.college_id
        and c.user_id = auth.uid()
    )
  );

drop policy if exists "Colleges can update own recently viewed" on public.recently_viewed_players;
drop policy if exists "Colleges can update own recently viewed players" on public.recently_viewed_players;
create policy "Colleges can update own recently viewed players"
  on public.recently_viewed_players
  for update
  to authenticated
  using (
    public.is_approved_college_account()
    and exists (
      select 1
      from public.colleges c
      where c.id = recently_viewed_players.college_id
        and c.user_id = auth.uid()
    )
  )
  with check (
    public.is_approved_college_account()
    and exists (
      select 1
      from public.colleges c
      where c.id = recently_viewed_players.college_id
        and c.user_id = auth.uid()
    )
  );

drop policy if exists "Colleges can delete own recently viewed" on public.recently_viewed_players;
drop policy if exists "Colleges can delete own recently viewed players" on public.recently_viewed_players;
create policy "Colleges can delete own recently viewed players"
  on public.recently_viewed_players
  for delete
  to authenticated
  using (
    public.is_approved_college_account()
    and exists (
      select 1
      from public.colleges c
      where c.id = recently_viewed_players.college_id
        and c.user_id = auth.uid()
    )
  );

-- College document metadata / storage reads
drop policy if exists "Colleges can view player documents" on public.player_documents;
create policy "Colleges can view player documents"
  on public.player_documents
  for select
  to authenticated
  using (
    public.is_approved_college_account()
    and exists (
      select 1
      from public.players p
      where p.id = player_documents.player_id
        and p.user_id is not null
        and p.account_status = 'ACTIVE'
    )
  );

drop policy if exists "Colleges can view player documents storage" on storage.objects;
create policy "Colleges can view player documents storage"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'documents'
    and public.is_approved_college_account()
    and exists (
      select 1
      from public.players p
      where p.user_id is not null
        and p.account_status = 'ACTIVE'
        and p.id::text = (storage.foldername(name))[1]
    )
  );

-- Only approved colleges may start conversations
drop policy if exists "Colleges can insert own conversations" on public.conversations;
create policy "Colleges can insert own conversations"
  on public.conversations
  for insert
  to authenticated
  with check (
    public.is_approved_college_account()
    and exists (
      select 1
      from public.colleges c
      where c.id = conversations.college_id
        and c.user_id = auth.uid()
        and c.account_status = 'APPROVED'
    )
    and exists (
      select 1
      from public.players p
      where p.id = conversations.player_id
        and p.user_id is not null
        and p.account_status = 'ACTIVE'
    )
  );

-- Message insert for colleges requires approved status (via is_approved_college_account)
drop policy if exists "Participants can insert conversation messages" on public.messages;
create policy "Participants can insert conversation messages"
  on public.messages
  for insert
  to authenticated
  with check (
    sender_user_id = auth.uid()
    and (
      (
        public.jwt_app_role() = 'player'
        and sender_role = 'player'
        and public.is_active_player_account()
      )
      or (
        public.jwt_app_role() = 'college'
        and sender_role = 'college'
        and public.is_approved_college_account()
      )
    )
    and public.is_conversation_participant(conversation_id)
  );
