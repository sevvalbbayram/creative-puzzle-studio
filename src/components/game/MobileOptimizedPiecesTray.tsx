import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import { stageColorMap, stageSelectedMap, stageIconMap } from "@/lib/gameData";

interface PieceState {
  id: string;
  type: "stage" | "quote";
  stageId: string;
  label: string;
  placed: boolean;
}

interface MobileOptimizedPiecesTrayProps {
  phase: 1 | 2;
  pieces: PieceState[];
  selectedPiece: string | null;
  onPieceSelect: (pieceId: string) => void;
  onDragStart: (pieceId: string) => void;
  onDragEnd: () => void;
  isMobile?: boolean;
}

export function MobileOptimizedPiecesTray({
  phase,
  pieces,
  selectedPiece,
  onPieceSelect,
  onDragStart,
  onDragEnd,
  isMobile = false,
}: MobileOptimizedPiecesTrayProps) {
  const unplaced = pieces.filter((p) => !p.placed);
  const [isExpanded, setIsExpanded] = useState(!isMobile);

  return (
    <aside className="w-full md:w-72 lg:w-80 flex flex-col">
      {/* Tray header - collapsible on mobile */}
      <div className="mb-2 sm:mb-3">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 hover:from-primary/20 hover:to-primary/10 transition-colors md:bg-transparent md:p-0 md:hover:bg-transparent"
        >
          <h3 className="flex items-center gap-2 font-display text-sm font-bold sm:text-base md:text-lg">
            <span className="text-lg sm:text-xl" aria-hidden>🧩</span>
            {phase === 1 ? "Stage Names" : "Quote Cards"}
            <span className="ml-auto md:ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary sm:text-xs">
              {unplaced.length} left
            </span>
          </h3>
          {isMobile && (
            <div className="md:hidden">
              {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </div>
          )}
        </button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-2 space-y-1 px-3 md:px-0">
                <p className="text-[10px] text-muted-foreground sm:text-xs">
                  {phase === 1
                    ? "Tap each stage name to place it in the correct slot on the puzzle."
                    : "Tap each quote to match it to its creativity stage."}
                </p>
                <p className="text-[10px] italic text-muted-foreground sm:hidden">
                  Tap a piece, then tap a slot to place it.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Pieces grid */}
      <motion.div
        initial={isMobile ? { opacity: 0, height: 0 } : {}}
        animate={isMobile && !isExpanded ? { opacity: 0, height: 0 } : { opacity: 1, height: "auto" }}
        transition={{ duration: 0.2 }}
        className="overflow-hidden"
      >
        <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-1 lg:grid-cols-2">
          {unplaced.map((piece) => {
            const isSelected = selectedPiece === piece.id;
            const colorClass = stageColorMap[piece.stageId] || stageColorMap.preparation;
            const selectedClass = stageSelectedMap[piece.stageId] || stageSelectedMap.preparation;
            const icon = stageIconMap[piece.stageId] || "🧩";

            return (
              <motion.button
                key={piece.id}
                onClick={() => onPieceSelect(piece.id)}
                onDragStart={() => onDragStart(piece.id)}
                onDragEnd={onDragEnd}
                draggable
                className={`relative p-2 sm:p-3 rounded-lg border-2 transition-all duration-200 cursor-grab active:cursor-grabbing ${
                  isSelected ? selectedClass : colorClass
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                layout
              >
                {/* Piece content */}
                <div className="flex flex-col items-center justify-center gap-1 min-h-16 sm:min-h-20">
                  <span className="text-2xl sm:text-3xl">{icon}</span>
                  <p className="text-[10px] sm:text-xs font-semibold text-center line-clamp-2">
                    {piece.label}
                  </p>
                </div>

                {/* Selection indicator */}
                {isSelected && (
                  <motion.div
                    layoutId="selected-indicator"
                    className="absolute inset-0 rounded-lg border-2 border-yellow-400 ring-2 ring-yellow-300"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                  />
                )}

                {/* Placed indicator */}
                {piece.placed && (
                  <motion.div
                    className="absolute top-1 right-1 bg-green-500 rounded-full p-1"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                  >
                    <span className="text-white text-xs">✓</span>
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Empty state */}
        {unplaced.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-8 text-center"
          >
            <p className="text-sm font-semibold text-green-600">
              ✨ All pieces placed! Great job!
            </p>
          </motion.div>
        )}
      </motion.div>
    </aside>
  );
}
