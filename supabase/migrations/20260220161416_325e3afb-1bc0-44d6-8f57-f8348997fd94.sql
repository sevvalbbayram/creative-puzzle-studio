
-- Fix: Change all restrictive policies to permissive so they actually grant access

-- game_sessions
DROP POLICY IF EXISTS "Anyone authenticated can create sessions" ON public.game_sessions;
CREATE POLICY "Anyone authenticated can create sessions"
  ON public.game_sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Anyone can read session by code to join" ON public.game_sessions;
CREATE POLICY "Anyone can read session by code to join"
  ON public.game_sessions FOR SELECT
  TO authenticated
  USING (status = 'lobby'::game_status);

DROP POLICY IF EXISTS "Players in session can read it" ON public.game_sessions;
CREATE POLICY "Players in session can read it"
  ON public.game_sessions FOR SELECT
  TO authenticated
  USING (is_player_in_session(auth.uid(), id) OR created_by = auth.uid());

DROP POLICY IF EXISTS "Game master can update session" ON public.game_sessions;
CREATE POLICY "Game master can update session"
  ON public.game_sessions FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid());

-- game_players
DROP POLICY IF EXISTS "Players can join sessions" ON public.game_players;
CREATE POLICY "Players can join sessions"
  ON public.game_players FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Players in same session can see each other" ON public.game_players;
CREATE POLICY "Players in same session can see each other"
  ON public.game_players FOR SELECT
  TO authenticated
  USING (is_player_in_session(auth.uid(), session_id) OR user_id = auth.uid());

DROP POLICY IF EXISTS "Players can update own record" ON public.game_players;
CREATE POLICY "Players can update own record"
  ON public.game_players FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Game master can delete players (kick)" ON public.game_players;
CREATE POLICY "Game master can delete players (kick)"
  ON public.game_players FOR DELETE
  TO authenticated
  USING (is_game_master(auth.uid(), session_id) AND user_id <> auth.uid());

-- leaderboard
DROP POLICY IF EXISTS "Anyone can read leaderboard" ON public.leaderboard;
CREATE POLICY "Anyone can read leaderboard"
  ON public.leaderboard FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Players can insert own leaderboard entry" ON public.leaderboard;
CREATE POLICY "Players can insert own leaderboard entry"
  ON public.leaderboard FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Players can update own leaderboard entry" ON public.leaderboard;
CREATE POLICY "Players can update own leaderboard entry"
  ON public.leaderboard FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);
