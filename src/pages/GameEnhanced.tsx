import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, HelpCircle, Users, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAnonymousAuth } from "@/hooks/useAnonymousAuth";
import { useGameSession } from "@/hooks/useGameSession";
import { CREATIVITY_STAGES, getRandomizedStages, DIFFICULTY_CONFIG, calculateScore } from "@/lib/gameData";
import { playCorrectSound, playIncorrectSound, playCelebrationSound } from "@/lib/audioFeedback";
import { JigsawPuzzleBoard } from "@/components/game/JigsawPuzzleBoard";
import { MobileOptimizedPiecesTray } from "@/components/game/MobileOptimizedPiecesTray";
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

interface PuzzlePiece {
  id: string;
  stageId: string;
  type: "stage" | "quote";
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  filled: boolean;
  label: string;
}

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const GameEnhanced = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { userId } = useAnonymousAuth();
  const { session, players, currentPlayer, updateScore } = useGameSession(sessionId ?? null, userId);
  const isGameMaster = currentPlayer?.is_game_master ?? false;

  const [phase, setPhase] = useState<1 | 2>(1);
  const [pieces, setPieces] = useState<PieceState[]>([]);
  const [puzzlePieces, setPuzzlePieces] = useState<PuzzlePiece[]>([]);
  const [selectedPiece, setSelectedPiece] = useState<string | null>(null);
  const [incorrectAttempts, setIncorrectAttempts] = useState(0);
  const [feedback, setFeedback] = useState<{ type: "correct" | "incorrect"; slotId: string } | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [phaseTransition, setPhaseTransition] = useState(false);
  const [showHalfwayToast, setShowHalfwayToast] = useState(false);
  const [comboStreak, setComboStreak] = useState(0);
  const [showCombo, setShowCombo] = useState(false);
  const [broadcastToast, setBroadcastToast] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const halfwayTriggered = useRef(false);
  const startTimeRef = useRef<number>(Date.now());
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  const difficulty = session?.difficulty ?? "medium";
  const config = DIFFICULTY_CONFIG[difficulty] || DIFFICULTY_CONFIG.medium;

  // Randomize quotes once per game session
  const [stages] = useState(() => getRandomizedStages());

  // Handle responsive design
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Initialize pieces
  useEffect(() => {
    const stagePieces: PieceState[] = stages.map((s) => ({
      id: `stage-${s.id}`,
      type: "stage" as const,
      stageId: s.id,
      label: s.name,
      placed: false,
    }));
    setPieces(shuffleArray(stagePieces));

    const puzzlePiecesInit: PuzzlePiece[] = stages.map((s) => ({
      id: `slot-stage-${s.id}`,
      stageId: s.id,
      type: "stage" as const,
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      rotation: 0,
      filled: false,
      label: s.name,
    }));
    setPuzzlePieces(puzzlePiecesInit);
  }, [stages]);

  const isPaused = !!session?.paused_at;
  const pausedAccumulatedRef = useRef(0);
  const lastPauseRef = useRef<number | null>(null);

  // Timer — pauses when session is paused
  useEffect(() => {
    startTimeRef.current = Date.now();
    timerRef.current = setInterval(() => {
      if (isPaused) {
        if (!lastPauseRef.current) lastPauseRef.current = Date.now();
        return;
      }
      if (lastPauseRef.current) {
        pausedAccumulatedRef.current += Date.now() - lastPauseRef.current;
        lastPauseRef.current = null;
      }
      setElapsedMs(Date.now() - startTimeRef.current - pausedAccumulatedRef.current);
    }, 100);
    return () => clearInterval(timerRef.current);
  }, [isPaused]);

  // Redirect when game finishes
  useEffect(() => {
    if (session?.status === "finished") {
      navigate(`/results/${session.id}`);
    }
  }, [session?.status, session?.id, navigate]);

  // Redirect Game Master to the Teacher Dashboard
  useEffect(() => {
    if (isGameMaster && session) {
      navigate(`/dashboard/${sessionId}`, { replace: true });
    }
  }, [isGameMaster, session, sessionId, navigate]);

  // Listen for teacher broadcast messages
  useEffect(() => {
    if (!sessionId) return;
    const channel = supabase
      .channel(`broadcasts-${sessionId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "broadcast_messages", filter: `session_id=eq.${sessionId}` },
        (payload) => {
          const msg = (payload.new as { message: string }).message;
          setBroadcastToast(msg);
          setTimeout(() => setBroadcastToast(null), 5000);
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [sessionId]);

  // Phase transition logic
  useEffect(() => {
    if (phase === 1 && !phaseTransition) {
      const allStagesPlaced = pieces.filter((p) => p.type === "stage").every((s) => s.placed);
      if (allStagesPlaced && pieces.filter((p) => p.type === "stage").length > 0) {
        setPhaseTransition(true);
        playCorrectSound();
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.5 } });

        setTimeout(() => {
          const quotePieces: PieceState[] = stages.map((s) => ({
            id: `quote-${s.id}`,
            type: "quote" as const,
            stageId: s.id,
            label: s.quote,
            placed: false,
          }));
          setPieces((prev) => [...prev, ...shuffleArray(quotePieces)]);
          
          const quoteSlots: PuzzlePiece[] = stages.map((s) => ({
            id: `slot-quote-${s.id}`,
            stageId: s.id,
            type: "quote" as const,
            x: 0,
            y: 0,
            width: 100,
            height: 100,
            rotation: 0,
            filled: false,
            label: s.quote,
          }));
          setPuzzlePieces((prev) => [...prev, ...quoteSlots]);
          setPhase(2);
          setPhaseTransition(false);
        }, 2500);
      }
    }
  }, [phase, pieces, stages, phaseTransition]);

  // Check completion (phase 2 all quotes placed)
  useEffect(() => {
    if (phase === 2 && !completed) {
      const quoteSlots = puzzlePieces.filter((s) => s.type === "quote");
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
  }, [phase, puzzlePieces, completed, difficulty, elapsedMs, incorrectAttempts, updateScore]);

  // 50% milestone celebration
  useEffect(() => {
    if (halfwayTriggered.current) return;
    const placed = phase === 1
      ? pieces.filter((p) => p.placed).length
      : 5 + pieces.filter((p) => p.placed).length;
    if (placed >= 5) {
      halfwayTriggered.current = true;
      setShowHalfwayToast(true);
      confetti({ particleCount: 60, spread: 55, origin: { y: 0.6 } });
      playCorrectSound();
      setTimeout(() => setShowHalfwayToast(false), 2200);
    }
  }, [phase, pieces]);

  const handleSlotTap = useCallback(
    (slotId: string, slotStageId: string, slotType: "stage" | "quote") => {
      if (!selectedPiece) return;
      const piece = pieces.find((p) => p.id === selectedPiece);
      if (!piece) return;

      if (piece.stageId === slotStageId && piece.type === slotType) {
        // Correct!
        const newStreak = comboStreak + 1;
        setComboStreak(newStreak);
        playCorrectSound();
        confetti({ particleCount: 40 + newStreak * 10, spread: 50 + newStreak * 5, origin: { y: 0.6 } });
        setFeedback({ type: "correct", slotId });
        setPieces((prev) => prev.map((p) => (p.id === piece.id ? { ...p, placed: true } : p)));
        setPuzzlePieces((prev) => prev.map((s) => (s.id === slotId ? { ...s, filled: true } : s)));
        if (newStreak >= 2) {
          setShowCombo(true);
          setTimeout(() => setShowCombo(false), 1200);
        }
        setTimeout(() => setFeedback(null), 800);
      } else {
        // Incorrect
        playIncorrectSound();
        setFeedback({ type: "incorrect", slotId });
        setIncorrectAttempts((prev) => prev + 1);
        setComboStreak(0);
        setTimeout(() => setFeedback(null), 500);
      }
      setSelectedPiece(null);
    },
    [selectedPiece, pieces, comboStreak]
  );

  const handlePieceSelect = useCallback((pieceId: string) => {
    setSelectedPiece((prev) => (prev === pieceId ? null : pieceId));
  }, []);

  const handleDragStart = useCallback((pieceId: string) => {
    setSelectedPiece(pieceId);
  }, []);

  const handleDragEnd = useCallback(() => {
    // Don't clear on drag end — the drop handler will clear it
  }, []);

  const handleDrop = useCallback(
    (slotId: string, slotStageId: string, slotType: "stage" | "quote") => {
      handleSlotTap(slotId, slotStageId, slotType);
    },
    [handleSlotTap]
  );

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
  const isTimeLow = timeRemaining !== null && timeRemaining > 0 && timeRemaining <= 30000;

  if (isGameMaster) {
    return null; // Redirected above
  }

  return (
    <div className="relative min-h-screen w-full bg-gradient-to-br from-background via-background to-primary/5 overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-20" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl opacity-20" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-primary/10 bg-background/80 backdrop-blur-sm">
        <div className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex flex-col gap-0.5">
              <h1 className="font-display text-lg sm:text-xl font-bold">🧩 Puzzle Game</h1>
              <p className="text-[10px] sm:text-xs text-muted-foreground">
                {phase === 1 ? "Phase 1: Stage Names" : "Phase 2: Quotes"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {/* Timer */}
            {timeRemaining !== null && (
              <motion.div
                animate={isTimeLow ? { scale: [1, 1.05, 1] } : {}}
                transition={isTimeLow ? { repeat: Infinity, duration: 1 } : {}}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold text-sm ${
                  isTimeLow ? "bg-destructive/20 text-destructive" : "bg-primary/10 text-primary"
                }`}
              >
                <Clock className="h-4 w-4" />
                <span className="hidden sm:inline">{formatTime(timeRemaining)}</span>
                <span className="sm:hidden">{Math.ceil(timeRemaining / 1000)}s</span>
              </motion.div>
            )}

            {/* Progress */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10">
              <span className="text-xs font-semibold text-primary">{actualPlaced}/{totalPieces}</span>
            </div>

            {/* Controls */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowInstructions(true)}
              className="gap-1.5"
            >
              <HelpCircle className="h-4 w-4" />
              <span className="hidden sm:inline text-xs">Help</span>
            </Button>

            <ThemeToggle />
          </div>
        </div>

        {/* Mobile progress bar */}
        <div className="sm:hidden px-4 pb-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-muted-foreground">Progress</span>
            <span className="text-xs font-bold text-primary">{actualPlaced}/{totalPieces}</span>
          </div>
          <Progress value={(actualPlaced / totalPieces) * 100} className="h-2" />
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex-1 px-4 py-4 sm:px-6 sm:py-6">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 max-w-7xl mx-auto">
          {/* Puzzle board */}
          <div className="flex-1 flex flex-col items-center">
            <JigsawPuzzleBoard
              phase={phase}
              stages={stages}
              pieces={puzzlePieces}
              feedback={feedback}
              onSlotTap={handleSlotTap}
              onDrop={handleDrop}
              selectedPiece={selectedPiece}
              completed={completed}
            />
          </div>

          {/* Pieces tray */}
          <div className="w-full lg:w-80">
            <MobileOptimizedPiecesTray
              phase={phase}
              pieces={pieces}
              selectedPiece={selectedPiece}
              onPieceSelect={handlePieceSelect}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              isMobile={isMobile}
            />
          </div>
        </div>
      </main>

      {/* Toasts */}
      <AnimatePresence>
        {showHalfwayToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-primary text-primary-foreground px-4 py-3 rounded-lg shadow-lg font-semibold"
          >
            🎯 Halfway there! Keep going!
          </motion.div>
        )}

        {showCombo && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50"
          >
            <div className="flex items-center gap-2 bg-gradient-to-r from-primary to-purple-500 text-white px-6 py-3 rounded-full shadow-xl font-display text-lg font-bold">
              <Zap className="h-5 w-5" />
              {comboStreak}x Combo!
            </div>
          </motion.div>
        )}

        {broadcastToast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 z-50 bg-secondary text-secondary-foreground px-4 py-3 rounded-lg shadow-lg max-w-sm"
          >
            📢 {broadcastToast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Instructions modal */}
      <InstructionsModal
        open={showInstructions}
        onOpenChange={setShowInstructions}
        phase={phase}
      />

      {/* Completion overlay */}
      <AnimatePresence>
        {completed && (
          <CompletionOverlay
            score={calculateScore(difficulty, elapsedMs, incorrectAttempts)}
            time={elapsedMs}
            incorrectAttempts={incorrectAttempts}
            difficulty={difficulty}
            onContinue={() => {
              setTimeout(() => {
                navigate(`/results/${sessionId}`);
              }, 1500);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default GameEnhanced;
