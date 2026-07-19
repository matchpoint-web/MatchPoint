-- Allow players to browse college programs in College Search.
-- Colleges can still view/update only their own row via existing policies.
-- SELECT policies are OR'd, so conversation-scoped access remains valid.

drop policy if exists "Players can view college profiles" on public.colleges;
create policy "Players can view college profiles"
  on public.colleges
  for select
  to authenticated
  using (
    coalesce(auth.jwt() -> 'user_metadata' ->> 'role', '') = 'player'
  );
