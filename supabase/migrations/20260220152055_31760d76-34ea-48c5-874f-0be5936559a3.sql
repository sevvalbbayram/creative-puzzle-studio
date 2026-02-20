
-- Difficulty enum
CREATE TYPE public.game_difficulty AS ENUM ('easy', 'medium', 'hard', 'very_hard');

-- Game status enum
CREATE TYPE public.game_status AS ENUM ('lobby', 'playing', 'finished');

-- Game sessions table
CREATE TABLE public.game_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  status public.game_status NOT NULL DEFAULT 'lobby',
  difficulty public.game_difficulty NOT NULL DEFAULT 'medium',
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ
);

-- Game players table
CREATE TABLE public.game_players (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.game_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nickname TEXT NOT NULL,
  is_game_master BOOLEAN NOT NULL DEFAULT false,
  score INTEGER NOT NULL DEFAULT 0,
  incorrect_attempts INTEGER NOT NULL DEFAULT 0,
  elapsed_time_ms INTEGER NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(session_id, user_id)
);

-- Leaderboard table (persistent across sessions)
CREATE TABLE public.leaderboard (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nickname TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  total_score INTEGER NOT NULL DEFAULT 0,
  games_played INTEGER NOT NULL DEFAULT 0,
  best_time_ms INTEGER,
  last_played_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;

-- Helper: check if user is game master of a session
CREATE OR REPLACE FUNCTION public.is_game_master(_user_id UUID, _session_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.game_sessions
    WHERE id = _session_id AND created_by = _user_id
  )
$$;

-- Helper: check if user is in a session
CREATE OR REPLACE FUNCTION public.is_player_in_session(_user_id UUID, _session_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.game_players
    WHERE session_id = _session_id AND user_id = _user_id
  )
$$;

-- game_sessions policies
CREATE POLICY "Anyone authenticated can create sessions"
  ON public.game_sessions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Players in session can read it"
  ON public.game_sessions FOR SELECT TO authenticated
  USING (
    public.is_player_in_session(auth.uid(), id)
    OR created_by = auth.uid()
  );

CREATE POLICY "Game master can update session"
  ON public.game_sessions FOR UPDATE TO authenticated
  USING (created_by = auth.uid());

-- Allow reading sessions by code for joining (before player exists)
CREATE POLICY "Anyone can read session by code to join"
  ON public.game_sessions FOR SELECT TO authenticated
  USING (status = 'lobby');

-- game_players policies
CREATE POLICY "Players can join sessions"
  ON public.game_players FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Players in same session can see each other"
  ON public.game_players FOR SELECT TO authenticated
  USING (
    public.is_player_in_session(auth.uid(), session_id)
    OR user_id = auth.uid()
  );

CREATE POLICY "Players can update own record"
  ON public.game_players FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Game master can delete players (kick)"
  ON public.game_players FOR DELETE TO authenticated
  USING (
    public.is_game_master(auth.uid(), session_id)
    AND user_id != auth.uid()
  );

-- leaderboard policies
CREATE POLICY "Anyone can read leaderboard"
  ON public.leaderboard FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Players can insert own leaderboard entry"
  ON public.leaderboard FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Players can update own leaderboard entry"
  ON public.leaderboard FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- Enable realtime for game tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_players;

-- Indexes for performance
CREATE INDEX idx_game_sessions_code ON public.game_sessions(code);
CREATE INDEX idx_game_players_session ON public.game_players(session_id);
CREATE INDEX idx_game_players_user ON public.game_players(user_id);
CREATE INDEX idx_leaderboard_score ON public.leaderboard(total_score DESC);
