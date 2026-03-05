import type React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useDraggable } from "@dnd-kit/core";
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

// Jigsaw clip path for tray pieces
const jigsawPiecePath =
  "polygon(8% 0%, 38% 0%, 40% -5%, 48% -7%, 56% -5%, 58% 0%, 92% 0%, 100% 8%, 105% 40%, 107% 48%, 105% 56%, 100% 58%, 100% 92%, 92% 100%, 58% 100%, 56% 105%, 48% 107%, 40% 105%, 38% 100%, 8% 100%, 0% 92%, -5% 56%, -7% 48%, -5% 40%, 0% 38%, 0% 8%)";

interface DraggableTrayItemProps {
  piece: PieceState;
  isSelected: boolean;
  isStage: boolean;
  onPieceSelect: (id: string) => void;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
}

function DraggableTrayItem({
  piece,
  isSelected,
  isStage,
  onPieceSelect,
  onDragStart,
  onDragEnd,
}: DraggableTrayItemProps) {
  const icon = stageIconMap[piece.stageId] ?? "🧩";
  const baseColorClass = stageColorMap[piece.stageId] ?? stageColorMap.preparation;
  const selectedColorClass = stageSelectedMap[piece.stageId] ?? stageSelectedMap.preparation;

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: piece.id,
  });

  const style: React.CSSProperties | undefined = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: isDragging ? 50 : undefined,
      }
    : undefined;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.75, rotate: -4 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      exit={{ opacity: 0, scale: 0.45, rotate: 6 }}
      transition={{ type: "spring", stiffness: 280, damping: 22 }}
      ref={setNodeRef}
      onClick={() => onPieceSelect(piece.id)}
      style={{ clipPath: jigsawPiecePath, ...style }}
      {...listeners}
      {...attributes}
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      aria-label={`${isStage ? "Stage" : "Quote"} piece: ${piece.label}`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onPieceSelect(piece.id);
        }
      }}
      className={[
        "puzzle-piece group relative cursor-grab select-none border-2 p-3 px-3.5 text-left transition-all duration-200",
        "active:cursor-grabbing focus-visible:outline-none focus-visible:ring-2",
        "sm:p-3.5 sm:px-4 md:p-4",
        isSelected
          ? isStage
            ? `${selectedColorClass} ring-2 scale-[1.05] shadow-lg`
            : "quote-card-piece-selected"
          : isStage
            ? `${baseColorClass} shadow-card hover:shadow-card-hover hover:scale-[1.02]`
            : "quote-card-piece",
      ].join(" ")}
      onPointerDown={() => onDragStart(piece.id)}
      onPointerUp={onDragEnd}
    >
      {isStage ? (
        <div className="flex items-center gap-2">
          <span
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-white/40 text-sm shadow-sm"
            aria-hidden
          >
            {icon}
          </span>
          <span className="font-display text-[12px] font-bold leading-tight text-foreground sm:text-sm">
            {piece.label}
          </span>
        </div>
      ) : (
        <div className="flex items-start gap-1.5">
          <span className="mt-0.5 shrink-0 text-[11px]" aria-hidden>
            💬
          </span>
          <span className="italic text-[10px] leading-snug text-muted-foreground sm:text-[11px]">
            "{piece.label}"
          </span>
        </div>
      )}

      {isSelected && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          className={[
            "absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full text-[9px] text-white shadow-sm font-bold",
            isStage ? "bg-primary" : "bg-accent",
          ].join(" ")}
          aria-hidden
        >
          ✓
        </motion.div>
      )}
    </motion.div>
  );
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

  const isQuotePhase = phase === 2;

  return (
    <aside className="w-full md:w-72 lg:w-80 flex flex-col">
      {/* Tray header - collapsible on mobile */}
      <div className="mb-2 sm:mb-3">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={[
            "w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200",
            "md:bg-transparent md:p-0 md:hover:bg-transparent",
            isQuotePhase
              ? "bg-gradient-to-r from-accent/15 to-brand-purple/10 hover:from-accent/25 hover:to-brand-purple/15 border border-accent/20"
              : "bg-gradient-to-r from-explorer-gold/15 to-explorer-parchment hover:from-explorer-gold/25 hover:to-explorer-light border border-explorer-gold/25",
          ].join(" ")}
        >
          <h3 className="flex items-center gap-2 font-display text-sm font-bold sm:text-base md:text-lg">
            <span className="text-lg sm:text-xl" aria-hidden>
              {isQuotePhase ? "💬" : "🗺️"}
            </span>
            {isQuotePhase ? "Quote Cards" : "Stage Names"}
            <span
              className={[
                "ml-auto md:ml-2 rounded-full px-2 py-0.5 text-[10px] font-semibold sm:text-xs",
                isQuotePhase ? "bg-accent/15 text-accent" : "bg-explorer-gold/20 text-explorer-dark",
              ].join(" ")}
            >
              {unplaced.length} left
            </span>
          </h3>
          {isMobile && (
            <div className="md:hidden ml-2">
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
                    ? "Place each stage name in the correct slot on the puzzle."
                    : "Match each quote to its creativity stage."}
                </p>
                <p className="text-[10px] italic text-muted-foreground sm:hidden">
                  Tap a piece, then tap a slot to place it.
                </p>
                <p className="text-[10px] italic text-muted-foreground hidden sm:block">
                  Drag to a slot, or tap to select then tap a slot.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Piece list */}
      <AnimatePresence mode="popLayout">
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-wrap gap-2 sm:gap-2.5 md:flex-col md:gap-2 overflow-y-auto md:max-h-[calc(100vh-14rem)] pr-0.5"
          >
            {unplaced.map((piece) => {
              const isSelected = selectedPiece === piece.id;
              const isStage = piece.type === "stage";
              return (
                <DraggableTrayItem
                  key={piece.id}
                  piece={piece}
                  isSelected={isSelected}
                  isStage={isStage}
                  onPieceSelect={onPieceSelect}
                  onDragStart={onDragStart}
                  onDragEnd={onDragEnd}
                />
              );
            })}

            {unplaced.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-6 text-center text-sm text-muted-foreground w-full"
              >
                <span className="text-2xl block mb-1">{isQuotePhase ? "📖" : "🗺️"}</span>
                {isQuotePhase ? "All quotes matched!" : "All stages placed!"}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </aside>
  );
}

