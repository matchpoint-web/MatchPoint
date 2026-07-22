-- Harden conversations + messages RLS (least privilege).
--
-- Goals:
-- - Participants only (player or college on the conversation row)
-- - Colleges may create threads; players may not
-- - No UPDATE/DELETE policies (deny by default)
-- - Shared SECURITY DEFINER participant check (no duplicated EXISTS trees;
--   avoids RLS recursion when messages policies inspect conversations)
-- - Revoke table privileges from anon; authenticated gets SELECT/INSERT only

-- ---------------------------------------------------------------------------
-- Shared participant helper
-- ---------------------------------------------------------------------------

create or replace function public.is_conversation_participant(
  target_conversation_id uuid
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
    where conv.id = target_conversation_id
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
  );
$$;

revoke all on function public.is_conversation_participant(uuid) from public;
grant execute on function public.is_conversation_participant(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Table privileges (RLS still required; anon must not retain CRUD grants)
-- ---------------------------------------------------------------------------

revoke all on table public.conversations from anon;
revoke all on table public.messages from anon;

revoke all on table public.conversations from authenticated;
revoke all on table public.messages from authenticated;

grant select, insert on table public.conversations to authenticated;
grant select, insert on table public.messages to authenticated;

alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.conversations force row level security;
alter table public.messages force row level security;

-- ---------------------------------------------------------------------------
-- conversations policies
-- ---------------------------------------------------------------------------

drop policy if exists "Players can view own conversations" on public.conversations;
drop policy if exists "Colleges can view own conversations" on public.conversations;
drop policy if exists "Participants can view own conversations" on public.conversations;

create policy "Participants can view own conversations"
  on public.conversations
  for select
  to authenticated
  using (
    (
      public.is_player_account()
      or public.is_college_account()
    )
    and public.is_conversation_participant(id)
  );

drop policy if exists "Players can insert own conversations" on public.conversations;
drop policy if exists "Colleges can insert own conversations" on public.conversations;

-- Product rule (matches lib/messages-service getOrCreateConversation):
-- only colleges start conversations.
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
    and exists (
      select 1
      from public.players p
      where p.id = conversations.player_id
        and p.user_id is not null
    )
  );

-- Explicitly no UPDATE/DELETE policies on conversations.

-- ---------------------------------------------------------------------------
-- messages policies
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
    and public.is_conversation_participant(conversation_id)
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
    and public.is_conversation_participant(conversation_id)
  );

-- Explicitly no UPDATE/DELETE policies on messages.
