-- Phase 2: Secure RLS — app_metadata.role + ownership (no user_metadata.role)
--
-- Principles:
-- 1. JWT role comes ONLY from auth.jwt() -> 'app_metadata' ->> 'role'
-- 2. Privileged actions also require an ownership row (players/colleges.user_id)
-- 3. Avoid RLS recursion via SECURITY DEFINER helpers where policies cross tables
-- 4. Idempotent: drop policy if exists, then create; create or replace functions

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

-- Immutable role claim from the JWT (clients cannot set app_metadata).
create or replace function public.jwt_app_role()
returns text
language sql
stable
as $$
  select nullif(
    btrim(coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '')),
    ''
  );
$$;

revoke all on function public.jwt_app_role() from public;
grant execute on function public.jwt_app_role() to authenticated;

-- True when JWT says player AND a players row is owned by auth.uid().
-- SECURITY DEFINER: reading public.players must not re-enter RLS (avoids recursion).
create or replace function public.is_player_account()
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
    );
$$;

revoke all on function public.is_player_account() from public;
grant execute on function public.is_player_account() to authenticated;

-- True when JWT says college AND a colleges row is owned by auth.uid().
create or replace function public.is_college_account()
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
    );
$$;

revoke all on function public.is_college_account() from public;
grant execute on function public.is_college_account() to authenticated;

-- Keep conversation helper; ensure grants remain correct.
create or replace function public.player_participates_in_college_conversation(
  target_college_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.conversations conv
    inner join public.players p on p.id = conv.player_id
    where conv.college_id = target_college_id
      and p.user_id = auth.uid()
  );
$$;

revoke all on function public.player_participates_in_college_conversation(uuid)
  from public;
grant execute on function public.player_participates_in_college_conversation(uuid)
  to authenticated;

-- Phase 1 trigger helper: role from app_metadata ONLY (no user_metadata fallback).
create or replace function public.auth_role_from_user_row(
  app_meta jsonb,
  user_meta jsonb
)
returns text
language sql
immutable
as $$
  select nullif(btrim(coalesce(app_meta ->> 'role', '')), '');
$$;

-- Re-assert signup triggers use app_metadata-only helper (body unchanged otherwise).
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

-- ---------------------------------------------------------------------------
-- PLAYERS
-- ---------------------------------------------------------------------------

-- Own profile: player role + ownership
drop policy if exists "Players can view own profile" on public.players;
create policy "Players can view own profile"
  on public.players
  for select
  to authenticated
  using (
    public.jwt_app_role() = 'player'
    and auth.uid() = user_id
  );

-- Recruiting search: college role + owns a colleges row
drop policy if exists "Colleges can view player profiles" on public.players;
create policy "Colleges can view player profiles"
  on public.players
  for select
  to authenticated
  using (public.is_college_account());

-- Insert only for player accounts owning the row (signup trigger is definer;
-- this covers legacy upsert paths until Phase 5).
drop policy if exists "Players can insert own profile" on public.players;
create policy "Players can insert own profile"
  on public.players
  for insert
  to authenticated
  with check (
    public.jwt_app_role() = 'player'
    and auth.uid() = user_id
  );

drop policy if exists "Players can update own profile" on public.players;
create policy "Players can update own profile"
  on public.players
  for update
  to authenticated
  using (
    public.jwt_app_role() = 'player'
    and auth.uid() = user_id
  )
  with check (
    public.jwt_app_role() = 'player'
    and auth.uid() = user_id
  );

-- ---------------------------------------------------------------------------
-- COLLEGES
-- ---------------------------------------------------------------------------

drop policy if exists "Colleges can view own profile" on public.colleges;
create policy "Colleges can view own profile"
  on public.colleges
  for select
  to authenticated
  using (
    public.jwt_app_role() = 'college'
    and auth.uid() = user_id
  );

-- College search: player role + owns a players row
drop policy if exists "Players can view college profiles" on public.colleges;
create policy "Players can view college profiles"
  on public.colleges
  for select
  to authenticated
  using (public.is_player_account());

-- Conversation-scoped college visibility (definer helper; no recursion)
drop policy if exists "Players can view colleges in their conversations"
  on public.colleges;
create policy "Players can view colleges in their conversations"
  on public.colleges
  for select
  to authenticated
  using (
    public.jwt_app_role() = 'player'
    and public.player_participates_in_college_conversation(id)
  );

drop policy if exists "Colleges can insert own profile" on public.colleges;
create policy "Colleges can insert own profile"
  on public.colleges
  for insert
  to authenticated
  with check (
    public.jwt_app_role() = 'college'
    and auth.uid() = user_id
  );

drop policy if exists "Colleges can update own profile" on public.colleges;
create policy "Colleges can update own profile"
  on public.colleges
  for update
  to authenticated
  using (
    public.jwt_app_role() = 'college'
    and auth.uid() = user_id
  )
  with check (
    public.jwt_app_role() = 'college'
    and auth.uid() = user_id
  );

-- ---------------------------------------------------------------------------
-- SAVED_PLAYERS
-- ---------------------------------------------------------------------------

drop policy if exists "Colleges can view own saved players" on public.saved_players;
create policy "Colleges can view own saved players"
  on public.saved_players
  for select
  to authenticated
  using (
    public.is_college_account()
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
    public.is_college_account()
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
    public.is_college_account()
    and exists (
      select 1
      from public.colleges c
      where c.id = saved_players.college_id
        and c.user_id = auth.uid()
    )
  );

-- Players may see which colleges saved them (dashboard counts)
drop policy if exists "Players can view saves of themselves" on public.saved_players;
create policy "Players can view saves of themselves"
  on public.saved_players
  for select
  to authenticated
  using (
    public.is_player_account()
    and exists (
      select 1
      from public.players p
      where p.id = saved_players.player_id
        and p.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- COACH_NOTES
-- ---------------------------------------------------------------------------

drop policy if exists "Colleges can view own coach notes" on public.coach_notes;
create policy "Colleges can view own coach notes"
  on public.coach_notes
  for select
  to authenticated
  using (
    public.is_college_account()
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
    public.is_college_account()
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
    public.is_college_account()
    and exists (
      select 1
      from public.colleges c
      where c.id = coach_notes.college_id
        and c.user_id = auth.uid()
    )
  )
  with check (
    public.is_college_account()
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
    public.is_college_account()
    and exists (
      select 1
      from public.colleges c
      where c.id = coach_notes.college_id
        and c.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- RECENTLY_VIEWED_PLAYERS
-- ---------------------------------------------------------------------------

drop policy if exists "Colleges can view own recently viewed players"
  on public.recently_viewed_players;
create policy "Colleges can view own recently viewed players"
  on public.recently_viewed_players
  for select
  to authenticated
  using (
    public.is_college_account()
    and exists (
      select 1
      from public.colleges c
      where c.id = recently_viewed_players.college_id
        and c.user_id = auth.uid()
    )
  );

drop policy if exists "Colleges can insert own recently viewed players"
  on public.recently_viewed_players;
create policy "Colleges can insert own recently viewed players"
  on public.recently_viewed_players
  for insert
  to authenticated
  with check (
    public.is_college_account()
    and exists (
      select 1
      from public.colleges c
      where c.id = recently_viewed_players.college_id
        and c.user_id = auth.uid()
    )
  );

drop policy if exists "Colleges can update own recently viewed players"
  on public.recently_viewed_players;
create policy "Colleges can update own recently viewed players"
  on public.recently_viewed_players
  for update
  to authenticated
  using (
    public.is_college_account()
    and exists (
      select 1
      from public.colleges c
      where c.id = recently_viewed_players.college_id
        and c.user_id = auth.uid()
    )
  )
  with check (
    public.is_college_account()
    and exists (
      select 1
      from public.colleges c
      where c.id = recently_viewed_players.college_id
        and c.user_id = auth.uid()
    )
  );

drop policy if exists "Colleges can delete own recently viewed players"
  on public.recently_viewed_players;
create policy "Colleges can delete own recently viewed players"
  on public.recently_viewed_players
  for delete
  to authenticated
  using (
    public.is_college_account()
    and exists (
      select 1
      from public.colleges c
      where c.id = recently_viewed_players.college_id
        and c.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- PLAYER_DOCUMENTS
-- ---------------------------------------------------------------------------

drop policy if exists "Players can view own documents" on public.player_documents;
create policy "Players can view own documents"
  on public.player_documents
  for select
  to authenticated
  using (
    public.is_player_account()
    and exists (
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
    public.is_player_account()
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
    public.is_player_account()
    and exists (
      select 1
      from public.players p
      where p.id = player_documents.player_id
        and p.user_id = auth.uid()
    )
  )
  with check (
    public.is_player_account()
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
    public.is_player_account()
    and exists (
      select 1
      from public.players p
      where p.id = player_documents.player_id
        and p.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- CONVERSATIONS
-- ---------------------------------------------------------------------------

drop policy if exists "Players can view own conversations" on public.conversations;
create policy "Players can view own conversations"
  on public.conversations
  for select
  to authenticated
  using (
    public.is_player_account()
    and exists (
      select 1
      from public.players p
      where p.id = conversations.player_id
        and p.user_id = auth.uid()
    )
  );

drop policy if exists "Colleges can view own conversations" on public.conversations;
create policy "Colleges can view own conversations"
  on public.conversations
  for select
  to authenticated
  using (
    public.is_college_account()
    and exists (
      select 1
      from public.colleges c
      where c.id = conversations.college_id
        and c.user_id = auth.uid()
    )
  );

-- Product: colleges start threads; keep player insert for symmetry but require role+ownership
drop policy if exists "Players can insert own conversations" on public.conversations;
create policy "Players can insert own conversations"
  on public.conversations
  for insert
  to authenticated
  with check (
    public.is_player_account()
    and exists (
      select 1
      from public.players p
      where p.id = conversations.player_id
        and p.user_id = auth.uid()
    )
  );

drop policy if exists "Colleges can insert own conversations" on public.conversations;
create policy "Colleges can insert own conversations"
  on public.conversations
  for insert
  to authenticated
  with check (
    public.is_college_account()
    and exists (
      select 1
      from public.colleges c
      where c.id = conversations.college_id
        and c.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- MESSAGES
-- ---------------------------------------------------------------------------

drop policy if exists "Participants can view conversation messages" on public.messages;
create policy "Participants can view conversation messages"
  on public.messages
  for select
  to authenticated
  using (
    (
      public.is_player_account()
      or public.is_college_account()
    )
    and exists (
      select 1
      from public.conversations conv
      where conv.id = messages.conversation_id
        and (
          exists (
            select 1
            from public.players p
            where p.id = conv.player_id
              and p.user_id = auth.uid()
          )
          or exists (
            select 1
            from public.colleges c
            where c.id = conv.college_id
              and c.user_id = auth.uid()
          )
        )
    )
  );

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
        and public.is_player_account()
      )
      or (
        public.jwt_app_role() = 'college'
        and sender_role = 'college'
        and public.is_college_account()
      )
    )
    and exists (
      select 1
      from public.conversations conv
      where conv.id = messages.conversation_id
        and (
          (
            sender_role = 'player'
            and exists (
              select 1
              from public.players p
              where p.id = conv.player_id
                and p.user_id = auth.uid()
            )
          )
          or (
            sender_role = 'college'
            and exists (
              select 1
              from public.colleges c
              where c.id = conv.college_id
                and c.user_id = auth.uid()
            )
          )
        )
    )
  );

-- ---------------------------------------------------------------------------
-- NOTIFICATIONS
-- ---------------------------------------------------------------------------

drop policy if exists "Users can view own notifications" on public.notifications;
create policy "Users can view own notifications"
  on public.notifications
  for select
  to authenticated
  using (
    auth.uid() = user_id
    and public.jwt_app_role() in ('player', 'college')
  );

drop policy if exists "Users can update own notifications" on public.notifications;
create policy "Users can update own notifications"
  on public.notifications
  for update
  to authenticated
  using (
    auth.uid() = user_id
    and public.jwt_app_role() in ('player', 'college')
  )
  with check (
    auth.uid() = user_id
    and public.jwt_app_role() in ('player', 'college')
  );

-- No authenticated INSERT/DELETE on notifications (RPC create_notification remains).
