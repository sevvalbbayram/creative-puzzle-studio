// The 5 stages of the creative process and their matching quotes
export interface CreativityStage {
  id: string;
  name: string;
  quotes: string[]; // Multiple quotes for randomization
  quote: string;    // The selected quote for this game session
  color: string;
}

export const CREATIVITY_STAGES_BASE: Omit<CreativityStage, "quote">[] = [
  {
    id: "preparation",
    name: "Preparation",
    quotes: [
      "Creativity requires the courage to let go of certainties.",
      "The secret to getting ahead is getting started.",
      "Preparation is the foundation of every great idea.",
      "Before anything great is created, it must first be imagined.",
    ],
    color: "stage-preparation",
  },
  {
    id: "incubation",
    name: "Incubation",
    quotes: [
      "Almost all really new ideas have a certain aspect of foolishness when they are first produced.",
      "Ideas need time to breathe before they can grow.",
      "The best thinking happens when you stop trying to think.",
      "Let your mind wander — that's where ideas are born.",
    ],
    color: "stage-incubation",
  },
  {
    id: "illumination",
    name: "Illumination",
    quotes: [
      "The moment of enlightenment is when a person's dreams of possibilities become images of probabilities.",
      "Eureka moments come to those who've done the groundwork.",
      "Inspiration strikes when the prepared mind meets the right moment.",
      "Creativity is seeing what others see and thinking what no one else has thought.",
    ],
    color: "stage-illumination",
  },
  {
    id: "verification",
    name: "Verification",
    quotes: [
      "To live a creative life, we must lose our fear of being wrong.",
      "Creativity is 1% inspiration and 99% perspiration.",
      "Great ideas need great execution to become reality.",
      "The difference between a good idea and a great one is ruthless editing.",
    ],
    color: "stage-verification",
  },
];

// Generate randomized stages with one quote each
export function getRandomizedStages(): CreativityStage[] {
  return CREATIVITY_STAGES_BASE.map((stage) => ({
    ...stage,
    quote: stage.quotes[Math.floor(Math.random() * stage.quotes.length)],
  }));
}

/**
 * Build a flat array of statements (one per grid cell) for the jigsaw puzzle.
 * Divides the grid into 4 regions (quadrants), randomly assigns each region a creativity stage,
 * and assigns each cell either the stage name or quote. Ensures randomized layout per game.
 */
export function getStatementsForGrid(
  rows: number,
  cols: number,
  stages: CreativityStage[],
): string[] {
  const total = rows * cols;
  const out: string[] = new Array(total);

  // Region index: 0 = top-left, 1 = top-right, 2 = bottom-left, 3 = bottom-right
  const getRegion = (r: number, c: number) => {
    const rMid = rows / 2;
    const cMid = cols / 2;
    const top = r < rMid ? 0 : 2;
    const left = c < cMid ? 0 : 1;
    return top + left;
  };

  // Shuffle stage indices so each region gets a random stage (randomized layout)
  const indices = [0, 1, 2, 3];
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const region = getRegion(r, c);
      const stage = stages[indices[region]];
      const useQuote = Math.random() < 0.5;
      out[r * cols + c] = useQuote ? stage.quote : stage.name;
    }
  }

  return out;
}

// Default export for backward compat — randomized once on import
export const CREATIVITY_STAGES: CreativityStage[] = getRandomizedStages();

// Difficulty settings
export interface DifficultyConfig {
  label: string;
  description: string;
  timeLimitSeconds: number | null;
  pointMultiplier: number;
  basePoints: number;
}

export const DIFFICULTY_CONFIG: Record<string, DifficultyConfig> = {
  easy: {
    label: "Easy",
    description: "No time limit, relaxed gameplay",
    timeLimitSeconds: null,
    pointMultiplier: 1,
    basePoints: 100,
  },
  medium: {
    label: "Medium",
    description: "5 minute time limit",
    timeLimitSeconds: 300,
    pointMultiplier: 1.5,
    basePoints: 100,
  },
  hard: {
    label: "Hard",
    description: "3 minute time limit",
    timeLimitSeconds: 180,
    pointMultiplier: 2,
    basePoints: 100,
  },
  very_hard: {
    label: "Very Hard",
    description: "90 second time limit",
    timeLimitSeconds: 90,
    pointMultiplier: 3,
    basePoints: 100,
  },
};

export function generateGameCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export function calculateScore(
  difficulty: string,
  elapsedMs: number,
  incorrectAttempts: number
): number {
  const config = DIFFICULTY_CONFIG[difficulty] || DIFFICULTY_CONFIG.medium;
  const base = config.basePoints * 4; // 4 stages + 4 quotes = 8 placements
  const timePenalty = Math.floor(elapsedMs / 1000) * 2;
  const accuracyPenalty = incorrectAttempts * 25;
  const raw = Math.max(base - timePenalty - accuracyPenalty, 50);
  return Math.round(raw * config.pointMultiplier);
}

export function calculateJigsawScore(
  difficulty: string,
  elapsedMs: number,
  incorrectAttempts: number,
  totalPieces: number,
): number {
  const config = DIFFICULTY_CONFIG[difficulty] || DIFFICULTY_CONFIG.medium;
  const base = totalPieces * 40;
  const timePenalty = Math.floor(elapsedMs / 1000);
  const accuracyPenalty = incorrectAttempts * 15;
  const raw = Math.max(base - timePenalty - accuracyPenalty, 50);
  return Math.round(raw * config.pointMultiplier);
}



export const stageColors: Record<string, { bg: string; border: string; text: string }> = {
  preparation:  { bg: "bg-stage-preparation",  border: "border-stage-preparation",  text: "text-white" },
  incubation:   { bg: "bg-stage-incubation",   border: "border-stage-incubation",   text: "text-white" },
  illumination: { bg: "bg-stage-illumination", border: "border-stage-illumination", text: "text-white" },
  verification: { bg: "bg-stage-verification", border: "border-stage-verification", text: "text-white" },
};

export const stageColorMap: Record<string, string> = {
  preparation:  "border-stage-preparation  bg-stage-preparation/10  hover:bg-stage-preparation/25",
  incubation:   "border-stage-incubation   bg-stage-incubation/10   hover:bg-stage-incubation/25",
  illumination: "border-stage-illumination bg-stage-illumination/10 hover:bg-stage-illumination/25",
  verification: "border-stage-verification   bg-stage-verification/10   hover:bg-stage-verification/25",
};

export const stageSelectedMap: Record<string, string> = {
  preparation:  "border-stage-preparation  bg-stage-preparation/25  ring-stage-preparation/40",
  incubation:   "border-stage-incubation   bg-stage-incubation/25   ring-stage-incubation/40",
  illumination: "border-stage-illumination bg-stage-illumination/25 ring-stage-illumination/40",
  verification: "border-stage-verification   bg-stage-verification/25   ring-stage-verification/40",
};

export const stageIconMap: Record<string, string> = {
  preparation:  "💡",
  incubation:   "⏳",
  illumination: "✨",
  verification: "✅",
};
