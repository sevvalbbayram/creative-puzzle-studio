-- Allow reading game_sessions by code when status is 'lobby' OR 'playing' (for late joiners)
DROP POLICY IF EXISTS "Anyone can read session by code to join" ON public.game_sessions;
CREATE POLICY "Anyone can read session by code to join"
  ON public.game_sessions FOR SELECT
  TO authenticated
  USING (status IN ('lobby'::public.game_status, 'playing'::public.game_status));
