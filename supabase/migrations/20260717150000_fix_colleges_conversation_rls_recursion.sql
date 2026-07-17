-- Fix infinite recursion on public.colleges SELECT policies.
--
-- Root cause:
--   "Players can view colleges in their conversations" queried public.conversations.
--   Conversations SELECT policies include "Colleges can view own conversations",
--   which queries public.colleges. That re-enters the colleges policy → recursion.
--
-- Fix:
--   Evaluate conversation membership in a SECURITY DEFINER helper that bypasses RLS,
--   then use that helper in the colleges policy. Existing college-owned policies
--   are left unchanged.

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

drop policy if exists "Players can view colleges in their conversations"
  on public.colleges;

create policy "Players can view colleges in their conversations"
  on public.colleges
  for select
  to authenticated
  using (
    public.player_participates_in_college_conversation(id)
  );
