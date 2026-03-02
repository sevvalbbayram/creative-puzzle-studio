import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CreativityStage, stageColors } from "@/lib/gameData";
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

// Slot layout for the puzzle board - positioned on the elephant (4 pillars only)
const SLOT_LAYOUT: Record<
  string,
  { stage: { top: string; left: string; width: string }; quote: { top: string; left: string; width: string } }
> = {
  preparation:  { stage: { top: "25%", left: "10%", width: "16%" }, quote: { top: "36%", left: "8%",  width: "22%" } },
  incubation:   { stage: { top: "22%", left: "29%", width: "16%" }, quote: { top: "33%", left: "27%", width: "22%" } },
  illumination: { stage: { top: "20%", left: "45%", width: "16%" }, quote: { top: "31%", left: "43%", width: "22%" } },
  verification: { stage: { top: "18%", left: "63%", width: "16%" }, quote: { top: "29%", left: "61%", width: "22%" } },
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

  const handleSlotClick = (stageId: string, slotType: "stage" | "quote") => {
    onSlotTap(stageId, stageId, slotType);
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
        <div className="absolute inset-0 bg-black/5 rounded-xl pointer-events-none" />
      )}

      {/* Puzzle slots - interactive areas for placing pieces */}
      {stages.map((stage) => {
        const stageColor = stageColors[stage.id] || stageColors.preparation;
        const stageLayout = SLOT_LAYOUT[stage.id];
        
        if (!stageLayout) return null;

        return (
          <div key={stage.id}>
            {/* Stage slot */}
            <motion.div
              className={`absolute border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                stageColor.border
              } ${
                selectedPiece?.includes(stage.id) 
                  ? "ring-2 ring-yellow-400 shadow-lg scale-105" 
                  : "hover:shadow-md hover:scale-102"
              } ${
                feedback?.slotId === stage.id 
                  ? feedback.type === "correct" 
                    ? "ring-2 ring-green-400 bg-green-100/20" 
                    : "ring-2 ring-red-400 bg-red-100/20" 
                  : "bg-white/10 backdrop-blur-sm"
              }`}
              style={{
                top: stageLayout.stage.top,
                left: stageLayout.stage.left,
                width: stageLayout.stage.width,
                aspectRatio: "1",
              }}
              onClick={() => handleSlotClick(stage.id, "stage")}
              onDragOver={handleDragOver}
              onDrop={(e) => {
                e.preventDefault();
                onDrop(stage.id, stage.id, "stage");
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Slot content - shows stage name if filled */}
              <div className="flex items-center justify-center h-full">
                {pieces.find(
                  (p) => p.stageId === stage.id && p.type === "stage" && p.filled
                ) ? (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    className={`text-center font-bold text-xs sm:text-sm ${stageColor.text}`}
                  >
                    {stage.name}
                  </motion.div>
                ) : (
                  <motion.div
                    className="text-2xl opacity-30"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  >
                    ?
                  </motion.div>
                )}
              </div>

              {/* Feedback animation */}
              {feedback?.slotId === stage.id && (
                <SparkleEffect
                  type={feedback.type}
                  position={{ x: 0, y: 0 }}
                />
              )}
            </motion.div>

            {/* Quote slot */}
            <motion.div
              className={`absolute border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                stageColor.border
              } ${
                selectedPiece?.includes(stage.id) && selectedPiece.includes("quote")
                  ? "ring-2 ring-yellow-400 shadow-lg scale-105" 
                  : "hover:shadow-md hover:scale-102"
              } ${
                feedback?.slotId === `${stage.id}-quote` 
                  ? feedback.type === "correct" 
                    ? "ring-2 ring-green-400 bg-green-100/20" 
                    : "ring-2 ring-red-400 bg-red-100/20" 
                  : "bg-white/10 backdrop-blur-sm"
              }`}
              style={{
                top: stageLayout.quote.top,
                left: stageLayout.quote.left,
                width: stageLayout.quote.width,
                aspectRatio: "2/1",
              }}
              onClick={() => handleSlotClick(stage.id, "quote")}
              onDragOver={handleDragOver}
              onDrop={(e) => {
                e.preventDefault();
                onDrop(stage.id, stage.id, "quote");
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Quote slot content */}
              <div className="flex items-center justify-center h-full p-2">
                {pieces.find(
                  (p) => p.stageId === stage.id && p.type === "quote" && p.filled
                ) ? (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={`text-center text-xs line-clamp-2 font-semibold ${stageColor.text}`}
                  >
                    "{stage.quote}"
                  </motion.div>
                ) : (
                  <motion.div
                    className="text-lg opacity-30"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  >
                    ✎
                  </motion.div>
                )}
              </div>

              {/* Feedback animation */}
              {feedback?.slotId === `${stage.id}-quote` && (
                <SparkleEffect
                  type={feedback.type}
                  position={{ x: 0, y: 0 }}
                />
              )}
            </motion.div>
          </div>
        );
      })}

      {/* Completion overlay */}
      {completed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-gradient-to-t from-green-500/30 to-transparent rounded-xl flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 100 }}
            className="text-6xl"
          >
            🎉
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
