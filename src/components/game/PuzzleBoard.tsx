import { CREATIVITY_STAGES } from "@/lib/gameData";
import puzzleBgImg from "@/assets/puzzle-background.png";
import puzzleCompleteImg from "@/assets/puzzle-completed.png";
import { SparkleEffect } from "./SparkleEffect";

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
  completed?: boolean;
}

const stageColors: Record<string, { bg: string; border: string }> = {
  preparation: { bg: "bg-stage-preparation", border: "border-stage-preparation" },
  incubation: { bg: "bg-stage-incubation", border: "border-stage-incubation" },
  illumination: { bg: "bg-stage-illumination", border: "border-stage-illumination" },
  evaluation: { bg: "bg-stage-evaluation", border: "border-stage-evaluation" },
  elaboration: { bg: "bg-stage-elaboration", border: "border-stage-elaboration" },
};

// Permanent labels
const slotLabels: Record<string, { emoji: string; label: string }> = {
  preparation: { emoji: "🐘", label: "BODY" },
  incubation: { emoji: "🐦", label: "BIRD 1" },
  illumination: { emoji: "🐦", label: "BIRD 2" },
  evaluation: { emoji: "🐦", label: "BIRD 3" },
  elaboration: { emoji: "🐦", label: "BIRD 4" },
};

// Fine-tuned positions: adjacent to animals, not covering them
const slotPositions: Record<string, { top: string; left: string; width: string }> = {
  preparation: { top: "68%", left: "30%", width: "24%" },     // Below elephant's back
  incubation: { top: "46%", left: "3%", width: "18%" },       // Below the large swan (left)
  illumination: { top: "38%", left: "24%", width: "18%" },    // Below geese cluster (center-left)
  evaluation: { top: "36%", left: "44%", width: "18%" },      // Below geese (center-right)
  elaboration: { top: "38%", left: "64%", width: "18%" },     // Below far-right birds
};

const quotePositions: Record<string, { top: string; left: string; width: string }> = {
  preparation: { top: "82%", left: "28%", width: "28%" },
  incubation: { top: "58%", left: "1%", width: "22%" },
  illumination: { top: "50%", left: "22%", width: "22%" },
  evaluation: { top: "48%", left: "42%", width: "22%" },
  elaboration: { top: "50%", left: "62%", width: "22%" },
};

// Jigsaw tab clip path
const jigsawClip = "polygon(8% 0%, 36% 0%, 38% 5%, 50% 8%, 62% 5%, 64% 0%, 92% 0%, 100% 8%, 100% 36%, 105% 38%, 108% 50%, 105% 62%, 100% 64%, 100% 92%, 92% 100%, 64% 100%, 62% 95%, 50% 92%, 38% 95%, 36% 100%, 8% 100%, 0% 92%, 0% 64%, -5% 62%, -8% 50%, -5% 38%, 0% 36%, 0% 8%)";

export function PuzzleBoard({ phase, currentSlots, feedback, onSlotTap, onDrop, selectedPiece, completed }: PuzzleBoardProps) {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  return (
    <div className="relative mx-auto aspect-[4/3] w-full max-w-2xl overflow-visible rounded-xl border-2 border-primary/20 shadow-lg">
      <img
        src={completed ? puzzleCompleteImg : puzzleBgImg}
        alt="Creativity Elephant Puzzle"
        className="h-full w-full object-cover rounded-xl transition-all duration-700"
        draggable={false}
      />

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
          const colors = stageColors[stage.id];

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
                <span className="text-[7px] sm:text-[9px] md:text-xs font-bold text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] tracking-wider uppercase">
                  {labelInfo.label}
                </span>
              </div>

              {/* Stage slot – jigsaw piece shape */}
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
                    clipPath: jigsawClip,
                  }}
                  className={`flex h-10 items-center justify-center text-[7px] font-bold transition-all sm:h-12 sm:text-[10px] md:h-14 md:text-sm ${
                    stageSlot.filled
                      ? `${colors.bg} text-white jigsaw-filled`
                      : selectedPiece
                        ? "bg-black/50 text-white/90 animate-pulse jigsaw-empty-active"
                        : "bg-black/35 text-white/80 hover:bg-black/50 jigsaw-empty"
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
                      <span className="text-[10px] sm:text-xs">🧩</span> {stage.name}
                    </span>
                  ) : (
                    `${i + 1}. ???`
                  )}
                </button>
              )}

              {/* Sparkle effect for stage slot */}
              <SparkleEffect
                trigger={feedback?.slotId === stageSlot?.id && feedback?.type === "correct" ? stageSlot?.id ?? null : null}
                top={pos.top}
                left={pos.left}
                width={pos.width}
              />

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
                    clipPath: jigsawClip,
                  }}
                  className={`flex min-h-[2.2rem] items-center justify-center p-2 text-[6px] leading-tight transition-all sm:min-h-[3rem] sm:text-[8px] md:min-h-[3.4rem] md:text-xs ${
                    quoteSlot.filled
                      ? `${colors.bg} text-white jigsaw-filled`
                      : selectedPiece
                        ? "bg-black/40 text-white/80 animate-pulse jigsaw-empty-active"
                        : "bg-black/25 text-white/70 hover:bg-black/40 jigsaw-empty"
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
                      <span className="text-[8px]">🧩</span> {stage.quote.slice(0, 25)}...
                    </span>
                  ) : (
                    "📝 ?"
                  )}
                </button>
              )}

              {/* Sparkle effect for quote slot */}
              {phase === 2 && quoteSlot && (
                <SparkleEffect
                  trigger={feedback?.slotId === quoteSlot.id && feedback?.type === "correct" ? quoteSlot.id : null}
                  top={qPos.top}
                  left={qPos.left}
                  width={qPos.width}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
