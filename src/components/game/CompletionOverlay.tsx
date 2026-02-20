import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { calculateScore } from "@/lib/gameData";

interface CompletionOverlayProps {
  completed: boolean;
  timeUp: boolean;
  elapsedMs: number;
  incorrectAttempts: number;
  difficulty: string;
  onViewResults: () => void;
}

export function CompletionOverlay({
  completed,
  timeUp,
  elapsedMs,
  incorrectAttempts,
  difficulty,
  onViewResults,
}: CompletionOverlayProps) {
  const formatTime = (ms: number) => {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    return `${m}:${String(s % 60).padStart(2, "0")}`;
  };

  return (
    <AnimatePresence>
      {completed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.5, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            className="mx-4 w-full max-w-sm rounded-2xl bg-card p-8 text-center shadow-2xl"
          >
            {timeUp ? (
              <>
                <AlertTriangle className="mx-auto h-16 w-16 text-secondary" />
                <h2 className="mt-4 text-2xl font-bold">Time's Up!</h2>
              </>
            ) : (
              <>
                <CheckCircle2 className="mx-auto h-16 w-16 text-success" />
                <h2 className="mt-4 text-2xl font-bold">Puzzle Complete! 🎉</h2>
              </>
            )}
            <p className="mt-2 text-muted-foreground">
              Time: {formatTime(elapsedMs)} · Misses: {incorrectAttempts}
            </p>
            <p className="mt-1 text-3xl font-bold text-primary">
              {calculateScore(difficulty, elapsedMs, incorrectAttempts)} pts
            </p>
            <Button className="mt-6 w-full" onClick={onViewResults}>
              View Results
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
