import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, CheckCircle2, Puzzle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { calculateScore, calculateJigsawScore } from "@/lib/gameData";

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
  placedStatements?: { col: number; statement: string; stageId?: string }[];
}

export function CompletionOverlay({
  completed,
  timeUp = false,
  elapsedMs,
  incorrectAttempts,
  difficulty,
  totalPieces,
  puzzleImageSrc,
  onViewResults,
  onClose,
  placedStatements = [],
}: CompletionOverlayProps) {

  const score = totalPieces
    ? calculateJigsawScore(difficulty, elapsedMs, incorrectAttempts, totalPieces)
    : calculateScore(difficulty, elapsedMs, incorrectAttempts);

  const isJigsaw = !!totalPieces;

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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm safe-area-inset overflow-y-auto py-6"
        >
          <motion.div
            initial={{ scale: 0.5, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 120, damping: 16 }}
            className={`mx-4 w-full rounded-2xl bg-card p-7 sm:p-8 text-center shadow-2xl relative ${puzzleImageSrc ? "max-w-md sm:max-w-lg" : "max-w-sm"}`}
          >
            {onClose && (
              <button
                onClick={onClose}
                className="absolute top-3 right-3 text-muted-foreground hover:text-foreground text-lg leading-none"
                aria-label="Close"
              >
                ✕
              </button>
            )}
          
            <button
              onClick={onViewResults}
              className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Close"
            >
              ✕
            </button>
            {puzzleImageSrc && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-5 overflow-hidden rounded-xl border bg-muted/40 p-2 shadow-inner"
              >
                <img
                  src={puzzleImageSrc}
                  alt="Complete puzzle"
                  className="mx-auto max-h-[min(42vh,360px)] w-full object-contain"
                />
                <p className="mt-2 text-[11px] font-medium text-muted-foreground">The complete puzzle</p>
              </motion.div>
            )}

            {placedStatements.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-5 rounded-xl border bg-muted/40 p-3 text-left"
              >
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Quotes placed
                </p>
                <div className="space-y-1.5 max-h-[180px] overflow-y-auto">
                  {placedStatements.map((s, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="mt-0.5 text-xs">💬</span>
                      <p className="text-xs text-foreground leading-snug">{s.statement}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
            {timeUp ? (
              <>
                <AlertTriangle className="mx-auto h-14 w-14 sm:h-16 sm:w-16 text-secondary" />
                <h2 className="mt-4 font-display text-xl sm:text-2xl font-bold">Time's Up!</h2>
              </>
            ) : (
              <>
                {isJigsaw ? (
                  <motion.div
                    animate={{ rotate: [0, -8, 8, -4, 0] }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                  >
                    <Puzzle className="mx-auto h-14 w-14 sm:h-16 sm:w-16 text-success" />
                  </motion.div>
                ) : (
                  <CheckCircle2 className="mx-auto h-14 w-14 sm:h-16 sm:w-16 text-success" />
                )}
                <h2 className="mt-4 font-display text-xl sm:text-2xl font-bold">
                  {isJigsaw ? "Puzzle Assembled!" : "Puzzle Complete!"} 🎉
                </h2>
              </>
            )}

            <div className="mt-3 space-y-1">
              <p className="text-sm text-muted-foreground">
                Time: {formatTime(elapsedMs)} · Misses: {incorrectAttempts}
              </p>
              {incorrectAttempts === 0 && (
                <p className="text-xs font-semibold text-success">Perfect first try! No trial and error.</p>
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
              className="mt-3 text-3xl sm:text-4xl font-bold text-primary font-display"
            >
              {score} pts
            </motion.p>

            <Button className="mt-6 w-full h-12 text-base font-semibold touch-manipulation" onClick={onViewResults}>
              View Results
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
