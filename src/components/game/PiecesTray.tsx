import { motion, AnimatePresence } from "framer-motion";
import { Puzzle } from "lucide-react";

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

// Jigsaw tab SVG path for the piece shape
const jigsawClip = `
  M 4 0
  L 30 0
  C 30 0 32 -6 38 -6
  C 44 -6 46 0 46 0
  L 76 0
  L 76 20
  C 76 20 82 22 82 28
  C 82 34 76 36 76 36
  L 76 56
  L 46 56
  C 46 56 44 62 38 62
  C 32 62 30 56 30 56
  L 4 56
  L 4 36
  C 4 36 -2 34 -2 28
  C -2 22 4 20 4 20
  Z
`;

const stageColorMap: Record<string, string> = {
  preparation: "border-stage-preparation bg-stage-preparation/10 hover:bg-stage-preparation/20",
  incubation: "border-stage-incubation bg-stage-incubation/10 hover:bg-stage-incubation/20",
  illumination: "border-stage-illumination bg-stage-illumination/10 hover:bg-stage-illumination/20",
  evaluation: "border-stage-evaluation bg-stage-evaluation/10 hover:bg-stage-evaluation/20",
  elaboration: "border-stage-elaboration bg-stage-elaboration/10 hover:bg-stage-elaboration/20",
};

export function PiecesTray({ phase, pieces, selectedPiece, onPieceSelect, onDragStart, onDragEnd }: PiecesTrayProps) {
  const unplaced = pieces.filter((p) => !p.placed);

  return (
    <div className="w-full md:w-80">
      <h3 className="mb-3 flex items-center gap-2 font-display text-base font-semibold sm:text-lg">
        <Puzzle className="h-5 w-5 text-primary" />
        {phase === 1 ? "Stage Names" : "Quotes"}
      </h3>
      <p className="mb-3 text-xs text-muted-foreground">
        Drag a piece to a slot, or tap to select then tap a slot
      </p>
      <div className="flex flex-wrap gap-2 md:flex-col">
        <AnimatePresence>
          {unplaced.map((piece) => (
            <motion.div
              key={piece.id}
              layout
              initial={{ opacity: 0, scale: 0.8, rotate: -3 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.5, rotate: 5 }}
              transition={{ type: "spring", damping: 20 }}
              draggable
              onDragStart={() => {
                onDragStart(piece.id);
              }}
              onDragEnd={() => onDragEnd()}
              onClick={() => onPieceSelect(piece.id)}
              className={`group relative cursor-grab select-none rounded-xl border-2 p-3 text-left text-xs font-medium shadow-sm transition-all active:cursor-grabbing sm:p-4 sm:text-sm ${
                selectedPiece === piece.id
                  ? `${stageColorMap[piece.stageId] || "border-primary bg-primary/10"} ring-2 ring-primary/40 scale-[1.02]`
                  : `${stageColorMap[piece.stageId] || "border-border bg-card"}`
              }`}
            >
              {/* Jigsaw tab decoration */}
              <div className="absolute -left-2 top-1/2 -translate-y-1/2">
                <svg width="10" height="20" viewBox="0 0 10 20" className="fill-current text-primary/30">
                  <path d="M 10 0 C 10 0 0 4 0 10 C 0 16 10 20 10 20 Z" />
                </svg>
              </div>
              <div className="absolute -right-2 top-1/2 -translate-y-1/2">
                <svg width="10" height="20" viewBox="0 0 10 20" className="fill-current text-primary/30">
                  <path d="M 0 0 C 0 0 10 4 10 10 C 10 16 0 20 0 20 Z" />
                </svg>
              </div>

              {piece.type === "stage" ? (
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-[10px] font-bold text-primary">
                    <Puzzle className="h-3.5 w-3.5" />
                  </span>
                  <span className="font-display font-semibold">{piece.label}</span>
                </div>
              ) : (
                <span className="italic text-muted-foreground leading-snug">"{piece.label}"</span>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
