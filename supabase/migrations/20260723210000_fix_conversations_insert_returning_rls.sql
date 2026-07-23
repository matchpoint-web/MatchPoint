-- Fix college conversation creation (INSERT ... RETURNING / PostgREST .select()).
--
-- Root cause:
--   "Participants can view own conversations" used is_conversation_participant(id),
--   which re-SELECTs from public.conversations. During INSERT ... RETURNING the
--   in-flight row is not visible to that subquery, so the SELECT policy fails and
--   Postgres raises: new row violates row-level security policy for table
--   "conversations". Supabase JS .insert().select('id') always uses RETURNING.
--
-- Fix:
--   Evaluate participant ownership from the NEW row's college_id / player_id
--   via EXISTS on colleges/players (no self-select of conversations).
--   Keep is_conversation_participant() for messages policies (conversation already exists).
--
-- Also restore product rule from harden migration: only colleges may insert
-- conversations (drop player insert policy re-added by account-status lock migration).

drop policy if exists "Participants can view own conversations" on public.conversations;

create policy "Participants can view own conversations"
  on public.conversations
  for select
  to authenticated
  using (
    (
      public.is_player_account()
      and exists (
        select 1
        from public.players p
        where p.id = conversations.player_id
          and p.user_id = auth.uid()
      )
    )
    or (
      public.is_college_account()
      and exists (
        select 1
        from public.colleges c
        where c.id = conversations.college_id
          and c.user_id = auth.uid()
      )
    )
  );

drop policy if exists "Players can insert own conversations" on public.conversations;

-- Keep college insert policy as defined by admin_system migration
-- (is_approved_college_account + owned college + ACTIVE player with user_id).
