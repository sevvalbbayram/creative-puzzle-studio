import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Puzzle, Target, Quote, Timer, Star } from "lucide-react";

const STORAGE_KEY = "puzzle-instructions-seen";

export function InstructionsModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem(STORAGE_KEY);
    if (!seen) {
      setOpen(true);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Puzzle className="h-6 w-6 text-primary" />
            How to Play
          </DialogTitle>
          <DialogDescription>
            Learn the 4 pillars of creativity by solving this puzzle!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">1</div>
            <div>
              <h4 className="font-semibold flex items-center gap-1">
                <Target className="h-4 w-4" /> Phase 1: Stage Names
              </h4>
              <p className="text-sm text-muted-foreground">
                Drag and drop the 4 creativity pillars (Preparation, Incubation, Illumination, Verification) into the correct slots on the puzzle.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent font-bold text-sm">2</div>
            <div>
              <h4 className="font-semibold flex items-center gap-1">
                <Quote className="h-4 w-4" /> Phase 2: Quotes
              </h4>
              <p className="text-sm text-muted-foreground">
                Once all stages are placed, match each famous creativity quote to its corresponding stage.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary/10 text-secondary font-bold text-sm">3</div>
            <div>
              <h4 className="font-semibold flex items-center gap-1">
                <Timer className="h-4 w-4" /> Scoring
              </h4>
              <p className="text-sm text-muted-foreground">
                Your score depends on speed and accuracy. Incorrect attempts cost 25 points each. Harder difficulties give bonus multipliers!
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-success/10 text-success font-bold text-sm">
              <Star className="h-4 w-4" />
            </div>
            <div>
              <h4 className="font-semibold">Tips</h4>
              <p className="text-sm text-muted-foreground">
                On mobile, tap a piece then tap the slot. On desktop, drag pieces to slots. Green glow = correct, red shake = try again!
              </p>
            </div>
          </div>
        </div>

        <Button onClick={handleClose} className="w-full">
          Got it, let's play!
        </Button>
      </DialogContent>
    </Dialog>
  );
}
