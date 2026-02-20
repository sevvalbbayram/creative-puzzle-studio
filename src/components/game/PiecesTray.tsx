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

const stageColorMap: Record<string, string> = {
  preparation: "border-stage-preparation bg-stage-preparation/10 hover:bg-stage-preparation/20",
  incubation: "border-stage-incubation bg-stage-incubation/10 hover:bg-stage-incubation/20",
  illumination: "border-stage-illumination bg-stage-illumination/10 hover:bg-stage-illumination/20",
  evaluation: "border-stage-evaluation bg-stage-evaluation/10 hover:bg-stage-evaluation/20",
  elaboration: "border-stage-elaboration bg-stage-elaboration/10 hover:bg-stage-elaboration/20",
};

// Jigsaw clip path for tray pieces
const jigsawPiecePath = "polygon(8% 0%, 38% 0%, 40% -5%, 48% -7%, 56% -5%, 58% 0%, 92% 0%, 100% 8%, 105% 40%, 107% 48%, 105% 56%, 100% 58%, 100% 92%, 92% 100%, 58% 100%, 56% 105%, 48% 107%, 40% 105%, 38% 100%, 8% 100%, 0% 92%, -5% 56%, -7% 48%, -5% 40%, 0% 38%, 0% 8%)";

export function PiecesTray({ phase, pieces, selectedPiece, onPieceSelect, onDragStart, onDragEnd }: PiecesTrayProps) {
  const unplaced = pieces.filter((p) => !p.placed);

  return (
    <div className="w-full md:w-80">
      <h3 className="mb-3 flex items-center gap-2 font-display text-base font-semibold sm:text-lg">
        <span className="text-xl">🧩</span>
        {phase === 1 ? "Stage Names" : "Quotes"}
      </h3>
      <p className="mb-3 text-xs text-muted-foreground">
        Drag a piece to a slot, or tap to select then tap a slot
      </p>
      <div className="flex flex-wrap gap-3 md:flex-col">
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
              onDragStart={() => onDragStart(piece.id)}
              onDragEnd={() => onDragEnd()}
              onClick={() => onPieceSelect(piece.id)}
              style={{ clipPath: jigsawPiecePath }}
              className={`group relative cursor-grab select-none border-2 p-4 px-5 text-left text-xs font-medium shadow-md transition-all active:cursor-grabbing sm:p-5 sm:px-6 sm:text-sm ${
                selectedPiece === piece.id
                  ? `${stageColorMap[piece.stageId] || "border-primary bg-primary/10"} ring-2 ring-primary/40 scale-[1.04]`
                  : `${stageColorMap[piece.stageId] || "border-border bg-card"}`
              }`}
            >
              {piece.type === "stage" ? (
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-[10px] font-bold text-primary">
                    🧩
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
