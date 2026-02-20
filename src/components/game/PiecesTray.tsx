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
}

export function PiecesTray({ phase, pieces, selectedPiece, onPieceSelect }: PiecesTrayProps) {
  const unplaced = pieces.filter((p) => !p.placed);

  return (
    <div className="w-full md:w-72">
      <h3 className="mb-3 font-display text-base font-semibold sm:text-lg">
        {phase === 1 ? "Stage Names" : "Quotes"} — Tap to select, then tap a slot
      </h3>
      <div className="flex flex-wrap gap-2 md:flex-col">
        <AnimatePresence>
          {unplaced.map((piece) => (
            <motion.button
              key={piece.id}
              layout
              type="button"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              onClick={() => onPieceSelect(piece.id)}
              className={`select-none rounded-lg border-2 p-2 text-left text-xs font-medium shadow-sm transition-colors sm:p-3 sm:text-sm ${
                selectedPiece === piece.id
                  ? "border-primary bg-primary/10 ring-2 ring-primary/30"
                  : "border-border bg-card hover:border-primary/50"
              }`}
            >
              {piece.type === "stage" ? (
                <span className="font-display">{piece.label}</span>
              ) : (
                <span className="italic text-muted-foreground">"{piece.label}"</span>
              )}
            </motion.button>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
