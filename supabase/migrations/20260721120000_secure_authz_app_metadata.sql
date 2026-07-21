-- Phase 1: Secure authz — app_metadata role + signup provisioning (no RLS yet)
--
-- Goals:
-- 1. Promote role into immutable app_metadata for existing users
-- 2. Strip role from user_metadata (clients can edit that)
-- 3. Retarget signup triggers to app_metadata.role
-- 4. Repair missing players/colleges rows for valid roles
-- 5. Provide SECURITY DEFINER ensure_* helpers for rare onboarding gaps
--    (callable later by authenticated users only when app_metadata.role matches)

-- ---------------------------------------------------------------------------
-- Helpers: read role from app_metadata with temporary user_metadata fallback
-- ---------------------------------------------------------------------------
create or replace function public.auth_role_from_user_row(
  app_meta jsonb,
  user_meta jsonb
)
returns text
language sql
immutable
as $$
  select nullif(
    btrim(
      coalesce(
        app_meta ->> 'role',
        user_meta ->> 'role',
        ''
      )
    ),
    ''
  );
$$;

-- ---------------------------------------------------------------------------
-- Backfill:
-- - Set app_metadata.role ONLY when missing or invalid (never rewrite valid)
-- - Strip user_metadata.role independently
-- ---------------------------------------------------------------------------
do $$
declare
  r record;
  current_app jsonb;
  current_user_meta jsonb;
  existing_app_role text;
  promoted_role text;
  next_app jsonb;
  next_user_meta jsonb;
begin
  for r in
    select id, raw_app_meta_data, raw_user_meta_data
    from auth.users
  loop
    current_app := coalesce(r.raw_app_meta_data, '{}'::jsonb);
    current_user_meta := coalesce(r.raw_user_meta_data, '{}'::jsonb);

    existing_app_role := nullif(btrim(coalesce(current_app ->> 'role', '')), '');
    next_app := current_app;

    -- Promote into app_metadata only when role is missing or not player/college.
    if existing_app_role is null or existing_app_role not in ('player', 'college') then
      promoted_role := nullif(
        btrim(coalesce(current_user_meta ->> 'role', '')),
        ''
      );
      if promoted_role in ('player', 'college') then
        next_app := jsonb_set(current_app, '{role}', to_jsonb(promoted_role), true);
      end if;
    end if;
    -- else: leave existing valid app_metadata.role untouched

    -- Always strip role from user_metadata (independent of app_metadata write).
    next_user_meta := current_user_meta - 'role';

    if next_app is distinct from current_app
       or next_user_meta is distinct from current_user_meta then
      update auth.users
      set
        raw_app_meta_data = next_app,
        raw_user_meta_data = next_user_meta
      where id = r.id;
    end if;
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- Repair identity rows for users who already have a valid role
-- ---------------------------------------------------------------------------
insert into public.players (user_id, full_name)
select
  u.id,
  coalesce(nullif(btrim(u.raw_user_meta_data ->> 'full_name'), ''), '')
from auth.users u
where coalesce(u.raw_app_meta_data ->> 'role', '') = 'player'
  and not exists (
    select 1 from public.players p where p.user_id = u.id
  )
on conflict (user_id) do nothing;

insert into public.colleges (user_id, school_name)
select
  u.id,
  coalesce(
    nullif(btrim(u.raw_user_meta_data ->> 'school_name'), ''),
    'My College'
  )
from auth.users u
where coalesce(u.raw_app_meta_data ->> 'role', '') = 'college'
  and not exists (
    select 1 from public.colleges c where c.user_id = u.id
  )
on conflict (user_id) do nothing;

-- ---------------------------------------------------------------------------
-- Signup triggers: provision from app_metadata.role (fallback user_metadata)
-- ---------------------------------------------------------------------------
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

drop trigger if exists on_auth_user_created_player on auth.users;
create trigger on_auth_user_created_player
  after insert on auth.users
  for each row
  execute function public.handle_new_player_user();

drop trigger if exists on_auth_user_created_college on auth.users;
create trigger on_auth_user_created_college
  after insert on auth.users
  for each row
  execute function public.handle_new_college_user();

-- ---------------------------------------------------------------------------
-- Rare onboarding repair (NOT used by layouts / getCurrentCollegeId)
-- Requires JWT app_metadata.role match; creates missing ownership row only.
-- ---------------------------------------------------------------------------
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

  insert into public.players (user_id, full_name)
  values (auth.uid(), display_name)
  on conflict (user_id) do update
    set full_name = excluded.full_name
  returning id into player_id;

  return player_id;
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

  insert into public.colleges (user_id, school_name)
  values (auth.uid(), school)
  on conflict (user_id) do update
    set school_name = excluded.school_name
  returning id into college_id;

  return college_id;
end;
$$;

revoke all on function public.ensure_player_profile() from public;
revoke all on function public.ensure_college_profile() from public;
grant execute on function public.ensure_player_profile() to authenticated;
grant execute on function public.ensure_college_profile() to authenticated;

revoke all on function public.auth_role_from_user_row(jsonb, jsonb) from public;
-- Internal helper for triggers; no need to expose to clients.
