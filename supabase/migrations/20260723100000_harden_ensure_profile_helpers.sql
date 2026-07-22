-- Harden ensure_* profile helpers for signup/login repair races.
-- When a row already exists, return its id without overwriting names.

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
  on conflict (user_id) do nothing;

  select c.id into college_id
  from public.colleges c
  where c.user_id = auth.uid();

  if college_id is null then
    raise exception 'Could not create college profile';
  end if;

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
  on conflict (user_id) do nothing;

  select p.id into player_id
  from public.players p
  where p.user_id = auth.uid();

  if player_id is null then
    raise exception 'Could not create player profile';
  end if;

  return player_id;
end;
$$;
