import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback, useRef } from "react";
import { Clock, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAnonymousAuth } from "@/hooks/useAnonymousAuth";
import { useGameSession } from "@/hooks/useGameSession";
import { CREATIVITY_STAGES, DIFFICULTY_CONFIG, calculateScore } from "@/lib/gameData";
import { playCorrectSound, playIncorrectSound, playCelebrationSound } from "@/lib/audioFeedback";
import { PuzzleBoard } from "@/components/game/PuzzleBoard";
import { PiecesTray } from "@/components/game/PiecesTray";
import { CompletionOverlay } from "@/components/game/CompletionOverlay";
import { InstructionsModal } from "@/components/InstructionsModal";
import { ThemeToggle } from "@/components/ThemeToggle";
import confetti from "canvas-confetti";

interface PieceState {
  id: string;
  type: "stage" | "quote";
  stageId: string;
  label: string;
  placed: boolean;
}

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const Game = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { userId } = useAnonymousAuth();
  const { session, currentPlayer, updateScore } = useGameSession(sessionId ?? null, userId);

  const [phase, setPhase] = useState<1 | 2>(1);
  const [pieces, setPieces] = useState<PieceState[]>([]);
  const [slots, setSlots] = useState<{ id: string; stageId: string; filled: boolean; type: "stage" | "quote" }[]>([]);
  const [selectedPiece, setSelectedPiece] = useState<string | null>(null);
  const [incorrectAttempts, setIncorrectAttempts] = useState(0);
  const [feedback, setFeedback] = useState<{ type: "correct" | "incorrect"; slotId: string } | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
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
        playCelebrationSound();
        confetti({ particleCount: 300, spread: 120, origin: { y: 0.5 } });
        setTimeout(() => confetti({ particleCount: 100, spread: 60, origin: { x: 0.2, y: 0.7 } }), 300);
        setTimeout(() => confetti({ particleCount: 100, spread: 60, origin: { x: 0.8, y: 0.7 } }), 600);
      }
    }
  }, [phase, slots, completed, difficulty, elapsedMs, incorrectAttempts, updateScore]);

  const handleSlotTap = useCallback(
    (slotId: string, slotStageId: string, slotType: "stage" | "quote") => {
      if (!selectedPiece) return;
      const piece = pieces.find((p) => p.id === selectedPiece);
      if (!piece) return;

      if (piece.stageId === slotStageId && piece.type === slotType) {
        // Correct!
        playCorrectSound();
        confetti({ particleCount: 40, spread: 50, origin: { y: 0.6 } });
        setFeedback({ type: "correct", slotId });
        setPieces((prev) => prev.map((p) => (p.id === piece.id ? { ...p, placed: true } : p)));
        setSlots((prev) => prev.map((s) => (s.id === slotId ? { ...s, filled: true } : s)));
        setTimeout(() => setFeedback(null), 800);
      } else {
        // Incorrect
        playIncorrectSound();
        setFeedback({ type: "incorrect", slotId });
        setIncorrectAttempts((prev) => prev + 1);
        setTimeout(() => setFeedback(null), 500);
      }
      setSelectedPiece(null);
    },
    [selectedPiece, pieces]
  );

  const handlePieceSelect = useCallback((pieceId: string) => {
    setSelectedPiece((prev) => (prev === pieceId ? null : pieceId));
  }, []);

  const totalPieces = 10;
  const actualPlaced = phase === 1
    ? pieces.filter((p) => p.placed).length
    : 5 + pieces.filter((p) => p.placed).length;

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

  const currentSlots = phase === 1
    ? slots.filter((s) => s.type === "stage")
    : slots;

  if (!session) return null;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <InstructionsModal />

      {/* Top Bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b bg-card/80 px-3 py-2 backdrop-blur-sm sm:px-4 sm:py-3">
        <div className="flex items-center gap-2 sm:gap-3">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="font-display text-base font-semibold tabular-nums sm:text-lg">
            {timeRemaining !== null ? formatTime(timeRemaining) : formatTime(elapsedMs)}
          </span>
          {timeRemaining !== null && (
            <span className="hidden text-xs text-muted-foreground sm:inline">remaining</span>
          )}
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="text-xs text-muted-foreground sm:text-sm">
            {incorrectAttempts} miss{incorrectAttempts !== 1 ? "es" : ""}
          </span>
          <PhaseBadge phase={phase} />
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => {
              localStorage.removeItem("puzzle-instructions-seen");
              window.location.reload();
            }}
            aria-label="Show instructions"
          >
            <HelpCircle className="h-4 w-4" />
          </Button>
          <ThemeToggle />
        </div>
      </header>

      {/* Progress */}
      <div className="px-3 pt-2 sm:px-4 sm:pt-3">
        <Progress value={(actualPlaced / totalPieces) * 100} className="h-2" />
        <p className="mt-1 text-center text-xs text-muted-foreground">
          {actualPlaced} / {totalPieces} pieces placed
        </p>
      </div>

      {/* Main Game Area */}
      <main className="flex flex-1 flex-col gap-4 p-3 sm:gap-6 sm:p-4 md:flex-row">
        {/* Puzzle Board */}
        <div className="flex-1">
          <PuzzleBoard
            phase={phase}
            currentSlots={currentSlots}
            feedback={feedback}
            onSlotTap={handleSlotTap}
            selectedPiece={selectedPiece}
          />
        </div>

        {/* Pieces Tray */}
        <PiecesTray
          phase={phase}
          pieces={pieces}
          selectedPiece={selectedPiece}
          onPieceSelect={handlePieceSelect}
        />
      </main>

      {/* Completion Overlay */}
      <CompletionOverlay
        completed={completed}
        timeUp={timeUp}
        elapsedMs={elapsedMs}
        incorrectAttempts={incorrectAttempts}
        difficulty={difficulty}
        onViewResults={() => navigate(`/results/${sessionId}`)}
      />
    </div>
  );
};

function PhaseBadge({ phase }: { phase: number }) {
  return (
    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary sm:px-3 sm:py-1 sm:text-xs">
      Phase {phase}: {phase === 1 ? "Stages" : "Quotes"}
    </span>
  );
}

export default Game;
