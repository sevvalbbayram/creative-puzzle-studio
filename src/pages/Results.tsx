import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Trophy, Clock, Target, Home, RotateCcw, Crown, Puzzle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAnonymousAuth } from "@/hooks/useAnonymousAuth";
import { useGameSession } from "@/hooks/useGameSession";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const Results = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { userId } = useAnonymousAuth();
  const { session, players, currentPlayer } = useGameSession(sessionId ?? null, userId);

  const isGameMaster = currentPlayer?.is_game_master ?? false;
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  // Save to leaderboard on mount
  useEffect(() => {
    if (!currentPlayer || !currentPlayer.completed || currentPlayer.score === 0) return;
    const saveLeaderboard = async () => {
      // Check if entry exists
      const { data: existing } = await supabase
        .from("leaderboard")
        .select("*")
        .eq("user_id", currentPlayer.user_id)
        .maybeSingle();
      if (existing) {
        await supabase
          .from("leaderboard")
          .update({
            total_score: existing.total_score + currentPlayer.score,
            games_played: existing.games_played + 1,
            best_time_ms: existing.best_time_ms
              ? Math.min(existing.best_time_ms, currentPlayer.elapsed_time_ms)
              : currentPlayer.elapsed_time_ms,
            last_played_at: new Date().toISOString(),
            nickname: currentPlayer.nickname,
          })
          .eq("id", existing.id);
      } else {
        await supabase.from("leaderboard").insert({
          user_id: currentPlayer.user_id,
          nickname: currentPlayer.nickname,
          total_score: currentPlayer.score,
          games_played: 1,
          best_time_ms: currentPlayer.elapsed_time_ms,
        });
      }
    };
    saveLeaderboard();
  }, [currentPlayer]);

  const formatTime = (ms: number) => {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    return `${m}:${String(s % 60).padStart(2, "0")}`;
  };

  const getMedal = (index: number) => {
    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    return `#${index + 1}`;
  };

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Puzzle className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center bg-background px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg space-y-6"
      >
        <div className="text-center">
          <Trophy className="mx-auto h-12 w-12 text-secondary" />
          <h1 className="mt-2 text-3xl font-bold">Game Results</h1>
          <p className="text-muted-foreground">
            {session.difficulty.replace("_", " ")} difficulty
          </p>
        </div>

        {/* Scoreboard */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Scoreboard</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {sortedPlayers.map((p, i) => (
                <div
                  key={p.id}
                  className={`flex items-center justify-between rounded-lg border p-3 ${
                    p.user_id === userId ? "border-primary bg-primary/5" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{getMedal(i)}</span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium">{p.nickname}</span>
                        {p.is_game_master && <Crown className="h-3 w-3 text-secondary" />}
                        {p.user_id === userId && (
                          <Badge variant="outline" className="text-[10px]">You</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTime(p.elapsed_time_ms)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Target className="h-3 w-3" />
                          {p.incorrect_attempts} miss
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-primary">{p.score}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1 gap-2" onClick={() => navigate("/")}>
            <Home className="h-4 w-4" />
            Home
          </Button>
          <Button variant="outline" className="flex-1 gap-2" onClick={() => navigate("/leaderboard")}>
            <Trophy className="h-4 w-4" />
            Leaderboard
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default Results;
