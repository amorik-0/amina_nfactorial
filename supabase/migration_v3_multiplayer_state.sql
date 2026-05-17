-- Migration v3: persistent multiplayer rooms.
-- The client stores the whole game snapshot in games.board_state, while
-- Realtime is used only for low-latency notifications.

alter table games
  add column if not exists room_mode text default 'classic',
  add column if not exists player_red_session text,
  add column if not exists player_black_session text,
  add column if not exists move_history jsonb default '[]'::jsonb;

-- Public rooms are intentionally lightweight: no private data is stored here.
drop policy if exists "Authenticated users can create games" on games;
drop policy if exists "Players can update their games" on games;

create policy "Anyone can create lightweight game rooms"
  on games for insert
  with check (true);

create policy "Anyone can update lightweight game rooms"
  on games for update
  using (true)
  with check (true);
