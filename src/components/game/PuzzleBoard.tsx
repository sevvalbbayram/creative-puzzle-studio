import { CreativityStage } from "@/lib/gameData";
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
  stages: CreativityStage[];
  currentSlots: SlotState[];
  feedback: { type: "correct" | "incorrect"; slotId: string } | null;
  onSlotTap: (slotId: string, stageId: string, slotType: "stage" | "quote") => void;
  onDrop: (slotId: string, stageId: string, slotType: "stage" | "quote") => void;
  selectedPiece: string | null;
  completed?: boolean;
}

const stageColors: Record<string, { bg: string; border: string; text: string }> = {
  preparation:  { bg: "bg-stage-preparation",  border: "border-stage-preparation",  text: "text-white" },
  incubation:   { bg: "bg-stage-incubation",   border: "border-stage-incubation",   text: "text-white" },
  illumination: { bg: "bg-stage-illumination", border: "border-stage-illumination", text: "text-gray-900" },
  evaluation:   { bg: "bg-stage-evaluation",   border: "border-stage-evaluation",   text: "text-white" },
  elaboration:  { bg: "bg-stage-elaboration",  border: "border-stage-elaboration",  text: "text-white" },
};

// Single source of truth for all difficulties: stage + quote positions stay aligned and identical
// across easy/medium/hard/very_hard. Stages 1–4 sit on the birds (arc left→right); Elaboration on elephant.
// Pillars are placed on the bird bodies for better aesthetics; quotes sit just below each pillar.
const SLOT_LAYOUT: Record<
  string,
  { stage: { top: string; left: string; width: string }; quote: { top: string; left: string; width: string } }
> = {
  preparation:  { stage: { top: "20%", left: "15%", width: "16%" }, quote: { top: "31%", left: "13%", width: "22%" } },  // on bird 1
  incubation:   { stage: { top: "18%", left: "31%", width: "16%" }, quote: { top: "29%", left: "29%", width: "22%" } },  // on bird 2
  illumination: { stage: { top: "17%", left: "47%", width: "16%" }, quote: { top: "28%", left: "45%", width: "22%" } },  // on bird 3
  evaluation:   { stage: { top: "19%", left: "63%", width: "16%" }, quote: { top: "30%", left: "61%", width: "22%" } },  // on bird 4
  elaboration:  { stage: { top: "44%", left: "40%", width: "16%" }, quote: { top: "56%", left: "36%", width: "24%" } },   // elephant body
};

const slotPositions: Record<string, { top: string; left: string; width: string }> = Object.fromEntries(
  Object.entries(SLOT_LAYOUT).map(([id, layout]) => [id, layout.stage])
);
const quotePositions: Record<string, { top: string; left: string; width: string }> = Object.fromEntries(
  Object.entries(SLOT_LAYOUT).map(([id, layout]) => [id, layout.quote])
);

// Jigsaw outline shape — tab on top, blank on bottom, tab on right, blank on left
const jigsawClip =
  "polygon(8% 0%, 36% 0%, 38% 5%, 50% 8%, 62% 5%, 64% 0%, 92% 0%, 100% 8%, 100% 36%, 105% 38%, 108% 50%, 105% 62%, 100% 64%, 100% 92%, 92% 100%, 64% 100%, 62% 95%, 50% 92%, 38% 95%, 36% 100%, 8% 100%, 0% 92%, 0% 64%, -5% 62%, -8% 50%, -5% 38%, 0% 36%, 0% 8%)";

export function PuzzleBoard({
  phase,
  stages,
  currentSlots,
  feedback,
  onSlotTap,
  onDrop,
  selectedPiece,
  completed,
}: PuzzleBoardProps) {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  return (
    <div className="relative mx-auto aspect-[4/3] w-full max-w-2xl overflow-visible rounded-xl border-2 border-primary/20 shadow-xl touch-manipulation">
      {/* Puzzle background image */}
      <img
        src={completed ? puzzleCompleteImg : puzzleBgImg}
        alt="Creativity Elephant Puzzle"
        className="h-full w-full object-cover rounded-xl transition-all duration-700"
        draggable={false}
      />

      {/* Semi-transparent overlay for better slot contrast */}
      {!completed && (
        <div className="absolute inset-0 rounded-xl bg-black/10 pointer-events-none" />
      )}

      {/* Slot layer */}
      <div className="absolute inset-0">
        {stages.map((stage, i) => {
          const stageSlot = currentSlots.find(
            (s) => s.stageId === stage.id && s.type === "stage"
          );
          const quoteSlot = currentSlots.find(
            (s) => s.stageId === stage.id && s.type === "quote"
          );
          const pos = slotPositions[stage.id];
          const qPos = quotePositions[stage.id];
          const colors = stageColors[stage.id] ?? { bg: "bg-primary", border: "border-primary", text: "text-white" };

          if (!pos) return null;

          return (
            <div key={stage.id}>
              {/* ── Stage slot ── */}
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
                  aria-label={stageSlot.filled ? stage.name : `Stage slot ${i + 1}`}
                  className={[
                    "puzzle-piece flex h-9 items-center justify-center text-center text-[7px] font-semibold leading-tight px-1",
                    "backdrop-blur-[2px] transition-all duration-200 sm:h-11 sm:text-[9px] md:h-12 md:text-[10px]",
                    stageSlot.filled
                      ? `${colors.bg}/70 ${colors.text} jigsaw-filled`
                      : selectedPiece
                        ? "bg-white/25 text-white animate-pulse jigsaw-empty-active cursor-pointer"
                        : "bg-black/20 text-white/80 hover:bg-white/20 jigsaw-empty cursor-pointer",
                    feedback?.slotId === stageSlot.id && feedback.type === "correct"
                      ? "animate-glow-correct"
                      : "",
                    feedback?.slotId === stageSlot.id && feedback.type === "incorrect"
                      ? "animate-shake"
                      : "",
                  ].filter(Boolean).join(" ")}
                >
                  {stageSlot.filled ? (
                    <span className="drop-shadow-sm font-display font-bold">{stage.name}</span>
                  ) : (
                    <span className="opacity-80">{i + 1}. ???</span>
                  )}
                </button>
              )}

              {stageSlot && (
                <SparkleEffect
                  trigger={
                    feedback?.slotId === stageSlot.id && feedback.type === "correct"
                      ? stageSlot.id
                      : null
                  }
                  top={pos.top}
                  left={pos.left}
                  width={pos.width}
                />
              )}

              {/* ── Quote slot (phase 2 only) ── */}
              {phase === 2 && quoteSlot && qPos && (
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
                  aria-label={quoteSlot.filled ? `Quote for ${stage.name}` : `Quote slot for stage ${i + 1}`}
                  className={[
                    "puzzle-piece flex min-h-[2rem] items-center justify-center p-1.5 text-center text-[5px] leading-tight",
                    "backdrop-blur-[2px] transition-all duration-200 sm:min-h-[2.6rem] sm:text-[7px] md:min-h-[3rem] md:text-[9px]",
                    quoteSlot.filled
                      ? `${colors.bg}/65 ${colors.text} jigsaw-filled`
                      : selectedPiece
                        ? "bg-white/20 text-white/90 animate-pulse jigsaw-empty-active cursor-pointer"
                        : "bg-black/15 text-white/70 hover:bg-white/15 jigsaw-empty cursor-pointer",
                    feedback?.slotId === quoteSlot.id && feedback.type === "correct"
                      ? "animate-glow-correct"
                      : "",
                    feedback?.slotId === quoteSlot.id && feedback.type === "incorrect"
                      ? "animate-shake"
                      : "",
                  ].filter(Boolean).join(" ")}
                >
                  {quoteSlot.filled ? (
                    <span className="italic drop-shadow-sm leading-tight px-0.5">
                      "{stage.quote.length > 30 ? stage.quote.slice(0, 28) + "…" : stage.quote}"
                    </span>
                  ) : (
                    <span className="opacity-70">📝 ?</span>
                  )}
                </button>
              )}

              {phase === 2 && quoteSlot && qPos && (
                <SparkleEffect
                  trigger={
                    feedback?.slotId === quoteSlot.id && feedback.type === "correct"
                      ? quoteSlot.id
                      : null
                  }
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
