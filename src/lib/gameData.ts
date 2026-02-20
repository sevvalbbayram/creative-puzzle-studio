// The 4 pillars of creativity and their matching quotes
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
      "The value of an idea lies in the using of it.",
      "Great ideas need great execution to become reality.",
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
