import { EightPuzzleLab } from "@/components/game/EightPuzzleLab";
import { SlidingPicturePuzzle } from "@/components/game/SlidingPicturePuzzle";

export default function GameTimePage() {
  return (
    <div className="min-h-screen bg-background py-6 px-4 flex flex-col gap-8">
      <EightPuzzleLab />
      <div className="max-w-5xl mx-auto w-full">
        <SlidingPicturePuzzle
          size={4}
          labels={[
            "PREP", "INCUBATE", "ILLUMINATE", "EVALUATE",
            "PLAN", "EXPLORE", "IDEATE", "TEST",
            "DRAFT", "REFINE", "SHARE", "LEARN",
            "CURIOUS", "BRAVE", "PLAYFUL", "",
          ]}
        />
      </div>
    </div>
  );
}

