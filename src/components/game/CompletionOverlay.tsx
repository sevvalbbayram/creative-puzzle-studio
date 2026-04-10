import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Puzzle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { calculateScore, calculateJigsawScore } from "@/lib/gameData";

export interface PlacedStatement {
  row: number;
  col: number;
  statement: string;
  stageId?: string;
}

interface CompletionOverlayProps {
  completed: boolean;
  timeUp?: boolean;
  elapsedMs: number;
  incorrectAttempts: number;
  difficulty: string;
  totalPieces?: number;
  puzzleImageSrc?: string;
  onViewResults: () => void;
  onClose?: () => void;
  placedStatements?: PlacedStatement[];
}

export function CompletionOverlay({
  completed,
  timeUp = false,
  elapsedMs,
  incorrectAttempts,
  difficulty,
  totalPieces,
  onViewResults,
  onClose,
}: CompletionOverlayProps) {
  const formatTime = (ms: number) => {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    return `${m}:${String(s % 60).padStart(2, "0")}`;
  };

  const score = totalPieces
    ? calculateJigsawScore(difficulty, elapsedMs, incorrectAttempts, totalPieces)
    : calculateScore(difficulty, elapsedMs, incorrectAttempts);

  const isJigsaw = !!totalPieces;

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
            transition={{ type: "spring", stiffness: 120, damping: 16 }}
            className="relative mx-4 w-full max-w-sm rounded-2xl bg-card p-8 text-center shadow-2xl"
          >
            {/* X close button */}
            {onClose && (
              <button
                onClick={onClose}
                className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground hover:text-foreground transition-colors text-base"
                aria-label="Close"
              >
                ✕
              </button>
            )}

            {timeUp ? (
              <>
                <AlertTriangle className="mx-auto h-14 w-14 text-secondary" />
                <h2 className="mt-4 font-display text-2xl font-bold">Time's Up!</h2>
              </>
            ) : (
              <>
                <motion.div
                  animate={{ rotate: [0, -8, 8, -4, 0] }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                >
                  <Puzzle className="mx-auto h-14 w-14 text-success" />
                </motion.div>
                <h2 className="mt-4 font-display text-2xl font-bold">
                  {isJigsaw ? "Puzzle Assembled!" : "Puzzle Complete!"} 🎉
                </h2>
              </>
            )}

            <div className="mt-4 space-y-1">
              <p className="text-sm text-muted-foreground">
                Time: {formatTime(elapsedMs)} · Misses: {incorrectAttempts}
              </p>
              {incorrectAttempts === 0 && (
                <p className="text-xs font-semibold text-success">
                  Perfect — no trial and error!
                </p>
              )}
              {isJigsaw && (
                <p className="text-xs text-muted-foreground">
                  {totalPieces} pieces · {difficulty} difficulty
                </p>
              )}
            </div>

            <motion.p
              initial={{ scale: 0.8 }}
              animate={{ scale: [0.8, 1.15, 1] }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="mt-4 text-4xl font-bold text-primary font-display"
            >
              {score} pts
            </motion.p>

            <Button
              className="mt-6 w-full h-12 text-base font-semibold"
              onClick={onViewResults}
            >
              View Results & Full Puzzle
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}