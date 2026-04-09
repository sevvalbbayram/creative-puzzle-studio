import {
  Seed,
  GardenPlot,
  WaterPipe,
  Flower,
  MandalaPattern,
  GardenerPuzzleState,
  ValidationResult,
  Quote,
} from '../types/game.types';

/**
 * Gardener's Journey Puzzle Logic
 * Theme: Creativity as Organic Growth
 */

// ============================================================================
// PHASE 1: PREPARATION - Planting Seeds
// ============================================================================

/**
 * Initialize Phase 1: Create seeds and garden plots
 */
export function initializePhase1(quotes: Quote[]): GardenerPuzzleState['phase1'] {
  const seedTypes: Array<'sunflower' | 'rose' | 'tulip' | 'lavender'> = [
    'sunflower',
    'rose',
    'tulip',
    'lavender',
  ];
  const colors = ['#FCD34D', '#F472B6', '#F97316', '#C084FC'];

  const seeds: Seed[] = quotes.slice(0, 4).map((quote, index) => ({
    id: `seed-${index}`,
    quote,
    type: seedTypes[index],
    color: colors[index],
    planted: false,
  }));

  // Create 3x3 garden grid
  const plots: GardenPlot[] = [];
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      plots.push({
        id: `plot-${row}-${col}`,
        position: { row, col },
        occupied: false,
        growthStage: 0,
      });
    }
  }

  return {
    seeds,
    plots,
    plantedSeeds: 0,
  };
}

/**
 * Plant a seed in a garden plot
 */
export function plantSeed(
  state: GardenerPuzzleState['phase1'],
  seedId: string,
  plotId: string
): { newState: GardenerPuzzleState['phase1']; isValid: boolean } {
  const seed = state.seeds.find((s) => s.id === seedId);
  const plot = state.plots.find((p) => p.id === plotId);

  if (!seed || !plot || plot.occupied || seed.planted) {
    return { newState: state, isValid: false };
  }

  const newSeeds = state.seeds.map((s) =>
    s.id === seedId ? { ...s, planted: true, plotId } : s
  );

  const newPlots = state.plots.map((p) =>
    p.id === plotId ? { ...p, occupied: true, seedId, growthStage: 1 } : p
  );

  return {
    newState: {
      ...state,
      seeds: newSeeds,
      plots: newPlots,
      plantedSeeds: state.plantedSeeds + 1,
    },
    isValid: true,
  };
}

/**
 * Remove seed from plot
 */
export function removeSeed(
  state: GardenerPuzzleState['phase1'],
  plotId: string
): GardenerPuzzleState['phase1'] {
  const plot = state.plots.find((p) => p.id === plotId);
  if (!plot || !plot.seedId) return state;

  const newSeeds = state.seeds.map((s) =>
    s.id === plot.seedId ? { ...s, planted: false, plotId: undefined } : s
  );

  const newPlots = state.plots.map((p) =>
    p.id === plotId ? { ...p, occupied: false, seedId: undefined, growthStage: 0 } : p
  );

  return {
    ...state,
    seeds: newSeeds,
    plots: newPlots,
    plantedSeeds: state.plantedSeeds - 1,
  };
}

/**
 * Validate Phase 1 completion
 */
export function validatePhase1(state: GardenerPuzzleState['phase1']): ValidationResult {
  if (state.plantedSeeds < state.seeds.length) {
    return {
      isValid: false,
      message: `Plant all ${state.seeds.length} seeds (${state.plantedSeeds} planted)`,
    };
  }

  return {
    isValid: true,
    message: 'All seeds planted! Now they need water to grow...',
  };
}

// ============================================================================
// PHASE 2: INCUBATION - Water Flow Puzzle
// ============================================================================

/**
 * Initialize Phase 2: Create water pipe grid
 */
export function initializePhase2(
  plantedPlots: GardenPlot[]
): GardenerPuzzleState['phase2'] {
  // Create 5x5 grid of pipes
  const pipes: WaterPipe[] = [];
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 5; col++) {
      const pipeType = getPipeType(row, col);
      pipes.push({
        id: `pipe-${row}-${col}`,
        position: { row, col },
        type: pipeType,
        rotation: Math.floor(Math.random() * 4) * 90 as 0 | 90 | 180 | 270,
        hasWater: false,
      });
    }
  }

  return {
    pipes,
    waterSource: { row: 0, col: 0 },
    waterConnected: false,
    connectedPlots: [],
  };
}

/**
 * Determine pipe type based on position
 */
function getPipeType(row: number, col: number): WaterPipe['type'] {
  // Source is always a tee or cross
  if (row === 0 && col === 0) return 'tee';
  
  // Edges are more likely to be corners or straight
  if (row === 0 || row === 4 || col === 0 || col === 4) {
    return Math.random() > 0.5 ? 'corner' : 'straight';
  }
  
  // Center can be any type
  const types: WaterPipe['type'][] = ['straight', 'corner', 'tee', 'cross'];
  return types[Math.floor(Math.random() * types.length)];
}

/**
 * Rotate a water pipe
 */
export function rotatePipe(
  state: GardenerPuzzleState['phase2'],
  pipeId: string
): GardenerPuzzleState['phase2'] {
  const newPipes = state.pipes.map((pipe) => {
    if (pipe.id === pipeId) {
      const newRotation = ((pipe.rotation + 90) % 360) as 0 | 90 | 180 | 270;
      return { ...pipe, rotation: newRotation };
    }
    return pipe;
  });

  // Recalculate water flow
  const { connectedPipes, connectedPlots } = calculateWaterFlow(
    newPipes,
    state.waterSource
  );

  const pipesWithWater = newPipes.map((pipe) => ({
    ...pipe,
    hasWater: connectedPipes.includes(pipe.id),
  }));

  return {
    ...state,
    pipes: pipesWithWater,
    waterConnected: connectedPlots.length > 0,
    connectedPlots,
  };
}

/**
 * Calculate water flow through pipes using flood fill algorithm
 */
function calculateWaterFlow(
  pipes: WaterPipe[],
  source: { row: number; col: number }
): { connectedPipes: string[]; connectedPlots: string[] } {
  const connectedPipes: string[] = [];
  const connectedPlots: string[] = [];
  const visited = new Set<string>();

  function canFlowTo(
    from: WaterPipe,
    to: WaterPipe,
    direction: 'up' | 'down' | 'left' | 'right'
  ): boolean {
    // Check if 'from' pipe has an opening in the direction of 'to'
    const fromConnections = getPipeConnections(from);
    const toConnections = getPipeConnections(to);

    const oppositeDirection = {
      up: 'down',
      down: 'up',
      left: 'right',
      right: 'left',
    }[direction];

    return (
      fromConnections.includes(direction) &&
      toConnections.includes(oppositeDirection as any)
    );
  }

  function floodFill(row: number, col: number) {
    const key = `${row}-${col}`;
    if (visited.has(key)) return;
    visited.add(key);

    const currentPipe = pipes.find(
      (p) => p.position.row === row && p.position.col === col
    );
    if (!currentPipe) return;

    connectedPipes.push(currentPipe.id);

    // Check if this position connects to a garden plot
    // (Assuming plots are at specific positions)
    if (isPlotPosition(row, col)) {
      connectedPlots.push(`plot-${row}-${col}`);
    }

    // Try to flow in all directions
    const directions: Array<{ dir: 'up' | 'down' | 'left' | 'right'; dr: number; dc: number }> = [
      { dir: 'up', dr: -1, dc: 0 },
      { dir: 'down', dr: 1, dc: 0 },
      { dir: 'left', dr: 0, dc: -1 },
      { dir: 'right', dr: 0, dc: 1 },
    ];

    for (const { dir, dr, dc } of directions) {
      const newRow = row + dr;
      const newCol = col + dc;

      if (newRow < 0 || newRow >= 5 || newCol < 0 || newCol >= 5) continue;

      const nextPipe = pipes.find(
        (p) => p.position.row === newRow && p.position.col === newCol
      );

      if (nextPipe && canFlowTo(currentPipe, nextPipe, dir)) {
        floodFill(newRow, newCol);
      }
    }
  }

  floodFill(source.row, source.col);

  return { connectedPipes, connectedPlots };
}

/**
 * Get pipe connections based on type and rotation
 */
function getPipeConnections(pipe: WaterPipe): Array<'up' | 'down' | 'left' | 'right'> {
  const baseConnections: Record<WaterPipe['type'], Array<'up' | 'down' | 'left' | 'right'>> = {
    straight: ['up', 'down'],
    corner: ['up', 'right'],
    tee: ['up', 'left', 'right'],
    cross: ['up', 'down', 'left', 'right'],
  };

  const connections = baseConnections[pipe.type];
  
  // Rotate connections based on pipe rotation
  const rotations = pipe.rotation / 90;
  let rotated = [...connections];
  
  for (let i = 0; i < rotations; i++) {
    rotated = rotated.map((dir) => {
      const map: Record<string, 'up' | 'down' | 'left' | 'right'> = {
        up: 'right',
        right: 'down',
        down: 'left',
        left: 'up',
      };
      return map[dir];
    });
  }

  return rotated;
}

/**
 * Check if position has a garden plot
 */
function isPlotPosition(row: number, col: number): boolean {
  // Assuming plots are at specific positions in the 5x5 grid
  const plotPositions = [
    { row: 1, col: 1 },
    { row: 1, col: 3 },
    { row: 3, col: 1 },
    { row: 3, col: 3 },
  ];
  return plotPositions.some((p) => p.row === row && p.col === col);
}

/**
 * Validate Phase 2 completion
 */
export function validatePhase2(state: GardenerPuzzleState['phase2']): ValidationResult {
  const requiredPlots = 4; // Number of planted seeds

  if (state.connectedPlots.length < requiredPlots) {
    return {
      isValid: false,
      message: `Water connected to ${state.connectedPlots.length} of ${requiredPlots} plants`,
    };
  }

  return {
    isValid: true,
    message: 'All plants are watered! Watch them grow...',
  };
}

// ============================================================================
// PHASE 3: ILLUMINATION - Blooming Sequence
// ============================================================================

/**
 * Initialize Phase 3: Blooming animation
 */
export function initializePhase3(seeds: Seed[]): GardenerPuzzleState['phase3'] {
  const flowers: Flower[] = seeds.map((seed) => ({
    id: `flower-${seed.id}`,
    seedId: seed.id,
    type: seed.type,
    color: seed.color,
  }));

  const bloomSequence = flowers.map((f) => f.id);

  return {
    bloomingFlowers: flowers,
    bloomSequence,
    currentBloomIndex: 0,
  };
}

/**
 * Advance bloom animation
 */
export function advanceBloom(
  state: GardenerPuzzleState['phase3']
): GardenerPuzzleState['phase3'] {
  if (state.currentBloomIndex >= state.bloomSequence.length) {
    return state;
  }

  return {
    ...state,
    currentBloomIndex: state.currentBloomIndex + 1,
  };
}

/**
 * Validate Phase 3 completion
 */
export function validatePhase3(state: GardenerPuzzleState['phase3']): ValidationResult {
  if (state.currentBloomIndex < state.bloomSequence.length) {
    return {
      isValid: false,
      message: `${state.currentBloomIndex} of ${state.bloomSequence.length} flowers bloomed`,
    };
  }

  return {
    isValid: true,
    message: 'All flowers have bloomed! Now arrange them into a beautiful pattern...',
  };
}

// ============================================================================
// PHASE 4: VERIFICATION - Mandala Arrangement
// ============================================================================

/**
 * Initialize Phase 4: Mandala puzzle
 */
export function initializePhase4(flowers: Flower[]): GardenerPuzzleState['phase4'] {
  const mandalaPattern: MandalaPattern = {
    rings: 2,
    flowersPerRing: [4, 4], // Inner ring: 4, Outer ring: 4
    colorPattern: [
      ['#FCD34D', '#F472B6', '#F97316', '#C084FC'], // Inner ring
      ['#F472B6', '#FCD34D', '#C084FC', '#F97316'], // Outer ring
    ],
  };

  return {
    flowers: flowers.map((f) => ({ ...f, position: undefined })),
    mandalaPattern,
    placedFlowers: 0,
    patternMatched: false,
  };
}

/**
 * Place flower in mandala
 */
export function placeFlower(
  state: GardenerPuzzleState['phase4'],
  flowerId: string,
  position: { x: number; y: number }
): GardenerPuzzleState['phase4'] {
  const newFlowers = state.flowers.map((f) =>
    f.id === flowerId ? { ...f, position } : f
  );

  const placedFlowers = newFlowers.filter((f) => f.position !== undefined).length;
  const patternMatched = checkMandalaPattern(newFlowers, state.mandalaPattern);

  return {
    ...state,
    flowers: newFlowers,
    placedFlowers,
    patternMatched,
  };
}

/**
 * Check if flowers match the mandala pattern
 */
function checkMandalaPattern(flowers: Flower[], pattern: MandalaPattern): boolean {
  const placedFlowers = flowers.filter((f) => f.position !== undefined);

  if (placedFlowers.length !== flowers.length) return false;

  // Calculate which ring each flower belongs to based on distance from center
  const center = { x: 400, y: 400 }; // Assuming 800x800 canvas
  const ringRadii = [100, 200]; // Inner and outer ring radii

  for (let ringIndex = 0; ringIndex < pattern.rings; ringIndex++) {
    const flowersInRing = placedFlowers.filter((f) => {
      if (!f.position) return false;
      const distance = Math.sqrt(
        Math.pow(f.position.x - center.x, 2) + Math.pow(f.position.y - center.y, 2)
      );
      const radius = ringRadii[ringIndex];
      return Math.abs(distance - radius) < 30; // 30px tolerance
    });

    if (flowersInRing.length !== pattern.flowersPerRing[ringIndex]) return false;

    // Check color pattern
    const sortedByAngle = flowersInRing.sort((a, b) => {
      const angleA = Math.atan2(a.position!.y - center.y, a.position!.x - center.x);
      const angleB = Math.atan2(b.position!.y - center.y, b.position!.x - center.x);
      return angleA - angleB;
    });

    for (let i = 0; i < sortedByAngle.length; i++) {
      if (sortedByAngle[i].color !== pattern.colorPattern[ringIndex][i]) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Validate Phase 4 completion
 */
export function validatePhase4(state: GardenerPuzzleState['phase4']): ValidationResult {
  if (!state.patternMatched) {
    return {
      isValid: false,
      message: `${state.placedFlowers} flowers placed. Arrange them in the correct pattern.`,
    };
  }

  return {
    isValid: true,
    message: 'Perfect harmony! Your creative garden is complete!',
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get hint for current phase
 */
export function getHint(phase: 1 | 2 | 3 | 4, state: GardenerPuzzleState): string {
  switch (phase) {
    case 1:
      return 'Drag each seed to an empty garden plot. Each seed represents a creative idea waiting to grow.';
    case 2:
      return 'Rotate the pipes to create a path from the water source to all planted seeds.';
    case 3:
      return 'Watch as your ideas bloom into beautiful flowers, each representing a developed concept.';
    case 4:
      return 'Arrange the flowers in concentric circles, following the color pattern shown in the guide.';
    default:
      return 'Continue nurturing your creative garden.';
  }
}

/**
 * Calculate completion percentage
 */
export function calculateProgress(state: GardenerPuzzleState): number {
  let progress = 0;

  if (validatePhase1(state.phase1).isValid) progress += 25;
  if (validatePhase2(state.phase2).isValid) progress += 25;
  if (validatePhase3(state.phase3).isValid) progress += 25;
  if (validatePhase4(state.phase4).isValid) progress += 25;

  return progress;
}

/**
 * Reset puzzle to initial state
 */
export function resetGardenerPuzzle(quotes: Quote[]): GardenerPuzzleState {
  const phase1 = initializePhase1(quotes);
  
  return {
    isComplete: false,
    startTime: new Date(),
    attempts: 0,
    hintsUsed: 0,
    phase1,
    phase2: initializePhase2(phase1.plots),
    phase3: initializePhase3(phase1.seeds),
    phase4: initializePhase4([]),
  };
}
