// Core Game Types

export type WorldType = 'hub' | 'alchemist' | 'gardener' | 'explorer';
export type PhaseType = 1 | 2 | 3 | 4;

export interface Quote {
  id: string;
  text: string;
  author: string;
  phase: PhaseType;
  world: WorldType;
  category?: string;
}

export interface Player {
  id: string;
  name: string;
  level: number;
  experience: number;
  avatar?: string;
}

export interface WorldProgress {
  worldId: WorldType;
  currentPhase: PhaseType;
  completedPhases: PhaseType[];
  completionPercentage: number;
  lastPlayed?: Date;
  timeSpent: number; // in seconds
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: Date;
  world?: WorldType;
}

export interface GameState {
  player: Player;
  currentWorld: WorldType;
  currentPhase: PhaseType;
  worldProgress: Record<WorldType, WorldProgress>;
  collectedQuotes: Quote[];
  achievements: Achievement[];
  settings: GameSettings;
}

export interface GameSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
  language: string;
}

// Puzzle-Specific Types

export interface PuzzleState {
  isComplete: boolean;
  startTime: Date;
  endTime?: Date;
  attempts: number;
  hintsUsed: number;
}

// Alchemist's Workshop Types

export interface Crystal {
  id: string;
  quote: Quote;
  element: 'fire' | 'water' | 'earth' | 'air';
  color: 'purple' | 'blue' | 'green' | 'gold';
  position?: { x: number; y: number };
}

export interface AstrolabeSlot {
  id: string;
  element: 'fire' | 'water' | 'earth' | 'air';
  angle: number; // 0-360 degrees
  filled: boolean;
  crystalId?: string;
}

export interface CelestialRing {
  id: string;
  radius: number;
  rotation: number; // 0-360 degrees
  symbols: string[];
  correctRotation: number;
}

export interface AlchemistPuzzleState extends PuzzleState {
  phase1: {
    crystals: Crystal[];
    slots: AstrolabeSlot[];
    placedCrystals: number;
  };
  phase2: {
    rings: CelestialRing[];
    alignedRings: number;
  };
  phase3: {
    stoneRevealed: boolean;
    animationComplete: boolean;
  };
  phase4: {
    objects: ShadowObject[];
    targetSilhouette: string;
    currentSilhouette: string;
    matched: boolean;
  };
}

export interface ShadowObject {
  id: string;
  type: string;
  position: { x: number; y: number };
  rotation: number;
  scale: number;
}

// Gardener's Journey Types

export interface Seed {
  id: string;
  quote: Quote;
  type: 'sunflower' | 'rose' | 'tulip' | 'lavender';
  color: string;
  planted: boolean;
  plotId?: string;
}

export interface GardenPlot {
  id: string;
  position: { row: number; col: number };
  occupied: boolean;
  seedId?: string;
  growthStage: 0 | 1 | 2 | 3 | 4; // 0: empty, 1-3: growing, 4: bloomed
}

export interface WaterPipe {
  id: string;
  position: { row: number; col: number };
  type: 'straight' | 'corner' | 'tee' | 'cross';
  rotation: 0 | 90 | 180 | 270;
  hasWater: boolean;
}

export interface Flower {
  id: string;
  seedId: string;
  type: string;
  color: string;
  position?: { x: number; y: number }; // for mandala
}

export interface GardenerPuzzleState extends PuzzleState {
  phase1: {
    seeds: Seed[];
    plots: GardenPlot[];
    plantedSeeds: number;
  };
  phase2: {
    pipes: WaterPipe[];
    waterSource: { row: number; col: number };
    waterConnected: boolean;
    connectedPlots: string[];
  };
  phase3: {
    bloomingFlowers: Flower[];
    bloomSequence: string[];
    currentBloomIndex: number;
  };
  phase4: {
    flowers: Flower[];
    mandalaPattern: MandalaPattern;
    placedFlowers: number;
    patternMatched: boolean;
  };
}

export interface MandalaPattern {
  rings: number;
  flowersPerRing: number[];
  colorPattern: string[][];
}

// Explorer's Map Types

export interface MapFragment {
  id: string;
  quote: Quote;
  position: { x: number; y: number };
  correctPosition: { x: number; y: number };
  placed: boolean;
  edges: {
    top: string;
    right: string;
    bottom: string;
    left: string;
  };
}

export interface MapTile {
  id: string;
  position: { row: number; col: number };
  type: 'land' | 'ocean' | 'treasure' | 'path';
  foggy: boolean;
  visited: boolean;
}

export interface Riddle {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  hint?: string;
}

export interface ExplorerPuzzleState extends PuzzleState {
  phase1: {
    fragments: MapFragment[];
    placedFragments: number;
    mapComplete: boolean;
  };
  phase2: {
    tiles: MapTile[];
    playerPosition: { row: number; col: number };
    treasurePosition: { row: number; col: number };
    pathTaken: { row: number; col: number }[];
    treasureFound: boolean;
  };
  phase3: {
    treasureRevealed: boolean;
    animationComplete: boolean;
  };
  phase4: {
    riddle: Riddle;
    selectedAnswer?: number;
    answered: boolean;
    correct: boolean;
  };
}

// Action Types for State Management

export type GameAction =
  | { type: 'SET_WORLD'; payload: WorldType }
  | { type: 'SET_PHASE'; payload: PhaseType }
  | { type: 'COMPLETE_PHASE'; payload: { world: WorldType; phase: PhaseType } }
  | { type: 'ADD_QUOTE'; payload: Quote }
  | { type: 'UNLOCK_ACHIEVEMENT'; payload: Achievement }
  | { type: 'UPDATE_PROGRESS'; payload: { world: WorldType; progress: Partial<WorldProgress> } }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<GameSettings> };

// Validation Types

export interface ValidationResult {
  isValid: boolean;
  message?: string;
  errors?: string[];
}

// Animation Types

export interface AnimationConfig {
  duration: number;
  easing: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
  delay?: number;
}

// Sound Types

export type SoundEffect =
  | 'click'
  | 'success'
  | 'error'
  | 'place'
  | 'rotate'
  | 'bloom'
  | 'reveal'
  | 'achievement';

export interface SoundConfig {
  effect: SoundEffect;
  volume: number;
  loop?: boolean;
}
