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

// Positions on the elephant body (percentage-based for responsiveness)
// head area, back, belly, front legs area, rear/tail area
const slotPositions: Record<string, { top: string; left: string; width: string }> = {
  preparation: { top: "12%", left: "55%", width: "22%" },   // Head / forehead
  incubation: { top: "18%", left: "25%", width: "22%" },    // Upper back
  illumination: { top: "45%", left: "40%", width: "22%" },  // Belly center
  evaluation: { top: "55%", left: "15%", width: "22%" },    // Near front legs
  elaboration: { top: "35%", left: "2%", width: "22%" },    // Rear / tail area
};

const quotePositions: Record<string, { top: string; left: string; width: string }> = {
  preparation: { top: "28%", left: "55%", width: "24%" },
  incubation: { top: "32%", left: "25%", width: "24%" },
  illumination: { top: "60%", left: "40%", width: "24%" },
  evaluation: { top: "70%", left: "15%", width: "24%" },
  elaboration: { top: "50%", left: "2%", width: "24%" },
};

export function PuzzleBoard({ phase, currentSlots, feedback, onSlotTap, onDrop, selectedPiece }: PuzzleBoardProps) {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  return (
    <div className="relative mx-auto aspect-[4/3] w-full max-w-2xl overflow-hidden rounded-xl border-2 border-primary/20 shadow-lg">
      <img
        src={elephantImg}
        alt="Creativity Elephant Puzzle"
        className="h-full w-full object-cover"
        draggable={false}
      />
      {/* Drop Slots positioned on elephant body */}
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

          return (
            <div key={stage.id}>
              {/* Stage name slot */}
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
                  }}
                  className={`flex h-7 items-center justify-center rounded-lg border-2 border-dashed text-[9px] font-semibold transition-all sm:h-9 sm:text-xs md:h-11 md:text-sm ${
                    stageSlot.filled
                      ? `${stageColors[stage.id]} border-solid text-white shadow-md`
                      : selectedPiece
                        ? "border-white/80 bg-black/40 text-white/90 ring-2 ring-primary/50 animate-pulse"
                        : "border-white/60 bg-black/30 text-white/80 hover:bg-black/40"
                  } ${
                    feedback?.slotId === stageSlot.id && feedback.type === "correct"
                      ? "animate-glow-correct"
                      : ""
                  } ${
                    feedback?.slotId === stageSlot.id && feedback.type === "incorrect"
                      ? "animate-shake border-destructive"
                      : ""
                  }`}
                >
                  {stageSlot.filled ? stage.name : `${i + 1}. ???`}
                </button>
              )}
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
                  }}
                  className={`flex min-h-[1.8rem] items-center justify-center rounded-lg border-2 border-dashed p-1 text-[7px] leading-tight transition-all sm:min-h-[2.5rem] sm:text-[9px] md:min-h-[3rem] md:text-xs ${
                    quoteSlot.filled
                      ? `${stageColors[stage.id]} border-solid text-white shadow-md`
                      : selectedPiece
                        ? "border-white/60 bg-black/30 text-white/80 ring-2 ring-accent/50 animate-pulse"
                        : "border-white/40 bg-black/20 text-white/70 hover:bg-black/30"
                  } ${
                    feedback?.slotId === quoteSlot.id && feedback.type === "correct"
                      ? "animate-glow-correct"
                      : ""
                  } ${
                    feedback?.slotId === quoteSlot.id && feedback.type === "incorrect"
                      ? "animate-shake border-destructive"
                      : ""
                  }`}
                >
                  {quoteSlot.filled ? stage.quote.slice(0, 30) + "..." : "📝 ?"}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
