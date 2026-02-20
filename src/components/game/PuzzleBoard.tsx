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
  verification: { bg: "bg-stage-verification", border: "border-stage-verification" },
};

// 4 slots — each centered on an individual bird body
const slotPositions: Record<string, { top: string; left: string; width: string }> = {
  preparation: { top: "24%", left: "10%", width: "13%" },    // Left pair of geese
  incubation: { top: "18%", left: "28%", width: "13%" },     // Center-left geese
  illumination: { top: "14%", left: "45%", width: "13%" },   // Center-right goose
  verification: { top: "6%", left: "66%", width: "13%" },    // Large goose, far right
};

const quotePositions: Record<string, { top: string; left: string; width: string }> = {
  preparation: { top: "38%", left: "8%", width: "16%" },
  incubation: { top: "32%", left: "26%", width: "16%" },
  illumination: { top: "28%", left: "43%", width: "16%" },
  verification: { top: "20%", left: "64%", width: "16%" },
};

const jigsawClip = "polygon(8% 0%, 36% 0%, 38% 5%, 50% 8%, 62% 5%, 64% 0%, 92% 0%, 100% 8%, 100% 36%, 105% 38%, 108% 50%, 105% 62%, 100% 64%, 100% 92%, 92% 100%, 64% 100%, 62% 95%, 50% 92%, 38% 95%, 36% 100%, 8% 100%, 0% 92%, 0% 64%, -5% 62%, -8% 50%, -5% 38%, 0% 36%, 0% 8%)";

export function PuzzleBoard({ phase, currentSlots, feedback, onSlotTap, onDrop, selectedPiece, completed }: PuzzleBoardProps) {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  return (
    <div className="relative mx-auto aspect-[4/3] w-full max-w-2xl overflow-visible rounded-xl border-2 border-primary/20 shadow-lg touch-manipulation">
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
          const colors = stageColors[stage.id] || { bg: "bg-primary", border: "border-primary" };

          return (
            <div key={stage.id}>
              {/* Stage slot */}
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
                  className={`flex h-8 items-center justify-center text-[7px] font-medium backdrop-blur-[1px] transition-all sm:h-10 sm:text-[9px] md:h-11 md:text-xs ${
                    stageSlot.filled
                      ? `${colors.bg}/50 text-white/90 jigsaw-filled`
                      : selectedPiece
                        ? "bg-black/20 text-white/80 animate-pulse jigsaw-empty-active"
                        : "bg-black/15 text-white/70 hover:bg-black/20 jigsaw-empty"
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

              <SparkleEffect
                trigger={feedback?.slotId === stageSlot?.id && feedback?.type === "correct" ? stageSlot?.id ?? null : null}
                top={pos.top}
                left={pos.left}
                width={pos.width}
              />

              {/* Quote slot (phase 2) */}
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
                  className={`flex min-h-[1.8rem] items-center justify-center p-1.5 text-[5px] leading-tight backdrop-blur-[1px] transition-all sm:min-h-[2.4rem] sm:text-[7px] md:min-h-[2.8rem] md:text-[10px] ${
                    quoteSlot.filled
                      ? `${colors.bg}/50 text-white/90 jigsaw-filled`
                      : selectedPiece
                        ? "bg-black/15 text-white/70 animate-pulse jigsaw-empty-active"
                        : "bg-black/10 text-white/60 hover:bg-black/15 jigsaw-empty"
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
