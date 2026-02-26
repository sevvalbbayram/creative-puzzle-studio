import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CreativityStage } from "@/lib/gameData";
import puzzleBgImg from "@/assets/elephant-puzzle-new.png";
import { SparkleEffect } from "./SparkleEffect";

interface PuzzlePiece {
  id: string;
  stageId: string;
  type: "stage" | "quote";
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  filled: boolean;
  label: string;
}

interface JigsawPuzzleBoardProps {
  phase: 1 | 2;
  stages: CreativityStage[];
  pieces: PuzzlePiece[];
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

// Jigsaw outline shape
const jigsawClip =
  "polygon(8% 0%, 36% 0%, 38% 5%, 50% 8%, 62% 5%, 64% 0%, 92% 0%, 100% 8%, 100% 36%, 105% 38%, 108% 50%, 105% 62%, 100% 64%, 100% 92%, 92% 100%, 64% 100%, 62% 95%, 50% 92%, 38% 95%, 36% 100%, 8% 100%, 0% 92%, 0% 64%, -5% 62%, -8% 50%, -5% 38%, 0% 36%, 0% 8%)";

// Slot layout for the puzzle board - positioned on the elephant
const SLOT_LAYOUT: Record<
  string,
  { stage: { top: string; left: string; width: string }; quote: { top: string; left: string; width: string } }
> = {
  preparation:  { stage: { top: "25%", left: "10%", width: "16%" }, quote: { top: "36%", left: "8%",  width: "22%" } },
  incubation:   { stage: { top: "22%", left: "29%", width: "16%" }, quote: { top: "33%", left: "27%", width: "22%" } },
  illumination: { stage: { top: "20%", left: "45%", width: "16%" }, quote: { top: "31%", left: "43%", width: "22%" } },
  evaluation:   { stage: { top: "18%", left: "63%", width: "16%" }, quote: { top: "29%", left: "61%", width: "22%" } },
  elaboration:  { stage: { top: "44%", left: "40%", width: "16%" }, quote: { top: "56%", left: "36%", width: "24%" } },
};

const slotPositions: Record<string, { top: string; left: string; width: string }> = Object.fromEntries(
  Object.entries(SLOT_LAYOUT).map(([id, layout]) => [id, layout.stage])
);

const quotePositions: Record<string, { top: string; left: string; width: string }> = Object.fromEntries(
  Object.entries(SLOT_LAYOUT).map(([id, layout]) => [id, layout.quote])
);

export function JigsawPuzzleBoard({
  phase,
  stages,
  pieces,
  feedback,
  onSlotTap,
  onDrop,
  selectedPiece,
  completed,
}: JigsawPuzzleBoardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  return (
    <div className="relative mx-auto aspect-[4/3] w-full max-w-2xl overflow-visible rounded-xl border-2 border-primary/20 shadow-xl touch-manipulation bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-900 dark:to-slate-800">
      {/* Puzzle background image with elephant */}
      <img
        src={puzzleBgImg}
        alt="Creativity Elephant Puzzle"
        className="h-full w-full object-cover rounded-xl transition-all duration-700"
        draggable={false}
      />

      {/* Semi-transparent overlay for better slot contrast */}
      {!completed && (
        <div className="absolute inset-0 rounded-xl bg-black/5 pointer-events-none" />
      )}

      {/* Animated grid pattern overlay */}
      {!completed && (
        <div className="absolute inset-0 rounded-xl opacity-[0.03] pointer-events-none">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
      )}

      {/* Slot layer */}
      <div className="absolute inset-0">
        {stages.map((stage, i) => {
          const stageSlot = pieces.find(
            (p) => p.stageId === stage.id && p.type === "stage"
          );
          const quoteSlot = pieces.find(
            (p) => p.stageId === stage.id && p.type === "quote"
          );
          const pos = slotPositions[stage.id];
          const qPos = quotePositions[stage.id];
          const colors = stageColors[stage.id] ?? { bg: "bg-primary", border: "border-primary", text: "text-white" };

          if (!pos) return null;

          return (
            <div key={stage.id}>
              {/* ── Stage slot ── */}
              {stageSlot && (
                <>
                  <motion.button
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
                    whileHover={!stageSlot.filled ? { scale: 1.05 } : {}}
                    whileTap={!stageSlot.filled ? { scale: 0.95 } : {}}
                    className={[
                      "puzzle-piece flex h-9 items-center justify-center text-center text-[7px] font-semibold leading-tight px-1",
                      "backdrop-blur-[2px] transition-all duration-200 sm:h-11 sm:text-[9px] md:h-12 md:text-[10px]",
                      stageSlot.filled
                        ? `${colors.bg}/70 ${colors.text} jigsaw-filled shadow-lg`
                        : selectedPiece
                          ? "bg-white/30 text-white animate-pulse jigsaw-empty-active cursor-pointer border-2 border-dashed border-white/50"
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
                  </motion.button>

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
                </>
              )}

              {/* ── Quote slot (phase 2 only) ── */}
              {phase === 2 && quoteSlot && qPos && (
                <>
                  <motion.button
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
                    whileHover={!quoteSlot.filled ? { scale: 1.05 } : {}}
                    whileTap={!quoteSlot.filled ? { scale: 0.95 } : {}}
                    className={[
                      "puzzle-piece flex min-h-[2rem] items-center justify-center p-1.5 text-center text-[5px] leading-tight",
                      "backdrop-blur-[2px] transition-all duration-200 sm:min-h-[2.6rem] sm:text-[7px] md:min-h-[3rem] md:text-[9px]",
                      quoteSlot.filled
                        ? `${colors.bg}/65 ${colors.text} jigsaw-filled shadow-lg`
                        : selectedPiece
                          ? "bg-white/25 text-white/90 animate-pulse jigsaw-empty-active cursor-pointer border-2 border-dashed border-white/50"
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
                        "{quoteSlot.label.length > 30 ? quoteSlot.label.slice(0, 28) + "…" : quoteSlot.label}"
                      </span>
                    ) : (
                      <span className="opacity-70">📝 ?</span>
                    )}
                  </motion.button>

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
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Completion overlay */}
      <AnimatePresence>
        {completed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 rounded-xl bg-gradient-to-b from-primary/40 via-primary/20 to-primary/40 backdrop-blur-sm flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 100, damping: 15 }}
              className="text-center"
            >
              <div className="text-5xl mb-2">🎉</div>
              <p className="font-display text-2xl font-bold text-white drop-shadow-lg">Puzzle Complete!</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
