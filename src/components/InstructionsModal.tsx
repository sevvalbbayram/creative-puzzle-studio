import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Puzzle, Target, Timer, Star, Smartphone } from "lucide-react";

const STORAGE_KEY = "puzzle-instructions-seen";

interface InstructionsModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  phase?: number;
}

export function InstructionsModal({ open: externalOpen, onOpenChange }: InstructionsModalProps) {
  const [internalOpen, setInternalOpen] = useState(false);

  const isControlled = externalOpen !== undefined;
  const open = isControlled ? externalOpen : internalOpen;

  useEffect(() => {
    if (!isControlled) {
      const seen = localStorage.getItem(STORAGE_KEY);
      if (!seen) setInternalOpen(true);
    }
  }, [isControlled]);

  const handleClose = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    if (isControlled) {
      onOpenChange?.(false);
    } else {
      setInternalOpen(false);
    }
  };

  const handleOpenChange = (v: boolean) => {
    if (!v) handleClose();
    else if (isControlled) onOpenChange?.(true);
    else setInternalOpen(true);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg mx-4 sm:mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl sm:text-2xl">
            <Puzzle className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            How to Play
          </DialogTitle>
          <DialogDescription>
            Place the four main keys first, then match each quote to its key. Two phases, one puzzle.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 sm:space-y-4 py-2">
          <div className="flex items-start gap-3">
            <div className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">1</div>
            <div>
              <h4 className="font-semibold text-sm sm:text-base flex items-center gap-1">
                <Target className="h-4 w-4" /> Phase 1: Main keys
              </h4>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Place the four main keys in the <strong>top row</strong>: Preparation, Incubation, Illumination, Verification. Tap a key piece, then tap the correct slot.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent font-bold text-sm">2</div>
            <div>
              <h4 className="font-semibold text-sm sm:text-base flex items-center gap-1">
                <Target className="h-4 w-4" /> Phase 2: Quotes
              </h4>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Place each quote piece in the <strong>bottom row</strong> under its matching key. The quote must go in the same column as its creativity stage.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full bg-secondary/10 text-secondary font-bold text-sm">3</div>
            <div>
              <h4 className="font-semibold text-sm sm:text-base flex items-center gap-1">
                <Timer className="h-4 w-4" /> Scoring
              </h4>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Score depends on speed and accuracy. Each miss costs points. Difficulty scales: Easy = smaller grid + more pre-filled hints, Hard = larger grid + no hints. Some quote pieces are decoys (wrong) — avoid placing them!
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full bg-success/10 text-success font-bold text-sm">
              <Star className="h-4 w-4" />
            </div>
            <div>
              <h4 className="font-semibold text-sm sm:text-base">Tips</h4>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Match each quote to the key above it (same column). Build combos by placing pieces correctly in a row for bonus XP!
              </p>
            </div>
          </div>
        </div>

        <Button onClick={handleClose} className="w-full h-11 text-base font-semibold touch-manipulation">
          Got it, let's play!
        </Button>
      </DialogContent>
    </Dialog>
  );
}
