-- Migration v4: fix RLS + add record_game_result for stats tracking
-- Run in Supabase SQL Editor after migration_v3_multiplayer_state.sql

-- 1. Tighten RLS on games table
--    v3 left insert/update wide open (with check (true)).
--    Games have no sensitive data, but unauthenticated inserts are bad practice.
drop policy if exists "Anyone can create lightweight game rooms" on games;
drop policy if exists "Anyone can update lightweight game rooms" on games;

create policy "Authenticated users can create game rooms"
  on games for insert
  with check (auth.uid() is not null);

-- Updates are still open because session IDs (not auth UIDs) drive multiplayer;
-- restricting by player_red/player_black UUID is only possible once we store them.
-- This is acceptable: games contain no private data.
create policy "Anyone can update game rooms"
  on games for update
  using (true)
  with check (true);

-- 2. Atomic game-result recorder
--    Called by /api/game/finish once per game (idempotent via status guard).
--    Returns true if stats were updated, false if already recorded or room not found.
create or replace function record_game_result(
  p_room_id text,
  p_result  text   -- 'red' | 'black' | 'draw'
) returns boolean as $$
declare
  v_game games%rowtype;
begin
  -- Lock row to prevent a race between the two players calling this simultaneously
  select * into v_game
  from games
  where room_id = p_room_id
  for update;

  if v_game.id is null then return false; end if;

  -- Idempotency guard: don't double-count if already processed
  if v_game.status = 'stats_recorded' then return false; end if;

  -- Mark as processed first (prevents concurrent second call from also recording)
  update games
  set
    status = 'stats_recorded',
    winner = case p_result
               when 'red'   then v_game.player_red
               when 'black' then v_game.player_black
               else null
             end
  where room_id = p_room_id;

  -- Update winner
  if p_result = 'red' and v_game.player_red is not null then
    update profiles set wins   = wins   + 1 where id = v_game.player_red;
    if v_game.player_black is not null then
      update profiles set losses = losses + 1 where id = v_game.player_black;
    end if;

  elsif p_result = 'black' and v_game.player_black is not null then
    update profiles set wins   = wins   + 1 where id = v_game.player_black;
    if v_game.player_red is not null then
      update profiles set losses = losses + 1 where id = v_game.player_red;
    end if;

  elsif p_result = 'draw' then
    if v_game.player_red   is not null then
      update profiles set draws = draws + 1 where id = v_game.player_red;
    end if;
    if v_game.player_black is not null then
      update profiles set draws = draws + 1 where id = v_game.player_black;
    end if;
  end if;

  return true;
end;
$$ language plpgsql security definer;
