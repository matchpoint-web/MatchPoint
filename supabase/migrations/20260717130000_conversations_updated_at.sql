-- Conversations: track last activity via updated_at when messages are inserted.

alter table public.conversations
  add column if not exists updated_at timestamptz not null default now();

create index if not exists conversations_updated_at_idx
  on public.conversations (updated_at desc);

create or replace function public.set_conversation_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.conversations
  set updated_at = now()
  where id = new.conversation_id;

  return new;
end;
$$;

drop trigger if exists on_message_inserted_update_conversation
  on public.messages;

create trigger on_message_inserted_update_conversation
  after insert on public.messages
  for each row
  execute function public.set_conversation_updated_at();
