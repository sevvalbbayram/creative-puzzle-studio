
-- Add paused_at column to game_sessions for pause/resume functionality
ALTER TABLE public.game_sessions ADD COLUMN paused_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;
