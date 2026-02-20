import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Clock, Target, CheckCircle2, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Tables } from "@/integrations/supabase/types";

type GamePlayer = Tables<"game_players">;

interface LiveScoreboardProps {
  players: GamePlayer[];
  open: boolean;
  onClose: () => void;
}

export function LiveScoreboard({ players, open, onClose }: LiveScoreboardProps) {
  const formatTime = (ms: number) => {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    return `${m}:${String(s % 60).padStart(2, "0")}`;
  };

  const sorted = [...players].sort((a, b) => {
    if (a.completed && !b.completed) return -1;
    if (!a.completed && b.completed) return 1;
    return b.score - a.score;
  });

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed right-0 top-0 z-40 flex h-full w-80 max-w-[85vw] flex-col border-l bg-card shadow-2xl"
        >
          <div className="flex items-center justify-between border-b px-4 py-3">
            <h2 className="flex items-center gap-2 font-display text-lg font-bold">
              <Trophy className="h-5 w-5 text-secondary" />
              Live Scoreboard
            </h2>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            <div className="space-y-2">
              {sorted.map((player, i) => (
                <motion.div
                  key={player.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`rounded-lg border p-3 transition-colors ${
                    player.completed
                      ? "border-success/30 bg-success/5"
                      : "border-border bg-background"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        {i + 1}
                      </span>
                      <span className="font-display font-semibold text-sm">
                        {player.nickname}
                      </span>
                      {player.is_game_master && (
                        <span className="rounded bg-secondary/20 px-1.5 py-0.5 text-[10px] font-medium text-secondary">
                          GM
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {player.completed ? (
                        <CheckCircle2 className="h-4 w-4 text-success" />
                      ) : (
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      )}
                    </div>
                  </div>

                  <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Trophy className="h-3 w-3" />
                      {player.score} pts
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatTime(player.elapsed_time_ms)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Target className="h-3 w-3" />
                      {player.incorrect_attempts} miss{player.incorrect_attempts !== 1 ? "es" : ""}
                    </span>
                  </div>
                </motion.div>
              ))}

              {sorted.length === 0 && (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No players yet
                </p>
              )}
            </div>
          </div>

          <div className="border-t px-4 py-3">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{sorted.filter((p) => p.completed).length}/{sorted.length} finished</span>
              <span>Updates in real-time</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
