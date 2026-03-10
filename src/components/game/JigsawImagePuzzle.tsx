import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp, ChevronDown, Puzzle, Quote } from "lucide-react";
import elephantImg from "@/assets/elephant-puzzle-new.png";
import type { CreativityStage } from "@/lib/gameData";
import {
  getLevelFromDifficulty,
  getLevelGridConfig,
  getFillerQuotePool,
  type LevelGridConfig,
} from "@/lib/gameData";

const KEY_ROW = 0;

export function getGridConfig(difficulty: string): LevelGridConfig {
  const level = getLevelFromDifficulty(difficulty);
  return getLevelGridConfig(level);
}

export interface JigsawPiece {
  id: number;
  row: number;
  col: number;
  placed: boolean;
  statement: string;
  type: "key" | "quote";
  stageId?: string;
  /** Filler pieces are decoys — placing them is always wrong */
  isFiller?: boolean;
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

function sampleRandom<T>(arr: T[], count: number): T[] {
  const copy = [...arr];
  shuffleArray(copy);
  return copy.slice(0, Math.min(count, copy.length));
}

/** Pick a random quote from a stage's pool — keeps quote matched to its key */
function randomQuoteForStage(stage: CreativityStage): string {
  return stage.quotes[Math.floor(Math.random() * stage.quotes.length)];
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
  const level = getLevelFromDifficulty(difficulty);
  const gridConfig = useMemo(() => getLevelGridConfig(level), [level]);
  const { cols, rows, numFixedClues, totalPieces, quoteSlots } = gridConfig;

  const { pieces, fixedSlots, fixedSlotQuotes, stageOrder } = useMemo(() => {
    // 1. Fixed tiles: 4 key slots locked at (0,0), (0,1), (0,2), (0,3) — never shuffled
    const keyCols = [0, 1, 2, 3];

    // 2. Randomize which stage goes in which column — keys stay fixed, content shuffles
    const order = shuffleArray([0, 1, 2, 3]);
    const stageOrder = order; // column c -> stages[stageOrder[c]]

    const fixed = new Set<string>();
    const allQuoteSlots: [number, number][] = [];
    for (let r = 1; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        allQuoteSlots.push([r, c]);
      }
    }
    const numFixed = Math.min(numFixedClues, allQuoteSlots.length);
    const chosen = sampleRandom(allQuoteSlots, numFixed);
    const fixedSlotQuotes = new Map<string, string>();
    chosen.forEach(([r, c]) => {
      fixed.add(`${r}-${c}`);
      const stage = stages[stageOrder[c]];
      fixedSlotQuotes.set(`${r}-${c}`, randomQuoteForStage(stage));
    });

    // 3. Key pieces: locked positions, randomized stage assignment per column
    const keyPieces: JigsawPiece[] = keyCols.map((c) => {
      const stage = stages[stageOrder[c]];
      return {
        id: c,
        row: KEY_ROW,
        col: c,
        placed: false,
        statement: stage.name,
        type: "key",
        stageId: stage.id,
      };
    });

    // 4. Thematic filler pool: only from the 4 active keys (contextual content)
    const fillerPool = getFillerQuotePool(stages);
    const numFiller = Math.max(0, (level - 2) * 2);

    // 5. Quote pieces: each slot (r,c) gets a random quote from that key's pool (matched to key)
    const quotePieces: JigsawPiece[] = [];
    let id = cols;
    for (const [r, c] of allQuoteSlots) {
      if (fixed.has(`${r}-${c}`)) continue;
      const stage = stages[stageOrder[c]];
      quotePieces.push({
        id: id++,
        row: r,
        col: c,
        placed: false,
        statement: randomQuoteForStage(stage),
        type: "quote",
        stageId: stage.id,
      });
    }
    const fillerQuotes = sampleRandom(fillerPool, numFiller);
    fillerQuotes.forEach((q) => {
      quotePieces.push({
        id: id++,
        row: -1,
        col: -1,
        placed: false,
        statement: q,
        type: "quote",
        isFiller: true,
      });
    });

    // 6. Shuffle layout: randomize piece order in tray
    return {
      pieces: [...shuffleArray(keyPieces), ...shuffleArray(quotePieces)],
      fixedSlots: fixed,
      fixedSlotQuotes,
      stageOrder,
    };
  }, [level, rows, cols, numFixedClues, stages]);

  const [piecesState, setPiecesState] = useState(pieces);
  const [phase, setPhase] = useState<1 | 2>(1);
  const [phaseTransition, setPhaseTransition] = useState(false);
  const [selectedPieceId, setSelectedPieceId] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{ type: "correct" | "incorrect"; row: number; col: number } | null>(null);
  const [isTrayExpanded, setIsTrayExpanded] = useState(true);
  const [lastPlacedCell, setLastPlacedCell] = useState<string | null>(null);
  const completedRef = useRef(false);

  const keyPieces = piecesState.filter((p) => p.type === "key");
  const quotePieces = piecesState.filter((p) => p.type === "quote" && !p.isFiller);
  const keysPlaced = keyPieces.filter((p) => p.placed).length;
  const quotesToPlace = quoteSlots - numFixedClues;
  const quotesPlaced = quotePieces.filter((p) => p.placed).length;

  const unplaced =
    phase === 1
      ? piecesState.filter((p) => p.type === "key" && !p.placed)
      : piecesState.filter((p) => p.type === "quote" && !p.placed);

  const totalToPlace = 4 + quotesToPlace;
  const placedCount = phase === 1 ? keysPlaced : keysPlaced + quotesPlaced;
  const progress = totalToPlace > 0 ? (placedCount / totalToPlace) * 100 : 0;

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

  const getPieceImageStyle = useCallback(
    (row: number, col: number): React.CSSProperties => ({
      backgroundImage: `url(${elephantImg})`,
      backgroundSize: `${cols * 100}% ${rows * 100}%`,
      backgroundPosition:
        `${(col / Math.max(1, cols - 1)) * 100}% ` +
        `${(row / Math.max(1, rows - 1)) * 100}%`,
      backgroundRepeat: "no-repeat",
    }),
    [cols, rows],
  );

  const vibrate = useCallback((pattern: number | number[]) => {
    try {
      navigator?.vibrate?.(pattern);
    } catch {
      /* no-op */
    }
  }, []);

  const handlePieceSelect = useCallback(
    (pieceId: number) => {
      if (isPaused) return;
      vibrate(10);
      setSelectedPieceId((prev) => (prev === pieceId ? null : pieceId));
    },
    [isPaused, vibrate],
  );

  const handleCellTap = useCallback(
    (cellRow: number, cellCol: number) => {
      if (isPaused || selectedPieceId === null) return;

      const piece = piecesState.find((p) => p.id === selectedPieceId);
      if (!piece || piece.placed) return;

      if (phase === 1 && cellRow !== KEY_ROW) return;
      if (phase === 2 && cellRow === KEY_ROW) return;
      if (phase === 2 && fixedSlots.has(`${cellRow}-${cellCol}`)) return;

      const alreadyPlaced = piecesState.some(
        (p) => p.row === cellRow && p.col === cellCol && p.placed,
      );
      if (alreadyPlaced) return;

      const isFiller = piece.isFiller === true;
      const correct = !isFiller && piece.row === cellRow && piece.col === cellCol;

      if (correct) {
        vibrate([20, 50, 20]);
        setFeedback({ type: "correct", row: cellRow, col: cellCol });
        setLastPlacedCell(`${cellRow}-${cellCol}`);
        setPiecesState((prev) =>
          prev.map((p) => (p.id === selectedPieceId ? { ...p, placed: true } : p)),
        );
        setSelectedPieceId(null);
        onPiecePlaced();

        const newQuotesPlaced = phase === 2 ? quotesPlaced + 1 : quotesPlaced;
        if (phase === 2 && newQuotesPlaced >= quotesToPlace && !completedRef.current) {
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
    },
    [
      isPaused,
      selectedPieceId,
      piecesState,
      phase,
      quotesPlaced,
      quotesToPlace,
      fixedSlots,
      onPiecePlaced,
      onIncorrect,
      onCompleted,
      vibrate,
    ],
  );

  const allComplete = keysPlaced === 4 && quotesPlaced >= quotesToPlace;

  const isCellActive = (cellRow: number, cellCol: number) => {
    if (phase === 1) return cellRow === KEY_ROW;
    if (cellRow === KEY_ROW) return false;
    return !fixedSlots.has(`${cellRow}-${cellCol}`);
  };

  const isCellFixed = (cellRow: number, cellCol: number) =>
    cellRow > KEY_ROW && fixedSlots.has(`${cellRow}-${cellCol}`);

  const getCellLabel = (cellRow: number, cellCol: number) => {
    if (cellRow === KEY_ROW) return `Key slot ${cellCol + 1}`;
    return `Quote slot ${cellCol + 1}`;
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 w-full max-w-5xl mx-auto">
      <div className="flex-1 flex flex-col items-center">
        <div
          className="jigsaw-board relative w-full rounded-xl border-2 border-explorer-gold/40 shadow-xl overflow-hidden bg-explorer-dark/5 touch-manipulation select-none"
          style={{ maxWidth: 640, aspectRatio: `${cols}/${rows}` }}
        >
          <img
            src={elephantImg}
            alt=""
            className="absolute inset-0 w-full h-full object-cover rounded-xl pointer-events-none opacity-[0.12]"
            draggable={false}
            aria-hidden
          />

          <div className="absolute top-1 left-1 z-10 flex flex-col gap-1 text-[9px] font-semibold text-white/80 drop-shadow-sm pointer-events-none">
            <span>{phase === 1 ? "1. Main keys" : "✓ Main keys"}</span>
            <span>
              {phase === 2 ? "2. Quotes" : "Quotes"}
              {numFixedClues > 0 && ` (${numFixedClues} pre-filled)`}
            </span>
          </div>

          <div
            className="absolute inset-0 grid"
            style={{
              gridTemplateColumns: `repeat(${cols}, 1fr)`,
              gridTemplateRows: `repeat(${rows}, 1fr)`,
              gap: "2px",
            }}
          >
            {Array.from({ length: rows * cols }, (_, i) => {
              const r = Math.floor(i / cols);
              const c = i % cols;
              const fixed = isCellFixed(r, c);
              const pieceAtCell = piecesState.find(
                (p) => p.row === r && p.col === c && (p.placed || fixed),
              );
              const isPlaced = !!pieceAtCell || fixed;
              const isFb = feedback?.row === r && feedback?.col === c;
              const isCorrectFb = isFb && feedback?.type === "correct";
              const isIncorrectFb = isFb && feedback?.type === "incorrect";
              const hasSelection = selectedPieceId !== null;
              const wasJustPlaced = lastPlacedCell === `${r}-${c}`;
              const active = isCellActive(r, c);

              const displayStatement = fixed
                ? fixedSlotQuotes?.get(`${r}-${c}`) ?? stages[stageOrder?.[c] ?? c]?.quote
                : pieceAtCell?.statement;

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
                    fixed ? "ring-2 ring-success/40" : "",
                    isIncorrectFb ? "animate-shake" : "",
                    isCorrectFb ? "animate-glow-correct" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  style={
                    isPlaced || fixed
                      ? getPieceImageStyle(r, c)
                      : undefined
                  }
                  whileTap={
                    !isPlaced && active && hasSelection ? { scale: 0.93 } : {}
                  }
                  aria-label={
                    isPlaced || fixed
                      ? `Placed: ${displayStatement ?? ""}`
                      : getCellLabel(r, c)
                  }
                >
                  {!isPlaced && !fixed && (
                    <div
                      className={[
                        "absolute inset-0 border transition-all duration-200 rounded-sm",
                        active && hasSelection
                          ? "border-explorer-gold/50 bg-explorer-gold/8"
                          : "border-white/15 bg-black/5",
                      ].join(" ")}
                    />
                  )}

                  {(isPlaced || fixed) && displayStatement && (
                    <div className="absolute bottom-0 left-0 right-0 jigsaw-piece-statement rounded-b-sm">
                      <span className="line-clamp-2 text-[8px] sm:text-[9px] leading-tight px-0.5 py-0.5 text-white drop-shadow-md font-medium">
                        {displayStatement}
                      </span>
                      {fixed && (
                        <span className="absolute top-0.5 right-1 text-[7px] text-success font-bold">
                          ✓
                        </span>
                      )}
                    </div>
                  )}

                  {!isPlaced && !fixed && active && hasSelection && (
                    <motion.div
                      className="absolute inset-[2px] border-2 border-dashed border-explorer-gold/50 rounded-sm pointer-events-none"
                      animate={{ opacity: [0.3, 0.7, 0.3] }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                  )}

                  {isPlaced && !fixed && wasJustPlaced && (
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
                  <p className="text-white/80 text-sm">
                    Now place each quote under its matching key.
                  </p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

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
                  transition={{
                    type: "spring",
                    stiffness: 120,
                    damping: 14,
                    delay: 0.2,
                  }}
                  className="text-center px-6 py-5 rounded-2xl glass shadow-glow-gold"
                >
                  <motion.div
                    animate={{ rotate: [0, -8, 8, -4, 0] }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                    className="text-5xl mb-2"
                  >
                    🧩
                  </motion.div>
                  <p className="font-display text-2xl font-bold text-white drop-shadow-lg mb-1">
                    Puzzle Complete!
                  </p>
                  <p className="text-white/80 text-sm">
                    All {totalToPlace} pieces placed
                  </p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="w-full mt-3 px-1" style={{ maxWidth: 640 }}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] sm:text-xs font-semibold text-muted-foreground">
              {phase === 1 ? "Main keys" : "Quotes"} · {placedCount}/{totalToPlace}
            </span>
            <span className="text-xs font-bold text-explorer-gold">
              {placedCount}/{totalToPlace}
            </span>
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

      <div className="w-full lg:w-80 flex flex-col">
        <button
          onClick={() => setIsTrayExpanded((prev) => !prev)}
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
            {isTrayExpanded ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
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
                  : `Place each quote under its matching key. Level ${level}: ${rows}×${cols} grid, ${numFixedClues} pre-filled.`}
              </p>

              <div className="jigsaw-tray-grid grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-2 sm:gap-2.5 overflow-y-auto lg:max-h-[calc(100vh-16rem)] pr-0.5 pb-4">
                <AnimatePresence mode="popLayout">
                  {unplaced.map((piece) => {
                    const isSelected = selectedPieceId === piece.id;
                    const emoji =
                      piece.type === "quote" && piece.stageId
                        ? STAGE_EMOJI[piece.stageId]
                        : null;
                    const imgRow = piece.isFiller ? 1 : piece.row;
                    const imgCol = piece.isFiller ? 0 : piece.col;
                    return (
                      <motion.button
                        key={piece.id}
                        layout
                        initial={{ opacity: 0, scale: 0.7, rotate: -4 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        exit={{ opacity: 0, scale: 0.4, rotate: 6 }}
                        transition={{
                          type: "spring",
                          stiffness: 280,
                          damping: 22,
                        }}
                        type="button"
                        onClick={() => handlePieceSelect(piece.id)}
                        className={[
                          "jigsaw-tray-piece relative aspect-[4/3] sm:aspect-square cursor-pointer select-none rounded-lg border-2 transition-all duration-200",
                          "min-h-[64px] touch-manipulation active:scale-95",
                          isSelected
                            ? "border-explorer-gold ring-2 ring-explorer-gold/50 ring-offset-2 scale-[1.08] shadow-glow-gold z-10"
                            : "border-explorer-gold/30 shadow-card hover:shadow-card-hover hover:scale-[1.03] hover:border-explorer-gold/60",
                          piece.isFiller ? "opacity-90" : "",
                        ].join(" ")}
                        style={getPieceImageStyle(imgRow, imgCol)}
                        aria-pressed={isSelected}
                        aria-label={`${piece.type === "key" ? "Key" : piece.isFiller ? "Decoy" : "Quote"}: ${piece.statement}`}
                      >
                        <div className="absolute bottom-0 left-0 right-0 jigsaw-piece-statement rounded-b-md">
                          {emoji && (
                            <span className="absolute top-0.5 left-1 text-xs">
                              {emoji}
                            </span>
                          )}
                          {piece.isFiller && (
                            <span className="absolute top-0.5 right-1 text-[7px] text-amber-400 font-bold">
                              ?
                            </span>
                          )}
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
                    <span className="text-3xl block mb-2">
                      {phase === 2 ? "🎉" : "👉"}
                    </span>
                    {phase === 2
                      ? "All pieces placed!"
                      : "Place keys to continue…"}
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
