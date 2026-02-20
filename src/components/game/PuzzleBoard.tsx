import { CREATIVITY_STAGES } from "@/lib/gameData";
import elephantImg from "@/assets/elephant-puzzle.png";

interface SlotState {
  id: string;
  stageId: string;
  filled: boolean;
  type: "stage" | "quote";
}

interface PuzzleBoardProps {
  phase: 1 | 2;
  currentSlots: SlotState[];
  feedback: { type: "correct" | "incorrect"; slotId: string } | null;
  onSlotTap: (slotId: string, stageId: string, slotType: "stage" | "quote") => void;
  onDrop: (slotId: string, stageId: string, slotType: "stage" | "quote") => void;
  selectedPiece: string | null;
}

const stageColors: Record<string, string> = {
  preparation: "bg-stage-preparation",
  incubation: "bg-stage-incubation",
  illumination: "bg-stage-illumination",
  evaluation: "bg-stage-evaluation",
  elaboration: "bg-stage-elaboration",
};

// Permanent labels for each slot
const slotLabels: Record<string, { emoji: string; label: string }> = {
  preparation: { emoji: "🐘", label: "Body" },
  incubation: { emoji: "🐦", label: "Bird 1" },
  illumination: { emoji: "🐦", label: "Bird 2" },
  evaluation: { emoji: "🐦", label: "Bird 3" },
  elaboration: { emoji: "🐦", label: "Bird 4" },
};

// Positions: Adjacent to the animals, NOT directly on top
const slotPositions: Record<string, { top: string; left: string; width: string }> = {
  preparation: { top: "72%", left: "32%", width: "26%" },     // Below elephant body
  incubation: { top: "42%", left: "2%", width: "20%" },       // Below-left of bird 1
  illumination: { top: "30%", left: "24%", width: "20%" },    // Below bird 2
  evaluation: { top: "30%", left: "50%", width: "20%" },      // Below bird 3
  elaboration: { top: "34%", left: "74%", width: "20%" },     // Below bird 4
};

const quotePositions: Record<string, { top: string; left: string; width: string }> = {
  preparation: { top: "85%", left: "30%", width: "28%" },
  incubation: { top: "55%", left: "0%", width: "24%" },
  illumination: { top: "43%", left: "22%", width: "24%" },
  evaluation: { top: "43%", left: "48%", width: "24%" },
  elaboration: { top: "48%", left: "72%", width: "24%" },
};

// Jigsaw-shaped clip path for slots
const jigsawSlotPath = "polygon(10% 0%, 40% 0%, 42% -6%, 50% -8%, 58% -6%, 60% 0%, 90% 0%, 100% 10%, 106% 42%, 108% 50%, 106% 58%, 100% 60%, 100% 90%, 90% 100%, 60% 100%, 58% 106%, 50% 108%, 42% 106%, 40% 100%, 10% 100%, 0% 90%, -6% 58%, -8% 50%, -6% 42%, 0% 40%, 0% 10%)";

export function PuzzleBoard({ phase, currentSlots, feedback, onSlotTap, onDrop, selectedPiece }: PuzzleBoardProps) {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  return (
    <div className="relative mx-auto aspect-[4/3] w-full max-w-2xl overflow-visible rounded-xl border-2 border-primary/20 shadow-lg">
      <img
        src={elephantImg}
        alt="Creativity Elephant Puzzle"
        className="h-full w-full object-cover rounded-xl"
        draggable={false}
      />

      {/* Drop Slots positioned adjacent to birds and elephant */}
      <div className="absolute inset-0">
        {CREATIVITY_STAGES.map((stage, i) => {
          const stageSlot = currentSlots.find(
            (s) => s.stageId === stage.id && s.type === "stage"
          );
          const quoteSlot = currentSlots.find(
            (s) => s.stageId === stage.id && s.type === "quote"
          );
          const pos = slotPositions[stage.id];
          const qPos = quotePositions[stage.id];
          const labelInfo = slotLabels[stage.id];

          return (
            <div key={stage.id}>
              {/* Permanent emoji label */}
              <div
                style={{
                  position: "absolute",
                  top: pos.top,
                  left: pos.left,
                  width: pos.width,
                  transform: "translateY(-100%)",
                }}
                className="flex items-center justify-center gap-1 pb-0.5 pointer-events-none select-none"
              >
                <span className="text-xs sm:text-sm drop-shadow-md">{labelInfo.emoji}</span>
                <span className="text-[7px] sm:text-[9px] md:text-xs font-bold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] tracking-wide uppercase">
                  {labelInfo.label}
                </span>
              </div>

              {/* Stage name slot – jigsaw shape */}
              {stageSlot && (
                <button
                  type="button"
                  onClick={() => onSlotTap(stageSlot.id, stageSlot.stageId, "stage")}
                  onDragOver={handleDragOver}
                  onDrop={(e) => {
                    e.preventDefault();
                    onDrop(stageSlot.id, stageSlot.stageId, "stage");
                  }}
                  style={{
                    position: "absolute",
                    top: pos.top,
                    left: pos.left,
                    width: pos.width,
                    clipPath: jigsawSlotPath,
                  }}
                  className={`flex h-9 items-center justify-center text-[8px] font-bold transition-all sm:h-11 sm:text-xs md:h-14 md:text-sm ${
                    stageSlot.filled
                      ? `${stageColors[stage.id]} text-white shadow-lg`
                      : selectedPiece
                        ? "bg-black/50 text-white/90 ring-2 ring-primary/60 animate-pulse"
                        : "bg-black/40 text-white/80 hover:bg-black/50 border-white/30"
                  } ${
                    feedback?.slotId === stageSlot.id && feedback.type === "correct"
                      ? "animate-glow-correct"
                      : ""
                  } ${
                    feedback?.slotId === stageSlot.id && feedback.type === "incorrect"
                      ? "animate-shake"
                      : ""
                  }`}
                >
                  {stageSlot.filled ? (
                    <span className="flex items-center gap-1">
                      <span>🧩</span> {stage.name}
                    </span>
                  ) : (
                    `${i + 1}. ???`
                  )}
                </button>
              )}

              {/* Quote slot (phase 2) – jigsaw shape */}
              {phase === 2 && quoteSlot && (
                <button
                  type="button"
                  onClick={() => onSlotTap(quoteSlot.id, quoteSlot.stageId, "quote")}
                  onDragOver={handleDragOver}
                  onDrop={(e) => {
                    e.preventDefault();
                    onDrop(quoteSlot.id, quoteSlot.stageId, "quote");
                  }}
                  style={{
                    position: "absolute",
                    top: qPos.top,
                    left: qPos.left,
                    width: qPos.width,
                    clipPath: jigsawSlotPath,
                  }}
                  className={`flex min-h-[2rem] items-center justify-center p-2 text-[7px] leading-tight transition-all sm:min-h-[2.8rem] sm:text-[9px] md:min-h-[3.2rem] md:text-xs ${
                    quoteSlot.filled
                      ? `${stageColors[stage.id]} text-white shadow-lg`
                      : selectedPiece
                        ? "bg-black/40 text-white/80 ring-2 ring-accent/50 animate-pulse"
                        : "bg-black/30 text-white/70 hover:bg-black/40"
                  } ${
                    feedback?.slotId === quoteSlot.id && feedback.type === "correct"
                      ? "animate-glow-correct"
                      : ""
                  } ${
                    feedback?.slotId === quoteSlot.id && feedback.type === "incorrect"
                      ? "animate-shake"
                      : ""
                  }`}
                >
                  {quoteSlot.filled ? (
                    <span className="flex items-center gap-1">
                      <span>🧩</span> {stage.quote.slice(0, 28)}...
                    </span>
                  ) : (
                    "📝 ?"
                  )}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
