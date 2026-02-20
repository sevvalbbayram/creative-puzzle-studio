import { CREATIVITY_STAGES } from "@/lib/gameData";
import elephantImg from "@/assets/elephant-puzzle.png";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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

// Slot hints showing where each stage goes
const slotHints: Record<string, string> = {
  preparation: "🐘 Elephant Body",
  incubation: "🐦 Bird 1 (top-left)",
  illumination: "🐦 Bird 2 (top-center)",
  evaluation: "🐦 Bird 3 (top-right)",
  elaboration: "🐦 Bird 4 (far-right)",
};

// Positions: Preparation on elephant body, 4 stages on the 4 birds
const slotPositions: Record<string, { top: string; left: string; width: string }> = {
  preparation: { top: "50%", left: "36%", width: "22%" },    // Elephant body center
  incubation: { top: "28%", left: "10%", width: "18%" },     // Bird 1 – large swan left
  illumination: { top: "14%", left: "30%", width: "18%" },   // Bird 2 – geese center-left
  evaluation: { top: "15%", left: "50%", width: "18%" },     // Bird 3 – geese center-right
  elaboration: { top: "18%", left: "68%", width: "16%" },    // Bird 4 – far-right birds
};

const quotePositions: Record<string, { top: string; left: string; width: string }> = {
  preparation: { top: "63%", left: "34%", width: "24%" },    // Below elephant slot
  incubation: { top: "40%", left: "7%", width: "22%" },      // Below bird 1
  illumination: { top: "27%", left: "28%", width: "22%" },   // Below bird 2
  evaluation: { top: "28%", left: "48%", width: "22%" },     // Below bird 3
  elaboration: { top: "30%", left: "65%", width: "20%" },    // Below bird 4
};

export function PuzzleBoard({ phase, currentSlots, feedback, onSlotTap, onDrop, selectedPiece }: PuzzleBoardProps) {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  return (
    <TooltipProvider delayDuration={200}>
      <div className="relative mx-auto aspect-[4/3] w-full max-w-2xl overflow-hidden rounded-xl border-2 border-primary/20 shadow-lg">
        <img
          src={elephantImg}
          alt="Creativity Elephant Puzzle"
          className="h-full w-full object-cover"
          draggable={false}
        />
        {/* Drop Slots positioned on birds and elephant */}
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
            const hint = slotHints[stage.id];

            return (
              <div key={stage.id}>
                {/* Stage name slot with tooltip */}
                {stageSlot && (
                  <Tooltip>
                    <TooltipTrigger asChild>
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
                        className={`flex h-8 items-center justify-center rounded-lg border-2 border-dashed text-[8px] font-semibold transition-all sm:h-9 sm:text-xs md:h-11 md:text-sm ${
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
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="text-xs">
                      {hint}
                    </TooltipContent>
                  </Tooltip>
                )}
                {/* Quote slot (phase 2) with tooltip */}
                {phase === 2 && quoteSlot && (
                  <Tooltip>
                    <TooltipTrigger asChild>
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
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="text-xs">
                      {hint} — Quote
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </TooltipProvider>
  );
}
