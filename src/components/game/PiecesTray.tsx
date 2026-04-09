import { motion, AnimatePresence } from "framer-motion";

interface PieceState {
  id: string;
  type: "stage" | "quote";
  stageId: string;
  label: string;
  placed: boolean;
}

interface PiecesTrayProps {
  phase: 1 | 2;
  pieces: PieceState[];
  selectedPiece: string | null;
  onPieceSelect: (pieceId: string) => void;
  onDragStart: (pieceId: string) => void;
  onDragEnd: () => void;
}

const stageColorMap: Record<string, string> = {
  preparation:  "border-stage-preparation  bg-stage-preparation/10  hover:bg-stage-preparation/25",
  incubation:   "border-stage-incubation   bg-stage-incubation/10   hover:bg-stage-incubation/25",
  illumination: "border-stage-illumination bg-stage-illumination/10 hover:bg-stage-illumination/25",
  evaluation:   "border-stage-evaluation   bg-stage-evaluation/10   hover:bg-stage-evaluation/25",
  elaboration:  "border-stage-elaboration  bg-stage-elaboration/10  hover:bg-stage-elaboration/25",
};

const stageSelectedMap: Record<string, string> = {
  preparation:  "border-stage-preparation  bg-stage-preparation/25  ring-stage-preparation/40",
  incubation:   "border-stage-incubation   bg-stage-incubation/25   ring-stage-incubation/40",
  illumination: "border-stage-illumination bg-stage-illumination/25 ring-stage-illumination/40",
  evaluation:   "border-stage-evaluation   bg-stage-evaluation/25   ring-stage-evaluation/40",
  elaboration:  "border-stage-elaboration  bg-stage-elaboration/25  ring-stage-elaboration/40",
};

const stageIconMap: Record<string, string> = {
  preparation:  "🔵",
  incubation:   "🟣",
  illumination: "🟡",
  evaluation:   "🔴",
  elaboration:  "🟢",
};

// Jigsaw clip path for tray pieces — gives each card a puzzle-piece silhouette
const jigsawPiecePath =
  "polygon(8% 0%, 38% 0%, 40% -5%, 48% -7%, 56% -5%, 58% 0%, 92% 0%, 100% 8%, 105% 40%, 107% 48%, 105% 56%, 100% 58%, 100% 92%, 92% 100%, 58% 100%, 56% 105%, 48% 107%, 40% 105%, 38% 100%, 8% 100%, 0% 92%, -5% 56%, -7% 48%, -5% 40%, 0% 38%, 0% 8%)";

export function PiecesTray({
  phase,
  pieces,
  selectedPiece,
  onPieceSelect,
  onDragStart,
  onDragEnd,
}: PiecesTrayProps) {
  const unplaced = pieces.filter((p) => !p.placed);

  return (
    <aside className="w-full md:w-72 lg:w-80 flex flex-col">
      {/* Tray header */}
      <div className="mb-2 sm:mb-3">
        <h3 className="flex items-center gap-2 font-display text-sm font-bold sm:text-base md:text-lg">
          <span className="text-lg sm:text-xl" aria-hidden>🧩</span>
          {phase === 1 ? "Stage Names" : "Quote Cards"}
          <span className="ml-auto rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary sm:text-xs">
            {unplaced.length} left
          </span>
        </h3>
        <p className="mt-0.5 text-[10px] text-muted-foreground sm:text-xs">
          {phase === 1
            ? "Place each stage name in the correct slot on the puzzle."
            : "Match each quote to its creativity stage."}
        </p>
        <p className="mt-0.5 text-[10px] italic text-muted-foreground sm:hidden">
          Tap a piece, then tap a slot to place it.
        </p>
        <p className="mt-0.5 hidden text-[10px] italic text-muted-foreground sm:block">
          Drag to a slot, or tap to select then tap a slot.
        </p>
      </div>

      {/* Piece list */}
      <div className="flex flex-wrap gap-2 sm:gap-2.5 md:flex-col md:gap-2 overflow-y-auto md:max-h-[calc(100vh-12rem)] pr-0.5">
        <AnimatePresence mode="popLayout">
          {unplaced.map((piece) => {
            const isSelected = selectedPiece === piece.id;
            const colorClass = isSelected
              ? (stageSelectedMap[piece.stageId] ?? "border-primary bg-primary/25 ring-primary/40")
              : (stageColorMap[piece.stageId] ?? "border-border bg-card");
            const icon = stageIconMap[piece.stageId] ?? "🧩";

            return (
              <motion.div
                key={piece.id}
                layout
                initial={{ opacity: 0, scale: 0.75, rotate: -4 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.45, rotate: 6 }}
                transition={{ type: "spring", stiffness: 280, damping: 22 }}
                draggable
                onDragStart={() => onDragStart(piece.id)}
                onDragEnd={onDragEnd}
                onClick={() => onPieceSelect(piece.id)}
                style={{ clipPath: jigsawPiecePath }}
                role="button"
                tabIndex={0}
                aria-pressed={isSelected}
                aria-label={`${piece.type === "stage" ? "Stage" : "Quote"} piece: ${piece.label}`}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onPieceSelect(piece.id);
                  }
                }}
                className={[
                  "puzzle-piece group relative cursor-grab select-none border-2 p-3 px-3.5 text-left shadow-md transition-all",
                  "active:cursor-grabbing focus-visible:outline-none focus-visible:ring-2",
                  "sm:p-3.5 sm:px-4 md:p-4",
                  colorClass,
                  isSelected ? "ring-2 scale-[1.05] shadow-lg" : "hover:scale-[1.02]",
                ].join(" ")}
              >
                {piece.type === "stage" ? (
                  <div className="flex items-center gap-2">
                    <span
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-white/30 text-sm shadow-sm"
                      aria-hidden
                    >
                      {icon}
                    </span>
                    <span className="font-display text-[12px] font-bold leading-tight text-foreground sm:text-sm">
                      {piece.label}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-start gap-1.5 overflow-y-auto min-h-0 flex-1">
                    <span className="mt-0.5 shrink-0 text-[10px]" aria-hidden>💬</span>
                    <span className="italic text-[10px] leading-snug text-muted-foreground sm:text-[11px] break-words line-clamp-none">
                      "{piece.label}"
                    </span>
                  </div>
                )}

                {/* Selected indicator */}
                {isSelected && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[8px] text-white shadow"
                    aria-hidden
                  >
                    ✓
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>

        {unplaced.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-6 text-center text-sm text-muted-foreground w-full"
          >
            <span className="text-2xl block mb-1">🎉</span>
            All pieces placed!
          </motion.div>
        )}
      </div>
    </aside>
  );
}
