
-- Create broadcast messages table for teacher-to-student messaging
CREATE TABLE public.broadcast_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL,
  sender_id uuid NOT NULL,
  message text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.broadcast_messages ENABLE ROW LEVEL SECURITY;

-- Game master can insert messages
CREATE POLICY "Game master can send broadcasts"
  ON public.broadcast_messages FOR INSERT
  WITH CHECK (is_game_master(auth.uid(), session_id));

-- Players in session can read messages
CREATE POLICY "Players can read session broadcasts"
  ON public.broadcast_messages FOR SELECT
  USING (is_player_in_session(auth.uid(), session_id));

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.broadcast_messages;
