import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp, ChevronDown, Puzzle, Quote } from "lucide-react";
import elephantImg from "@/assets/elephant-puzzle-new.png";
import type { CreativityStage } from "@/lib/gameData";

/** Fixed 4×2 grid: row 0 = main keys (Preparation, Incubation, Illumination, Verification), row 1 = quotes */
const COLS = 4;
const ROWS = 2;
const KEY_ROW = 0;
const QUOTE_ROW = 1;

export function getGridConfig(_difficulty?: string) {
  return { cols: COLS, rows: ROWS, guideOpacity: 0.15 };
}

export interface JigsawPiece {
  id: number;
  row: number;
  col: number;
  placed: boolean;
  statement: string;
  type: "key" | "quote";
  stageId?: string;
}

interface JigsawImagePuzzleProps {
  difficulty: string;
  stages: CreativityStage[];
  onPiecePlaced: () => void;
  onIncorrect: () => void;
  onCompleted: () => void;
  onPhaseComplete?: () => void;
  isPaused?: boolean;
}

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

const STAGE_EMOJI: Record<string, string> = {
  preparation: "💡",
  incubation: "⏳",
  illumination: "✨",
  verification: "✅",
};

export function JigsawImagePuzzle({
  difficulty,
  stages,
  onPiecePlaced,
  onIncorrect,
  onCompleted,
  onPhaseComplete,
  isPaused = false,
}: JigsawImagePuzzleProps) {
  const totalPieces = COLS * ROWS; // 8

  const [pieces, setPieces] = useState<JigsawPiece[]>(() => {
    const keyPieces: JigsawPiece[] = stages.map((s, c) => ({
      id: c,
      row: KEY_ROW,
      col: c,
      placed: false,
      statement: s.name,
      type: "key",
    }));
    const quotePieces: JigsawPiece[] = stages.map((s, c) => ({
      id: COLS + c,
      row: QUOTE_ROW,
      col: c,
      placed: false,
      statement: s.quote,
      type: "quote",
      stageId: s.id,
    }));
    return [...shuffleArray(keyPieces), ...shuffleArray(quotePieces)];
  });

  const [phase, setPhase] = useState<1 | 2>(1);
  const [phaseTransition, setPhaseTransition] = useState(false);
  const [selectedPieceId, setSelectedPieceId] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{ type: "correct" | "incorrect"; row: number; col: number } | null>(null);
  const [isTrayExpanded, setIsTrayExpanded] = useState(true);
  const [lastPlacedCell, setLastPlacedCell] = useState<string | null>(null);
  const completedRef = useRef(false);

  const keyPieces = pieces.filter(p => p.type === "key");
  const quotePieces = pieces.filter(p => p.type === "quote");
  const keysPlaced = keyPieces.filter(p => p.placed).length;
  const quotesPlaced = quotePieces.filter(p => p.placed).length;

  const unplaced = phase === 1
    ? pieces.filter(p => p.type === "key" && !p.placed)
    : pieces.filter(p => p.type === "quote" && !p.placed);

  const placedCount = phase === 1 ? keysPlaced : keysPlaced + quotesPlaced;
  const progress = (placedCount / totalPieces) * 100;

  // When all 4 keys are placed, transition to phase 2
  useEffect(() => {
    if (phase !== 1 || keysPlaced < 4) return;
    setPhaseTransition(true);
    onPhaseComplete?.();
    const t = setTimeout(() => {
      setPhase(2);
      setPhaseTransition(false);
    }, 2200);
    return () => clearTimeout(t);
  }, [phase, keysPlaced, onPhaseComplete]);

  const getPieceImageStyle = useCallback((row: number, col: number): React.CSSProperties => ({
    backgroundImage: `url(${elephantImg})`,
    backgroundSize: `${COLS * 100}% ${ROWS * 100}%`,
    backgroundPosition:
      `${(col / (COLS - 1)) * 100}% ` +
      `${(row / (ROWS - 1)) * 100}%`,
    backgroundRepeat: "no-repeat",
  }), []);

  const vibrate = useCallback((pattern: number | number[]) => {
    try { navigator?.vibrate?.(pattern); } catch { /* no-op */ }
  }, []);

  const handlePieceSelect = useCallback((pieceId: number) => {
    if (isPaused) return;
    vibrate(10);
    setSelectedPieceId(prev => (prev === pieceId ? null : pieceId));
  }, [isPaused, vibrate]);

  const handleCellTap = useCallback((cellRow: number, cellCol: number) => {
    if (isPaused || selectedPieceId === null) return;

    const piece = pieces.find(p => p.id === selectedPieceId);
    if (!piece || piece.placed) return;

    // Phase 1: only key row (row 0); phase 2: only quote row (row 1)
    if (phase === 1 && cellRow !== KEY_ROW) return;
    if (phase === 2 && cellRow !== QUOTE_ROW) return;

    const alreadyPlaced = pieces.some(p => p.row === cellRow && p.col === cellCol && p.placed);
    if (alreadyPlaced) return;

    const correct = piece.row === cellRow && piece.col === cellCol;

    if (correct) {
      vibrate([20, 50, 20]);
      setFeedback({ type: "correct", row: cellRow, col: cellCol });
      setLastPlacedCell(`${cellRow}-${cellCol}`);
      setPieces(prev => prev.map(p => p.id === selectedPieceId ? { ...p, placed: true } : p));
      setSelectedPieceId(null);
      onPiecePlaced();

      const newPlaced = phase === 1 ? keysPlaced + 1 : quotesPlaced + 1;
      const keysDone = phase === 1 ? newPlaced === 4 : keysPlaced === 4;
      const quotesDone = phase === 2 ? newPlaced === 4 : false;

      if (quotesDone && !completedRef.current) {
        completedRef.current = true;
        setTimeout(() => onCompleted(), 700);
      }
      setTimeout(() => setFeedback(null), 800);
    } else {
      vibrate([50, 30, 50]);
      setFeedback({ type: "incorrect", row: cellRow, col: cellCol });
      setSelectedPieceId(null);
      onIncorrect();
      setTimeout(() => setFeedback(null), 500);
    }
  }, [isPaused, selectedPieceId, pieces, phase, keysPlaced, quotesPlaced, onPiecePlaced, onIncorrect, onCompleted, vibrate]);

  const allComplete = placedCount === totalPieces;

  const isCellActive = (cellRow: number) => {
    if (phase === 1) return cellRow === KEY_ROW;
    return cellRow === QUOTE_ROW;
  };

  const getCellLabel = (cellRow: number, cellCol: number) => {
    if (cellRow === KEY_ROW) return `Key slot ${cellCol + 1}`;
    return `Quote slot ${cellCol + 1}`;
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 w-full max-w-5xl mx-auto">
      {/* ───── Puzzle Board (4×2) ───── */}
      <div className="flex-1 flex flex-col items-center">
        <div
          className="jigsaw-board relative w-full rounded-xl border-2 border-explorer-gold/40 shadow-xl overflow-hidden bg-explorer-dark/5 touch-manipulation select-none"
          style={{ maxWidth: 640, aspectRatio: "4/2" }}
        >
          {/* Guide image */}
          <img
            src={elephantImg}
            alt=""
            className="absolute inset-0 w-full h-full object-cover rounded-xl pointer-events-none opacity-[0.12]"
            draggable={false}
            aria-hidden
          />

          {/* Row labels: Main keys row / Quotes row */}
          <div className="absolute top-1 left-1 z-10 flex flex-col gap-1 text-[9px] font-semibold text-white/80 drop-shadow-sm pointer-events-none">
            <span>{phase === 1 ? "1. Main keys" : "✓ Main keys"}</span>
            <span>{phase === 2 ? "2. Quotes" : "Quotes"}</span>
          </div>

          <div
            className="absolute inset-0 grid"
            style={{
              gridTemplateColumns: `repeat(${COLS}, 1fr)`,
              gridTemplateRows: `repeat(${ROWS}, 1fr)`,
              gap: "2px",
            }}
          >
            {Array.from({ length: ROWS * COLS }, (_, i) => {
              const r = Math.floor(i / COLS);
              const c = i % COLS;
              const pieceAtCell = pieces.find(p => p.row === r && p.col === c && p.placed);
              const isPlaced = !!pieceAtCell;
              const isFb = feedback?.row === r && feedback?.col === c;
              const isCorrectFb = isFb && feedback?.type === "correct";
              const isIncorrectFb = isFb && feedback?.type === "incorrect";
              const hasSelection = selectedPieceId !== null;
              const wasJustPlaced = lastPlacedCell === `${r}-${c}`;
              const active = isCellActive(r);

              return (
                <motion.button
                  key={`${r}-${c}`}
                  type="button"
                  onClick={() => handleCellTap(r, c)}
                  disabled={isPlaced || isPaused || !active}
                  className={[
                    "relative w-full h-full outline-none touch-manipulation transition-all duration-200 flex flex-col",
                    isPlaced ? "cursor-default" : active && hasSelection ? "cursor-pointer" : "cursor-default",
                    !active && !isPlaced ? "opacity-60" : "",
                    isIncorrectFb ? "animate-shake" : "",
                    isCorrectFb ? "animate-glow-correct" : "",
                  ].filter(Boolean).join(" ")}
                  style={isPlaced && pieceAtCell ? getPieceImageStyle(r, c) : undefined}
                  whileTap={!isPlaced && active && hasSelection ? { scale: 0.93 } : {}}
                  aria-label={isPlaced ? `Placed: ${pieceAtCell?.statement ?? ""}` : getCellLabel(r, c)}
                >
                  {!isPlaced && (
                    <div
                      className={[
                        "absolute inset-0 border transition-all duration-200 rounded-sm",
                        active && hasSelection
                          ? "border-explorer-gold/50 bg-explorer-gold/8"
                          : "border-white/15 bg-black/5",
                      ].join(" ")}
                    />
                  )}

                  {isPlaced && pieceAtCell && (
                    <div className="absolute bottom-0 left-0 right-0 jigsaw-piece-statement rounded-b-sm">
                      <span className="line-clamp-2 text-[8px] sm:text-[9px] leading-tight px-0.5 py-0.5 text-white drop-shadow-md font-medium">
                        {pieceAtCell.statement}
                      </span>
                    </div>
                  )}

                  {!isPlaced && active && hasSelection && (
                    <motion.div
                      className="absolute inset-[2px] border-2 border-dashed border-explorer-gold/50 rounded-sm pointer-events-none"
                      animate={{ opacity: [0.3, 0.7, 0.3] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    />
                  )}

                  {isPlaced && wasJustPlaced && (
                    <motion.div
                      initial={{ opacity: 0.6, scale: 1.15 }}
                      animate={{ opacity: 0, scale: 1.4 }}
                      transition={{ duration: 0.6 }}
                      className="absolute inset-0 rounded-sm border-2 border-explorer-gold pointer-events-none"
                    />
                  )}
                </motion.button>
              );
            })}
          </div>

          <div className="absolute inset-0 pointer-events-none rounded-xl border-2 border-explorer-gold/50" />

          {/* Phase transition overlay */}
          <AnimatePresence>
            {phaseTransition && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm rounded-xl z-20"
              >
                <motion.div
                  initial={{ scale: 0.8, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 120, damping: 14 }}
                  className="text-center px-6 py-5 rounded-2xl glass shadow-glow-gold"
                >
                  <p className="font-display text-xl sm:text-2xl font-bold text-white drop-shadow-lg mb-1">
                    Main keys complete!
                  </p>
                  <p className="text-white/80 text-sm">Now place each quote under its matching key.</p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Completion overlay */}
          <AnimatePresence>
            {allComplete && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 rounded-xl flex items-center justify-center bg-black/20 backdrop-blur-[2px] pointer-events-none z-20"
              >
                <motion.div
                  initial={{ scale: 0, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 120, damping: 14, delay: 0.2 }}
                  className="text-center px-6 py-5 rounded-2xl glass shadow-glow-gold"
                >
                  <motion.div animate={{ rotate: [0, -8, 8, -4, 0] }} transition={{ delay: 0.4, duration: 0.6 }} className="text-5xl mb-2">
                    🧩
                  </motion.div>
                  <p className="font-display text-2xl font-bold text-white drop-shadow-lg mb-1">Puzzle Complete!</p>
                  <p className="text-white/80 text-sm">All keys and quotes placed</p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="w-full mt-3 px-1" style={{ maxWidth: 640 }}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] sm:text-xs font-semibold text-muted-foreground">
              {phase === 1 ? "Main keys" : "Quotes"} · {placedCount}/{totalPieces}
            </span>
            <span className="text-xs font-bold text-explorer-gold">{placedCount}/{totalPieces}</span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-explorer-gold to-explorer-ocean"
              initial={false}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>

      {/* ───── Pieces Tray ───── */}
      <div className="w-full lg:w-80 flex flex-col">
        <button
          onClick={() => setIsTrayExpanded(prev => !prev)}
          className={[
            "w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200",
            "bg-gradient-to-r from-explorer-gold/15 to-explorer-parchment hover:from-explorer-gold/25 border border-explorer-gold/25",
            "lg:bg-transparent lg:border-none lg:p-0 lg:hover:bg-transparent",
          ].join(" ")}
        >
          <h3 className="flex items-center gap-2 font-display text-sm font-bold sm:text-base">
            {phase === 1 ? (
              <Puzzle className="h-5 w-5 text-explorer-gold" />
            ) : (
              <Quote className="h-5 w-5 text-explorer-gold" />
            )}
            {phase === 1 ? "Main keys" : "Quotes"}
            <span className="ml-2 rounded-full bg-explorer-gold/20 px-2 py-0.5 text-[10px] font-semibold text-explorer-dark sm:text-xs">
              {unplaced.length} left
            </span>
          </h3>
          <div className="lg:hidden">
            {isTrayExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </div>
        </button>

        <AnimatePresence>
          {isTrayExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <p className="text-[10px] text-muted-foreground mt-2 mb-3 px-1 sm:text-xs italic">
                {phase === 1
                  ? "Place each main key (Preparation, Incubation, Illumination, Verification) in the top row."
                  : "Place each quote in the bottom row under its matching key."}
              </p>

              <div className="jigsaw-tray-grid grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-2 sm:gap-2.5 overflow-y-auto lg:max-h-[calc(100vh-16rem)] pr-0.5 pb-4">
                <AnimatePresence mode="popLayout">
                  {unplaced.map(piece => {
                    const isSelected = selectedPieceId === piece.id;
                    const emoji = piece.type === "quote" && piece.stageId ? STAGE_EMOJI[piece.stageId] : null;
                    return (
                      <motion.button
                        key={piece.id}
                        layout
                        initial={{ opacity: 0, scale: 0.7, rotate: -4 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        exit={{ opacity: 0, scale: 0.4, rotate: 6 }}
                        transition={{ type: "spring", stiffness: 280, damping: 22 }}
                        type="button"
                        onClick={() => handlePieceSelect(piece.id)}
                        className={[
                          "jigsaw-tray-piece relative aspect-[4/3] sm:aspect-square cursor-pointer select-none rounded-lg border-2 transition-all duration-200",
                          "min-h-[64px] touch-manipulation active:scale-95",
                          isSelected
                            ? "border-explorer-gold ring-2 ring-explorer-gold/50 ring-offset-2 scale-[1.08] shadow-glow-gold z-10"
                            : "border-explorer-gold/30 shadow-card hover:shadow-card-hover hover:scale-[1.03] hover:border-explorer-gold/60",
                        ].join(" ")}
                        style={getPieceImageStyle(piece.row, piece.col)}
                        aria-pressed={isSelected}
                        aria-label={`${piece.type === "key" ? "Key" : "Quote"}: ${piece.statement}`}
                      >
                        <div className="absolute bottom-0 left-0 right-0 jigsaw-piece-statement rounded-b-md">
                          {emoji && <span className="absolute top-0.5 left-1 text-xs">{emoji}</span>}
                          <span className="line-clamp-2 text-[7px] sm:text-[8px] leading-tight px-1 py-0.5 text-white drop-shadow-md font-medium pointer-events-none">
                            {piece.statement}
                          </span>
                        </div>
                        <span className="absolute top-0.5 right-1 text-[8px] font-bold text-white/80 drop-shadow-sm pointer-events-none">
                          {piece.id + 1}
                        </span>
                        {isSelected && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-explorer-gold text-[9px] text-white shadow-sm font-bold z-10"
                          >
                            ✓
                          </motion.div>
                        )}
                        {isSelected && (
                          <motion.div
                            className="absolute inset-0 rounded-lg border-2 border-explorer-gold pointer-events-none"
                            animate={{ opacity: [0.4, 1, 0.4] }}
                            transition={{ duration: 1.2, repeat: Infinity }}
                          />
                        )}
                      </motion.button>
                    );
                  })}
                </AnimatePresence>

                {unplaced.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="col-span-full py-6 text-center text-sm text-muted-foreground"
                  >
                    <span className="text-3xl block mb-2">{phase === 2 ? "🎉" : "👉"}</span>
                    {phase === 2 ? "All pieces placed!" : "Place keys to continue…"}
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
