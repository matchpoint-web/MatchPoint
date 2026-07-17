-- Player / user notifications + Realtime
--
-- type is free-form text (extensible). Authorization for creates lives in
-- can_create_notification_for() — type-specific rules only where needed.

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  type text not null,
  title text not null,
  message text not null,
  metadata jsonb,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_id_idx
  on public.notifications (user_id);

create index if not exists notifications_user_id_created_at_idx
  on public.notifications (user_id, created_at desc);

create index if not exists notifications_user_id_is_read_idx
  on public.notifications (user_id, is_read);

alter table public.notifications enable row level security;

-- SELECT: own rows only
drop policy if exists "Users can view own notifications" on public.notifications;
create policy "Users can view own notifications"
  on public.notifications
  for select
  to authenticated
  using (auth.uid() = user_id);

-- UPDATE: own rows only (e.g. mark as read)
drop policy if exists "Users can update own notifications" on public.notifications;
create policy "Users can update own notifications"
  on public.notifications
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- No INSERT/DELETE policies for authenticated clients.
-- Creates go through SECURITY DEFINER create_notification().

-- Authorization only. New notification type strings do not require changes here
-- unless they need a new cross-user authorization rule.
create or replace function public.can_create_notification_for(
  target_user_id uuid,
  notification_type text
)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    return false;
  end if;

  if target_user_id is null then
    return false;
  end if;

  if notification_type is null or btrim(notification_type) = '' then
    return false;
  end if;

  -- Any type: user may create notifications for themselves.
  if target_user_id = auth.uid() then
    return true;
  end if;

  -- Cross-user rules (extend only when a new authorization model is needed).
  if btrim(notification_type) = 'new_message' then
    return exists (
      select 1
      from public.conversations conv
      inner join public.players p on p.id = conv.player_id
      inner join public.colleges c on c.id = conv.college_id
      where (
          (c.user_id = auth.uid() and p.user_id = target_user_id)
          or (p.user_id = auth.uid() and c.user_id = target_user_id)
        )
    );
  end if;

  return false;
end;
$$;

revoke all on function public.can_create_notification_for(uuid, text) from public;
grant execute on function public.can_create_notification_for(uuid, text) to authenticated;

create or replace function public.create_notification(
  target_user_id uuid,
  notification_type text,
  notification_title text,
  notification_message text,
  notification_metadata jsonb default null
)
returns public.notifications
language plpgsql
security definer
set search_path = public
as $$
declare
  result public.notifications;
  normalized_type text;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if target_user_id is null then
    raise exception 'target_user_id is required';
  end if;

  normalized_type := btrim(coalesce(notification_type, ''));
  if normalized_type = '' then
    raise exception 'notification_type is required';
  end if;

  if notification_title is null or btrim(notification_title) = '' then
    raise exception 'notification_title is required';
  end if;

  if notification_message is null or btrim(notification_message) = '' then
    raise exception 'notification_message is required';
  end if;

  if not public.can_create_notification_for(target_user_id, normalized_type) then
    raise exception 'Not allowed to create this notification for the target user';
  end if;

  insert into public.notifications (
    user_id,
    type,
    title,
    message,
    metadata
  )
  values (
    target_user_id,
    normalized_type,
    btrim(notification_title),
    btrim(notification_message),
    notification_metadata
  )
  returning * into result;

  return result;
end;
$$;

revoke all on function public.create_notification(uuid, text, text, text, jsonb)
  from public;
grant execute on function public.create_notification(uuid, text, text, text, jsonb)
  to authenticated;

-- Realtime
alter table public.notifications replica identity full;

do $$
begin
  alter publication supabase_realtime add table public.notifications;
exception
  when duplicate_object then
    null;
end $$;
