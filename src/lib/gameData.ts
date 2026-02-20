// The 5 stages of creativity and their matching quotes
export interface CreativityStage {
  id: string;
  name: string;
  quote: string;
  color: string; // HSL token name
}

export const CREATIVITY_STAGES: CreativityStage[] = [
  {
    id: "preparation",
    name: "Preparation",
    quote: "Creativity requires the courage to let go of certainties.",
    color: "stage-preparation",
  },
  {
    id: "incubation",
    name: "Incubation",
    quote: "Almost all really new ideas have a certain aspect of foolishness when they are first produced.",
    color: "stage-incubation",
  },
  {
    id: "illumination",
    name: "Illumination",
    quote: "The moment of enlightenment is when a person's dreams of possibilities become images of probabilities.",
    color: "stage-illumination",
  },
  {
    id: "evaluation",
    name: "Evaluation",
    quote: "To live a creative life, we must lose our fear of being wrong.",
    color: "stage-evaluation",
  },
  {
    id: "elaboration",
    name: "Elaboration",
    quote: "Creativity is 1% inspiration and 99% perspiration.",
    color: "stage-elaboration",
  },
];

// Difficulty settings
export interface DifficultyConfig {
  label: string;
  description: string;
  timeLimitSeconds: number | null; // null = no limit
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

// Generate a random 6-character game code
export function generateGameCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// Calculate score based on difficulty, time, and accuracy
export function calculateScore(
  difficulty: string,
  elapsedMs: number,
  incorrectAttempts: number
): number {
  const config = DIFFICULTY_CONFIG[difficulty] || DIFFICULTY_CONFIG.medium;
  const base = config.basePoints * 5; // 5 stages + 5 quotes = 10 placements
  const timePenalty = Math.floor(elapsedMs / 1000) * 2;
  const accuracyPenalty = incorrectAttempts * 25;
  const raw = Math.max(base - timePenalty - accuracyPenalty, 50);
  return Math.round(raw * config.pointMultiplier);
}
