-- Allow players to see which colleges saved them (count / dashboard).
-- Does not expose other players' save rows.

drop policy if exists "Players can view saves of themselves"
  on public.saved_players;

create policy "Players can view saves of themselves"
  on public.saved_players
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.players p
      where p.id = saved_players.player_id
        and p.user_id = auth.uid()
    )
  );
