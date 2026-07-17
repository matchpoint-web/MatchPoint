-- Conversations + messages (replaces week-1 flat public.messages)
-- Realtime enabled on public.messages for live chat.

-- Old schema had player_id/college_id on messages with no sender or RLS.
-- Safe to drop: nothing in the app queried that table.
drop table if exists public.messages;

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.players (id) on delete cascade,
  college_id uuid not null references public.colleges (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (player_id, college_id)
);

create index if not exists conversations_player_id_idx
  on public.conversations (player_id);

create index if not exists conversations_college_id_idx
  on public.conversations (college_id);

create index if not exists conversations_created_at_idx
  on public.conversations (created_at desc);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender_user_id uuid not null,
  sender_role text not null,
  message text not null,
  created_at timestamptz not null default now(),
  constraint messages_sender_role_check
    check (sender_role in ('player', 'college'))
);

create index if not exists messages_conversation_id_idx
  on public.messages (conversation_id);

create index if not exists messages_conversation_id_created_at_idx
  on public.messages (conversation_id, created_at);

create index if not exists messages_sender_user_id_idx
  on public.messages (sender_user_id);

-- ---------------------------------------------------------------------------
-- RLS: conversations
-- ---------------------------------------------------------------------------
alter table public.conversations enable row level security;

drop policy if exists "Players can view own conversations" on public.conversations;
create policy "Players can view own conversations"
  on public.conversations
  for select
  to authenticated
  using (
    exists (
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
    exists (
      select 1
      from public.colleges c
      where c.id = conversations.college_id
        and c.user_id = auth.uid()
    )
  );

drop policy if exists "Players can insert own conversations" on public.conversations;
create policy "Players can insert own conversations"
  on public.conversations
  for insert
  to authenticated
  with check (
    exists (
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
    exists (
      select 1
      from public.colleges c
      where c.id = conversations.college_id
        and c.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- RLS: messages (inherit access through conversation)
-- ---------------------------------------------------------------------------
alter table public.messages enable row level security;

drop policy if exists "Participants can view conversation messages" on public.messages;
create policy "Participants can view conversation messages"
  on public.messages
  for select
  to authenticated
  using (
    exists (
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
    and sender_role in ('player', 'college')
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
-- Realtime
-- ---------------------------------------------------------------------------
alter table public.messages replica identity full;

do $$
begin
  alter publication supabase_realtime add table public.messages;
exception
  when duplicate_object then
    null;
end $$;
