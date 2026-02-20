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
  selectedPiece: string | null;
}

const stageColors: Record<string, string> = {
  preparation: "bg-stage-preparation",
  incubation: "bg-stage-incubation",
  illumination: "bg-stage-illumination",
  evaluation: "bg-stage-evaluation",
  elaboration: "bg-stage-elaboration",
};

export function PuzzleBoard({ phase, currentSlots, feedback, onSlotTap, selectedPiece }: PuzzleBoardProps) {
  return (
    <div className="relative mx-auto aspect-[4/3] w-full max-w-2xl overflow-hidden rounded-xl border-2 border-primary/20 shadow-lg">
      <img
        src={elephantImg}
        alt="Creativity Elephant Puzzle"
        className="h-full w-full object-cover"
        draggable={false}
      />
      {/* Drop Slots overlayed on the image */}
      <div className="absolute inset-0 grid grid-cols-5 gap-1 p-2 sm:gap-2 sm:p-4 md:p-6">
        {CREATIVITY_STAGES.map((stage, i) => {
          const stageSlot = currentSlots.find(
            (s) => s.stageId === stage.id && s.type === "stage"
          );
          const quoteSlot = currentSlots.find(
            (s) => s.stageId === stage.id && s.type === "quote"
          );

          return (
            <div key={stage.id} className="flex flex-col items-center justify-center gap-1 sm:gap-2">
              {/* Stage name slot */}
              {stageSlot && (
                <button
                  type="button"
                  onClick={() => onSlotTap(stageSlot.id, stageSlot.stageId, "stage")}
                  className={`flex h-8 w-full items-center justify-center rounded-lg border-2 border-dashed text-[10px] font-semibold transition-all sm:h-10 sm:text-xs md:h-12 md:text-sm ${
                    stageSlot.filled
                      ? `${stageColors[stage.id]} border-solid text-white`
                      : selectedPiece
                        ? "border-white/80 bg-black/40 text-white/90 ring-2 ring-primary/40"
                        : "border-white/60 bg-black/30 text-white/80"
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
                  {stageSlot.filled ? stage.name : (i + 1)}
                </button>
              )}
              {/* Quote slot (phase 2) */}
              {phase === 2 && quoteSlot && (
                <button
                  type="button"
                  onClick={() => onSlotTap(quoteSlot.id, quoteSlot.stageId, "quote")}
                  className={`flex min-h-[2.5rem] w-full items-center justify-center rounded-lg border-2 border-dashed p-1 text-[8px] leading-tight transition-all sm:min-h-[3rem] sm:text-[10px] md:min-h-[4rem] md:text-xs ${
                    quoteSlot.filled
                      ? `${stageColors[stage.id]} border-solid text-white`
                      : selectedPiece
                        ? "border-white/60 bg-black/30 text-white/80 ring-2 ring-accent/40"
                        : "border-white/40 bg-black/20 text-white/70"
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
                  {quoteSlot.filled ? stage.quote.slice(0, 40) + "..." : "?"}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
