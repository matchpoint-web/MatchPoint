-- One-time cleanup: orphaned new_message notifications from deleted MVP test data.
--
-- Why this exists:
--   Dashboard unread message counts come from unread notifications where
--   type = 'new_message'. During development, conversations / players were
--   deleted (e.g. "Test User ver.2") but related notifications were left behind
--   because notifications only cascade-delete with auth.users, not conversations.
--   Those orphans inflated college dashboard unread counts before MVP release.
--
-- Deletes ONLY orphaned new_message rows where:
--   - metadata.conversationId is missing/blank, OR
--   - that conversation no longer exists, OR
--   - the conversation's player or college row no longer exists
--
-- Does NOT delete valid new_message notifications tied to live conversations.
-- Does NOT touch other notification types.
-- Future message sends continue to create notifications normally.

delete from public.notifications n
where n.type = 'new_message'
  and (
    -- No usable conversation pointer
    n.metadata ->> 'conversationId' is null
    or btrim(n.metadata ->> 'conversationId') = ''
    -- Conversation was deleted
    or not exists (
      select 1
      from public.conversations c
      where c.id::text = btrim(n.metadata ->> 'conversationId')
    )
    -- Conversation row exists but player or college participant is gone
    or exists (
      select 1
      from public.conversations c
      where c.id::text = btrim(n.metadata ->> 'conversationId')
        and (
          not exists (
            select 1 from public.players p where p.id = c.player_id
          )
          or not exists (
            select 1 from public.colleges col where col.id = c.college_id
          )
        )
    )
  );
