-- Allow college accounts to read player profiles for recruiting search.

drop policy if exists "Colleges can view player profiles" on public.players;
create policy "Colleges can view player profiles"
  on public.players
  for select
  to authenticated
  using (
    coalesce(auth.jwt() -> 'user_metadata' ->> 'role', '') = 'college'
  );
