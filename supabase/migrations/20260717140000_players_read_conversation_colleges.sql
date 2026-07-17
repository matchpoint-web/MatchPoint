-- Allow players to read college profiles for conversations they participate in.
-- Needed so the player inbox can show school name / location.

drop policy if exists "Players can view colleges in their conversations"
  on public.colleges;

create policy "Players can view colleges in their conversations"
  on public.colleges
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.conversations conv
      join public.players p on p.id = conv.player_id
      where conv.college_id = colleges.id
        and p.user_id = auth.uid()
    )
  );
