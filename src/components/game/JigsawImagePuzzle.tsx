import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp, ChevronDown, Puzzle, RotateCcw } from "lucide-react";
import elephantImg from "@/assets/elephant-puzzle-new.png";

const GRID_CONFIG: Record<string, { cols: number; rows: number; guideOpacity: number }> = {
  easy:      { cols: 3, rows: 2, guideOpacity: 0.3 },
  medium:    { cols: 4, rows: 3, guideOpacity: 0.18 },
  hard:      { cols: 5, rows: 4, guideOpacity: 0.08 },
  very_hard: { cols: 6, rows: 5, guideOpacity: 0 },
};

export function getGridConfig(difficulty: string) {
  return GRID_CONFIG[difficulty] || GRID_CONFIG.medium;
}

interface JigsawPiece {
  id: number;
  row: number;
  col: number;
  placed: boolean;
}

interface JigsawImagePuzzleProps {
  difficulty: string;
  onPiecePlaced: () => void;
  onIncorrect: () => void;
  onCompleted: () => void;
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

const STAGE_OVERLAY = [
  { label: "Preparation", emoji: "💡" },
  { label: "Incubation", emoji: "⏳" },
  { label: "Illumination", emoji: "✨" },
  { label: "Verification", emoji: "✅" },
];

export function JigsawImagePuzzle({
  difficulty,
  onPiecePlaced,
  onIncorrect,
  onCompleted,
  isPaused = false,
}: JigsawImagePuzzleProps) {
  const config = GRID_CONFIG[difficulty] || GRID_CONFIG.medium;
  const { cols, rows, guideOpacity } = config;
  const totalPieces = cols * rows;

  const [pieces, setPieces] = useState<JigsawPiece[]>(() => {
    const initial: JigsawPiece[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        initial.push({ id: r * cols + c, row: r, col: c, placed: false });
      }
    }
    return shuffleArray(initial);
  });

  const [selectedPieceId, setSelectedPieceId] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{ type: "correct" | "incorrect"; row: number; col: number } | null>(null);
  const [isTrayExpanded, setIsTrayExpanded] = useState(true);
  const [lastPlacedCell, setLastPlacedCell] = useState<string | null>(null);
  const completedRef = useRef(false);

  const placedCount = pieces.filter(p => p.placed).length;
  const unplaced = pieces.filter(p => !p.placed);
  const progress = totalPieces > 0 ? (placedCount / totalPieces) * 100 : 0;

  const getPieceImageStyle = useCallback(
    (row: number, col: number): React.CSSProperties => ({
      backgroundImage: `url(${elephantImg})`,
      backgroundSize: `${cols * 100}% ${rows * 100}%`,
      backgroundPosition:
        `${cols > 1 ? (col / (cols - 1)) * 100 : 0}% ` +
        `${rows > 1 ? (row / (rows - 1)) * 100 : 0}%`,
      backgroundRepeat: "no-repeat",
    }),
    [cols, rows],
  );

  const vibrate = useCallback((pattern: number | number[]) => {
    try { navigator?.vibrate?.(pattern); } catch { /* unsupported */ }
  }, []);

  const handlePieceSelect = useCallback((pieceId: number) => {
    if (isPaused) return;
    vibrate(10);
    setSelectedPieceId(prev => (prev === pieceId ? null : pieceId));
  }, [isPaused, vibrate]);

  const handleCellTap = useCallback((cellRow: number, cellCol: number) => {
    if (isPaused || selectedPieceId === null) return;

    const alreadyPlaced = pieces.find(p => p.row === cellRow && p.col === cellCol && p.placed);
    if (alreadyPlaced) return;

    const piece = pieces.find(p => p.id === selectedPieceId);
    if (!piece || piece.placed) return;

    if (piece.row === cellRow && piece.col === cellCol) {
      vibrate([20, 50, 20]);
      setFeedback({ type: "correct", row: cellRow, col: cellCol });
      setLastPlacedCell(`${cellRow}-${cellCol}`);
      setPieces(prev => prev.map(p => p.id === selectedPieceId ? { ...p, placed: true } : p));
      setSelectedPieceId(null);
      onPiecePlaced();

      if (placedCount + 1 === totalPieces && !completedRef.current) {
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
  }, [isPaused, selectedPieceId, pieces, placedCount, totalPieces, onPiecePlaced, onIncorrect, onCompleted, vibrate]);

  const isRegionComplete = useCallback((regionIdx: number) => {
    const rHalf = Math.ceil(rows / 2);
    const cHalf = Math.ceil(cols / 2);
    const rStart = regionIdx < 2 ? 0 : rHalf;
    const rEnd = regionIdx < 2 ? rHalf : rows;
    const cStart = regionIdx % 2 === 0 ? 0 : cHalf;
    const cEnd = regionIdx % 2 === 0 ? cHalf : cols;

    for (let r = rStart; r < rEnd; r++) {
      for (let c = cStart; c < cEnd; c++) {
        if (!pieces.find(p => p.row === r && p.col === c && p.placed)) return false;
      }
    }
    return true;
  }, [pieces, rows, cols]);

  const allComplete = placedCount === totalPieces;

  return (
    <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 w-full max-w-5xl mx-auto">
      {/* ───── Puzzle Board ───── */}
      <div className="flex-1 flex flex-col items-center">
        <div
          className="jigsaw-board relative w-full aspect-[4/3] rounded-xl border-2 border-explorer-gold/40 shadow-xl overflow-hidden bg-explorer-dark/5 touch-manipulation select-none"
          style={{ maxWidth: 640 }}
        >
          {/* Guide image (dimmed) */}
          {guideOpacity > 0 && (
            <img
              src={elephantImg}
              alt=""
              className="absolute inset-0 w-full h-full object-cover rounded-xl pointer-events-none transition-opacity duration-700"
              style={{ opacity: guideOpacity }}
              draggable={false}
              aria-hidden
            />
          )}

          {/* Grid cells */}
          <div
            className="absolute inset-0 grid"
            style={{
              gridTemplateColumns: `repeat(${cols}, 1fr)`,
              gridTemplateRows: `repeat(${rows}, 1fr)`,
              gap: "1px",
            }}
          >
            {Array.from({ length: rows * cols }, (_, i) => {
              const r = Math.floor(i / cols);
              const c = i % cols;
              const isPlaced = !!pieces.find(p => p.row === r && p.col === c && p.placed);
              const isFb = feedback?.row === r && feedback?.col === c;
              const isCorrectFb = isFb && feedback?.type === "correct";
              const isIncorrectFb = isFb && feedback?.type === "incorrect";
              const hasSelection = selectedPieceId !== null;
              const wasJustPlaced = lastPlacedCell === `${r}-${c}`;

              return (
                <motion.button
                  key={`${r}-${c}`}
                  type="button"
                  onClick={() => handleCellTap(r, c)}
                  disabled={isPlaced || isPaused}
                  className={[
                    "relative w-full h-full outline-none touch-manipulation transition-all duration-200",
                    isPlaced ? "cursor-default" : hasSelection ? "cursor-pointer" : "cursor-default",
                    isIncorrectFb ? "animate-shake" : "",
                    isCorrectFb ? "animate-glow-correct" : "",
                  ].filter(Boolean).join(" ")}
                  style={isPlaced ? getPieceImageStyle(r, c) : undefined}
                  whileTap={!isPlaced && hasSelection ? { scale: 0.93 } : {}}
                  aria-label={isPlaced ? `Placed: row ${r + 1}, col ${c + 1}` : `Empty: row ${r + 1}, col ${c + 1}`}
                >
                  {/* Empty cell indicator */}
                  {!isPlaced && (
                    <div
                      className={[
                        "absolute inset-0 border transition-all duration-200",
                        hasSelection
                          ? "border-explorer-gold/50 bg-explorer-gold/8"
                          : "border-white/15 bg-black/5",
                      ].join(" ")}
                    />
                  )}

                  {/* Pulsing dashed border when a piece is selected */}
                  {!isPlaced && hasSelection && (
                    <motion.div
                      className="absolute inset-[2px] border-2 border-dashed border-explorer-gold/50 rounded-sm pointer-events-none"
                      animate={{ opacity: [0.3, 0.7, 0.3] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    />
                  )}

                  {/* Snap animation on correct placement */}
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

          {/* Border frame */}
          <div className="absolute inset-0 pointer-events-none rounded-xl border-2 border-explorer-gold/50" />

          {/* Stage labels on completed regions */}
          <AnimatePresence>
            {STAGE_OVERLAY.map((stage, idx) =>
              isRegionComplete(idx) && !allComplete ? (
                <motion.div
                  key={stage.label}
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 18 }}
                  className="absolute pointer-events-none z-10"
                  style={{
                    top: idx < 2 ? "8%" : "58%",
                    left: idx % 2 === 0 ? "4%" : "54%",
                    width: "42%",
                  }}
                >
                  <div className="glass rounded-lg px-2 py-1 text-center">
                    <span className="text-base sm:text-lg">{stage.emoji}</span>
                    <p className="font-display text-[9px] sm:text-xs font-bold text-white drop-shadow-sm leading-tight">
                      {stage.label}
                    </p>
                  </div>
                </motion.div>
              ) : null,
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
                  <p className="text-white/80 text-sm">All {totalPieces} pieces assembled</p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Progress bar */}
        <div className="w-full mt-3 px-1" style={{ maxWidth: 640 }}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] sm:text-xs font-semibold text-muted-foreground">Progress</span>
            <span className="text-xs font-bold text-explorer-gold">{placedCount}/{totalPieces}</span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-explorer-gold to-explorer-ocean"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>

      {/* ───── Pieces Tray ───── */}
      <div className="w-full lg:w-80 flex flex-col">
        {/* Tray header */}
        <button
          onClick={() => setIsTrayExpanded(prev => !prev)}
          className={[
            "w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200",
            "bg-gradient-to-r from-explorer-gold/15 to-explorer-parchment hover:from-explorer-gold/25 border border-explorer-gold/25",
            "lg:bg-transparent lg:border-none lg:p-0 lg:hover:bg-transparent",
          ].join(" ")}
        >
          <h3 className="flex items-center gap-2 font-display text-sm font-bold sm:text-base">
            <Puzzle className="h-5 w-5 text-explorer-gold" />
            Puzzle Pieces
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
                Tap a piece, then tap its matching cell on the board.
              </p>

              <div className="jigsaw-tray-grid grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-3 gap-2 sm:gap-2.5 overflow-y-auto lg:max-h-[calc(100vh-16rem)] pr-0.5 pb-4">
                <AnimatePresence mode="popLayout">
                  {unplaced.map(piece => {
                    const isSelected = selectedPieceId === piece.id;
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
                          "jigsaw-tray-piece relative aspect-square cursor-pointer select-none rounded-lg border-2 transition-all duration-200",
                          "min-h-[56px] touch-manipulation active:scale-95",
                          isSelected
                            ? "border-explorer-gold ring-2 ring-explorer-gold/50 ring-offset-2 scale-[1.08] shadow-glow-gold z-10"
                            : "border-explorer-gold/30 shadow-card hover:shadow-card-hover hover:scale-[1.03] hover:border-explorer-gold/60",
                        ].join(" ")}
                        style={getPieceImageStyle(piece.row, piece.col)}
                        aria-pressed={isSelected}
                        aria-label={`Puzzle piece ${piece.id + 1}`}
                      >
                        {/* Piece number hint */}
                        <span className="absolute bottom-0.5 right-1 text-[8px] font-bold text-white/70 drop-shadow-sm pointer-events-none">
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

                        {/* Selected pulse overlay */}
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
                    <span className="text-3xl block mb-2">🎉</span>
                    All pieces placed!
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
