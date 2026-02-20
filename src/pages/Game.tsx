import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, AlertTriangle, CheckCircle2, Puzzle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAnonymousAuth } from "@/hooks/useAnonymousAuth";
import { useGameSession } from "@/hooks/useGameSession";
import { CREATIVITY_STAGES, DIFFICULTY_CONFIG, calculateScore } from "@/lib/gameData";
import confetti from "canvas-confetti";
import elephantImg from "@/assets/elephant-puzzle.png";

interface PieceState {
  id: string;
  type: "stage" | "quote";
  stageId: string;
  label: string;
  placed: boolean;
}

const Game = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { userId } = useAnonymousAuth();
  const { session, currentPlayer, updateScore } = useGameSession(sessionId ?? null, userId);

  const [phase, setPhase] = useState<1 | 2>(1); // 1 = stages, 2 = quotes
  const [pieces, setPieces] = useState<PieceState[]>([]);
  const [slots, setSlots] = useState<{ id: string; stageId: string; filled: boolean; type: "stage" | "quote" }[]>([]);
  const [draggedPiece, setDraggedPiece] = useState<string | null>(null);
  const [incorrectAttempts, setIncorrectAttempts] = useState(0);
  const [feedback, setFeedback] = useState<{ type: "correct" | "incorrect"; slotId: string } | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [completed, setCompleted] = useState(false);
  const startTimeRef = useRef<number>(Date.now());
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  const difficulty = session?.difficulty ?? "medium";
  const config = DIFFICULTY_CONFIG[difficulty] || DIFFICULTY_CONFIG.medium;

  // Initialize pieces
  useEffect(() => {
    const stagePieces: PieceState[] = CREATIVITY_STAGES.map((s) => ({
      id: `stage-${s.id}`,
      type: "stage" as const,
      stageId: s.id,
      label: s.name,
      placed: false,
    }));
    // Shuffle
    setPieces(shuffleArray(stagePieces));

    const stageSlots = CREATIVITY_STAGES.map((s) => ({
      id: `slot-stage-${s.id}`,
      stageId: s.id,
      filled: false,
      type: "stage" as const,
    }));
    setSlots(stageSlots);
  }, []);

  // Timer
  useEffect(() => {
    startTimeRef.current = Date.now();
    timerRef.current = setInterval(() => {
      setElapsedMs(Date.now() - startTimeRef.current);
    }, 100);
    return () => clearInterval(timerRef.current);
  }, []);

  // Redirect when game finishes
  useEffect(() => {
    if (session?.status === "finished") {
      navigate(`/results/${session.id}`);
    }
  }, [session?.status, session?.id, navigate]);

  // Move to phase 2 when all stages placed
  useEffect(() => {
    if (phase === 1) {
      const allStagesPlaced = slots.every((s) => s.type === "stage" && s.filled);
      if (allStagesPlaced && slots.length > 0) {
        // Transition to phase 2
        const quotePieces: PieceState[] = CREATIVITY_STAGES.map((s) => ({
          id: `quote-${s.id}`,
          type: "quote" as const,
          stageId: s.id,
          label: s.quote,
          placed: false,
        }));
        setPieces(shuffleArray(quotePieces));
        const quoteSlots = CREATIVITY_STAGES.map((s) => ({
          id: `slot-quote-${s.id}`,
          stageId: s.id,
          filled: false,
          type: "quote" as const,
        }));
        setSlots((prev) => [...prev, ...quoteSlots]);
        setPhase(2);
      }
    }
  }, [phase, slots]);

  // Check completion (phase 2 all quotes placed)
  useEffect(() => {
    if (phase === 2 && !completed) {
      const quoteSlots = slots.filter((s) => s.type === "quote");
      if (quoteSlots.length > 0 && quoteSlots.every((s) => s.filled)) {
        setCompleted(true);
        clearInterval(timerRef.current);
        const finalScore = calculateScore(difficulty, elapsedMs, incorrectAttempts);
        updateScore(finalScore, incorrectAttempts, elapsedMs, true);
        confetti({ particleCount: 200, spread: 90, origin: { y: 0.6 } });
      }
    }
  }, [phase, slots, completed, difficulty, elapsedMs, incorrectAttempts, updateScore]);

  const handleDrop = useCallback(
    (slotId: string, slotStageId: string, slotType: "stage" | "quote") => {
      if (!draggedPiece) return;
      const piece = pieces.find((p) => p.id === draggedPiece);
      if (!piece) return;

      // Check match
      if (piece.stageId === slotStageId && piece.type === slotType) {
        // Correct!
        setFeedback({ type: "correct", slotId });
        setPieces((prev) => prev.map((p) => (p.id === piece.id ? { ...p, placed: true } : p)));
        setSlots((prev) => prev.map((s) => (s.id === slotId ? { ...s, filled: true } : s)));
        setTimeout(() => setFeedback(null), 800);
      } else {
        // Incorrect
        setFeedback({ type: "incorrect", slotId });
        setIncorrectAttempts((prev) => prev + 1);
        setTimeout(() => setFeedback(null), 500);
      }
      setDraggedPiece(null);
    },
    [draggedPiece, pieces]
  );

  const totalPieces = 10;
  const placedCount = pieces.filter((p) => p.placed).length + (phase === 2 ? 5 : 0) - (phase === 2 ? pieces.filter(p => !p.placed && p.type === "quote").length : 0);
  const actualPlaced = phase === 1
    ? pieces.filter(p => p.placed).length
    : 5 + pieces.filter(p => p.placed).length;

  const formatTime = (ms: number) => {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    return `${m}:${String(s % 60).padStart(2, "0")}`;
  };

  const timeRemaining = config.timeLimitSeconds
    ? Math.max(0, config.timeLimitSeconds * 1000 - elapsedMs)
    : null;
  const timeUp = timeRemaining !== null && timeRemaining <= 0;

  // Time up handling
  useEffect(() => {
    if (timeUp && !completed) {
      clearInterval(timerRef.current);
      setCompleted(true);
      const finalScore = calculateScore(difficulty, elapsedMs, incorrectAttempts);
      updateScore(finalScore, incorrectAttempts, elapsedMs, true);
    }
  }, [timeUp, completed, difficulty, elapsedMs, incorrectAttempts, updateScore]);

  const unplacedPieces = pieces.filter((p) => !p.placed);
  const currentSlots = phase === 1
    ? slots.filter((s) => s.type === "stage")
    : slots;

  const stageColors: Record<string, string> = {
    preparation: "bg-stage-preparation",
    incubation: "bg-stage-incubation",
    illumination: "bg-stage-illumination",
    evaluation: "bg-stage-evaluation",
    elaboration: "bg-stage-elaboration",
  };

  if (!session) return null;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b bg-card/80 px-4 py-3 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="font-display text-lg font-semibold tabular-nums">
            {timeRemaining !== null ? formatTime(timeRemaining) : formatTime(elapsedMs)}
          </span>
          {timeRemaining !== null && (
            <span className="text-xs text-muted-foreground">remaining</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            {incorrectAttempts} miss{incorrectAttempts !== 1 ? "es" : ""}
          </span>
          <Badge phase={phase} />
        </div>
      </header>

      {/* Progress */}
      <div className="px-4 pt-3">
        <Progress value={(actualPlaced / totalPieces) * 100} className="h-2" />
        <p className="mt-1 text-center text-xs text-muted-foreground">
          {actualPlaced} / {totalPieces} pieces placed
        </p>
      </div>

      {/* Main Game Area */}
      <main className="flex flex-1 flex-col gap-6 p-4 md:flex-row">
        {/* Puzzle Board */}
        <div className="flex-1">
          <div className="relative mx-auto aspect-video max-w-2xl overflow-hidden rounded-xl border-2 border-primary/20 shadow-lg">
            <img
              src={elephantImg}
              alt="Creativity Elephant Puzzle"
              className="h-full w-full object-cover"
            />
            {/* Drop Slots overlayed on the image */}
            <div className="absolute inset-0 grid grid-cols-5 gap-2 p-4 md:p-6">
              {CREATIVITY_STAGES.map((stage, i) => {
                const stageSlot = currentSlots.find(
                  (s) => s.stageId === stage.id && s.type === "stage"
                );
                const quoteSlot = currentSlots.find(
                  (s) => s.stageId === stage.id && s.type === "quote"
                );

                return (
                  <div key={stage.id} className="flex flex-col items-center justify-center gap-2">
                    {/* Stage name slot */}
                    {stageSlot && (
                      <div
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => handleDrop(stageSlot.id, stageSlot.stageId, "stage")}
                        onTouchEnd={() => {
                          if (draggedPiece) handleDrop(stageSlot.id, stageSlot.stageId, "stage");
                        }}
                        className={`flex h-10 w-full items-center justify-center rounded-lg border-2 border-dashed text-xs font-semibold transition-all md:h-12 md:text-sm ${
                          stageSlot.filled
                            ? `${stageColors[stage.id]} border-solid text-white`
                            : "border-white/60 bg-black/30 text-white/80"
                        } ${
                          feedback?.slotId === stageSlot.id && feedback.type === "correct"
                            ? "animate-glow-correct"
                            : ""
                        } ${
                          feedback?.slotId === stageSlot.id && feedback.type === "incorrect"
                            ? "animate-shake border-destructive"
                            : ""
                        }`}
                      >
                        {stageSlot.filled ? stage.name : (i + 1)}
                      </div>
                    )}
                    {/* Quote slot (phase 2) */}
                    {phase === 2 && quoteSlot && (
                      <div
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => handleDrop(quoteSlot.id, quoteSlot.stageId, "quote")}
                        onTouchEnd={() => {
                          if (draggedPiece) handleDrop(quoteSlot.id, quoteSlot.stageId, "quote");
                        }}
                        className={`flex min-h-[3rem] w-full items-center justify-center rounded-lg border-2 border-dashed p-1 text-[10px] leading-tight transition-all md:min-h-[4rem] md:text-xs ${
                          quoteSlot.filled
                            ? `${stageColors[stage.id]} border-solid text-white`
                            : "border-white/40 bg-black/20 text-white/70"
                        } ${
                          feedback?.slotId === quoteSlot.id && feedback.type === "correct"
                            ? "animate-glow-correct"
                            : ""
                        } ${
                          feedback?.slotId === quoteSlot.id && feedback.type === "incorrect"
                            ? "animate-shake border-destructive"
                            : ""
                        }`}
                      >
                        {quoteSlot.filled ? stage.quote.slice(0, 50) + "..." : "?"}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Pieces Tray */}
        <div className="w-full md:w-72">
          <h3 className="mb-3 font-display text-lg font-semibold">
            {phase === 1 ? "Stage Names" : "Quotes"} — Drag to place
          </h3>
          <div className="space-y-2">
            <AnimatePresence>
              {unplacedPieces.map((piece) => (
                <motion.div
                  key={piece.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  draggable
                  onDragStart={() => setDraggedPiece(piece.id)}
                  onTouchStart={() => setDraggedPiece(piece.id)}
                  className={`cursor-grab select-none rounded-lg border-2 p-3 text-sm font-medium shadow-sm transition-colors active:cursor-grabbing ${
                    draggedPiece === piece.id
                      ? "border-primary bg-primary/10"
                      : "border-border bg-card hover:border-primary/50"
                  }`}
                >
                  {piece.type === "stage" ? (
                    <span className="font-display">{piece.label}</span>
                  ) : (
                    <span className="italic text-muted-foreground">"{piece.label}"</span>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Completion Overlay */}
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
              <Button className="mt-6 w-full" onClick={() => navigate(`/results/${sessionId}`)}>
                View Results
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

function Badge({ phase }: { phase: number }) {
  return (
    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
      Phase {phase}: {phase === 1 ? "Stages" : "Quotes"}
    </span>
  );
}

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default Game;
