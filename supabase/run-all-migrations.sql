-- Run this entire file once in Supabase Dashboard → SQL Editor → New query
-- Project: oeptlkevmurogrxfnwsh

-- ========== 1. Schema (enums, tables, RLS, functions) ==========
CREATE TYPE public.game_difficulty AS ENUM ('easy', 'medium', 'hard', 'very_hard');
CREATE TYPE public.game_status AS ENUM ('lobby', 'playing', 'finished');

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

ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_game_master(_user_id UUID, _session_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.game_sessions WHERE id = _session_id AND created_by = _user_id) $$;

CREATE OR REPLACE FUNCTION public.is_player_in_session(_user_id UUID, _session_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.game_players WHERE session_id = _session_id AND user_id = _user_id) $$;

CREATE POLICY "Anyone authenticated can create sessions" ON public.game_sessions FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Players in session can read it" ON public.game_sessions FOR SELECT TO authenticated USING (public.is_player_in_session(auth.uid(), id) OR created_by = auth.uid());
CREATE POLICY "Game master can update session" ON public.game_sessions FOR UPDATE TO authenticated USING (created_by = auth.uid());
CREATE POLICY "Anyone can read session by code to join" ON public.game_sessions FOR SELECT TO authenticated USING (status IN ('lobby'::public.game_status, 'playing'::public.game_status));

CREATE POLICY "Players can join sessions" ON public.game_players FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Players in same session can see each other" ON public.game_players FOR SELECT TO authenticated USING (public.is_player_in_session(auth.uid(), session_id) OR user_id = auth.uid());
CREATE POLICY "Players can update own record" ON public.game_players FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Game master can delete players (kick)" ON public.game_players FOR DELETE TO authenticated USING (public.is_game_master(auth.uid(), session_id) AND user_id <> auth.uid());

CREATE POLICY "Anyone can read leaderboard" ON public.leaderboard FOR SELECT TO authenticated USING (true);
CREATE POLICY "Players can insert own leaderboard entry" ON public.leaderboard FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Players can update own leaderboard entry" ON public.leaderboard FOR UPDATE TO authenticated USING (auth.uid() = user_id);

ALTER PUBLICATION supabase_realtime ADD TABLE public.game_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_players;

CREATE INDEX idx_game_sessions_code ON public.game_sessions(code);
CREATE INDEX idx_game_players_session ON public.game_players(session_id);
CREATE INDEX idx_game_players_user ON public.game_players(user_id);
CREATE INDEX idx_leaderboard_score ON public.leaderboard(total_score DESC);

-- ========== 2. broadcast_messages ==========
CREATE TABLE public.broadcast_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL,
  sender_id uuid NOT NULL,
  message text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
ALTER TABLE public.broadcast_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Game master can send broadcasts" ON public.broadcast_messages FOR INSERT WITH CHECK (is_game_master(auth.uid(), session_id));
CREATE POLICY "Players can read session broadcasts" ON public.broadcast_messages FOR SELECT USING (is_player_in_session(auth.uid(), session_id));
ALTER PUBLICATION supabase_realtime ADD TABLE public.broadcast_messages;

-- ========== 3. paused_at ==========
ALTER TABLE public.game_sessions ADD COLUMN IF NOT EXISTS paused_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;
