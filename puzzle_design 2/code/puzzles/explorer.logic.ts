import {
  MapFragment,
  MapTile,
  Riddle,
  ExplorerPuzzleState,
  ValidationResult,
  Quote,
} from '../types/game.types';

/**
 * Explorer's Map Puzzle Logic
 * Theme: Creativity as Discovery
 */

// ============================================================================
// PHASE 1: PREPARATION - Map Assembly (Jigsaw Puzzle)
// ============================================================================

/**
 * Initialize Phase 1: Create map fragments
 */
export function initializePhase1(quotes: Quote[]): ExplorerPuzzleState['phase1'] {
  // Create 3x3 grid of map fragments
  const fragments: MapFragment[] = [];
  
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      const index = row * 3 + col;
      const quote = quotes[index % quotes.length];
      
      fragments.push({
        id: `fragment-${row}-${col}`,
        quote,
        position: {
          x: Math.random() * 600 + 100, // Random initial position
          y: Math.random() * 400 + 100,
        },
        correctPosition: {
          x: col * 200 + 100, // Grid position
          y: row * 200 + 100,
        },
        placed: false,
        edges: generateEdges(row, col),
      });
    }
  }

  return {
    fragments,
    placedFragments: 0,
    mapComplete: false,
  };
}

/**
 * Generate edge patterns for puzzle pieces
 */
function generateEdges(row: number, col: number): MapFragment['edges'] {
  // Simple edge pattern generation
  // In production, you'd use more sophisticated jigsaw patterns
  const patterns = ['flat', 'in', 'out'];
  
  return {
    top: row === 0 ? 'flat' : patterns[Math.floor(Math.random() * 2) + 1],
    right: col === 2 ? 'flat' : patterns[Math.floor(Math.random() * 2) + 1],
    bottom: row === 2 ? 'flat' : patterns[Math.floor(Math.random() * 2) + 1],
    left: col === 0 ? 'flat' : patterns[Math.floor(Math.random() * 2) + 1],
  };
}

/**
 * Move map fragment
 */
export function moveFragment(
  state: ExplorerPuzzleState['phase1'],
  fragmentId: string,
  newPosition: { x: number; y: number }
): ExplorerPuzzleState['phase1'] {
  const fragment = state.fragments.find((f) => f.id === fragmentId);
  if (!fragment) return state;

  const snapThreshold = 30; // Pixels
  const isNearCorrectPosition =
    Math.abs(newPosition.x - fragment.correctPosition.x) < snapThreshold &&
    Math.abs(newPosition.y - fragment.correctPosition.y) < snapThreshold;

  const finalPosition = isNearCorrectPosition
    ? fragment.correctPosition
    : newPosition;

  const newFragments = state.fragments.map((f) =>
    f.id === fragmentId
      ? { ...f, position: finalPosition, placed: isNearCorrectPosition }
      : f
  );

  const placedFragments = newFragments.filter((f) => f.placed).length;
  const mapComplete = placedFragments === newFragments.length;

  return {
    ...state,
    fragments: newFragments,
    placedFragments,
    mapComplete,
  };
}

/**
 * Check if two fragments can connect
 */
export function canConnect(fragment1: MapFragment, fragment2: MapFragment): boolean {
  // Check if fragments are adjacent
  const dx = Math.abs(fragment1.correctPosition.x - fragment2.correctPosition.x);
  const dy = Math.abs(fragment1.correctPosition.y - fragment2.correctPosition.y);

  if (dx === 200 && dy === 0) {
    // Horizontal neighbors
    if (fragment1.correctPosition.x < fragment2.correctPosition.x) {
      return fragment1.edges.right !== fragment2.edges.left;
    } else {
      return fragment2.edges.right !== fragment1.edges.left;
    }
  } else if (dx === 0 && dy === 200) {
    // Vertical neighbors
    if (fragment1.correctPosition.y < fragment2.correctPosition.y) {
      return fragment1.edges.bottom !== fragment2.edges.top;
    } else {
      return fragment2.edges.bottom !== fragment1.edges.top;
    }
  }

  return false;
}

/**
 * Validate Phase 1 completion
 */
export function validatePhase1(state: ExplorerPuzzleState['phase1']): ValidationResult {
  if (!state.mapComplete) {
    return {
      isValid: false,
      message: `${state.placedFragments} of ${state.fragments.length} fragments placed`,
    };
  }

  return {
    isValid: true,
    message: 'Map assembled! Now navigate through the fog to find the treasure...',
  };
}

// ============================================================================
// PHASE 2: INCUBATION - Fog Navigation (Pathfinding)
// ============================================================================

/**
 * Initialize Phase 2: Create map grid with fog
 */
export function initializePhase2(): ExplorerPuzzleState['phase2'] {
  const gridSize = 8;
  const tiles: MapTile[] = [];

  // Generate random map
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      const type: MapTile['type'] = 
        Math.random() > 0.7 ? 'ocean' : 
        Math.random() > 0.5 ? 'path' : 'land';

      tiles.push({
        id: `tile-${row}-${col}`,
        position: { row, col },
        type,
        foggy: true,
        visited: false,
      });
    }
  }

  // Set start and treasure positions
  const playerPosition = { row: 0, col: 0 };
  const treasurePosition = { row: gridSize - 1, col: gridSize - 1 };

  // Make sure start tile is land
  const startTile = tiles.find(
    (t) => t.position.row === 0 && t.position.col === 0
  );
  if (startTile) {
    startTile.type = 'land';
    startTile.foggy = false;
    startTile.visited = true;
  }

  // Make sure treasure tile is land
  const treasureTile = tiles.find(
    (t) => t.position.row === treasurePosition.row && 
           t.position.col === treasurePosition.col
  );
  if (treasureTile) {
    treasureTile.type = 'treasure';
  }

  return {
    tiles,
    playerPosition,
    treasurePosition,
    pathTaken: [playerPosition],
    treasureFound: false,
  };
}

/**
 * Move player on the map
 */
export function movePlayer(
  state: ExplorerPuzzleState['phase2'],
  direction: 'up' | 'down' | 'left' | 'right'
): { newState: ExplorerPuzzleState['phase2']; isValid: boolean } {
  const { row, col } = state.playerPosition;
  
  const newPosition = {
    up: { row: row - 1, col },
    down: { row: row + 1, col },
    left: { row, col: col - 1 },
    right: { row, col: col + 1 },
  }[direction];

  // Check bounds
  const gridSize = 8;
  if (
    newPosition.row < 0 ||
    newPosition.row >= gridSize ||
    newPosition.col < 0 ||
    newPosition.col >= gridSize
  ) {
    return { newState: state, isValid: false };
  }

  // Check if tile is traversable
  const targetTile = state.tiles.find(
    (t) => t.position.row === newPosition.row && t.position.col === newPosition.col
  );

  if (!targetTile || targetTile.type === 'ocean') {
    return { newState: state, isValid: false };
  }

  // Reveal surrounding tiles
  const newTiles = state.tiles.map((tile) => {
    const distance = Math.abs(tile.position.row - newPosition.row) +
                    Math.abs(tile.position.col - newPosition.col);
    
    if (distance <= 1) {
      return { ...tile, foggy: false };
    }
    
    if (tile.position.row === newPosition.row && 
        tile.position.col === newPosition.col) {
      return { ...tile, visited: true };
    }
    
    return tile;
  });

  const treasureFound =
    newPosition.row === state.treasurePosition.row &&
    newPosition.col === state.treasurePosition.col;

  return {
    newState: {
      ...state,
      tiles: newTiles,
      playerPosition: newPosition,
      pathTaken: [...state.pathTaken, newPosition],
      treasureFound,
    },
    isValid: true,
  };
}

/**
 * Get available moves from current position
 */
export function getAvailableMoves(
  state: ExplorerPuzzleState['phase2']
): Array<'up' | 'down' | 'left' | 'right'> {
  const directions: Array<'up' | 'down' | 'left' | 'right'> = ['up', 'down', 'left', 'right'];
  const available: Array<'up' | 'down' | 'left' | 'right'> = [];

  for (const direction of directions) {
    const result = movePlayer(state, direction);
    if (result.isValid) {
      available.push(direction);
    }
  }

  return available;
}

/**
 * Validate Phase 2 completion
 */
export function validatePhase2(state: ExplorerPuzzleState['phase2']): ValidationResult {
  if (!state.treasureFound) {
    return {
      isValid: false,
      message: 'Navigate through the fog to find the treasure',
    };
  }

  return {
    isValid: true,
    message: 'Treasure found! Watch as it reveals itself...',
  };
}

// ============================================================================
// PHASE 3: ILLUMINATION - Treasure Revelation
// ============================================================================

/**
 * Initialize Phase 3: Treasure reveal animation
 */
export function initializePhase3(): ExplorerPuzzleState['phase3'] {
  return {
    treasureRevealed: false,
    animationComplete: false,
  };
}

/**
 * Trigger treasure revelation
 */
export function revealTreasure(
  state: ExplorerPuzzleState['phase3']
): ExplorerPuzzleState['phase3'] {
  return {
    ...state,
    treasureRevealed: true,
  };
}

/**
 * Complete revelation animation
 */
export function completeRevealAnimation(
  state: ExplorerPuzzleState['phase3']
): ExplorerPuzzleState['phase3'] {
  return {
    ...state,
    animationComplete: true,
  };
}

/**
 * Validate Phase 3 completion
 */
export function validatePhase3(state: ExplorerPuzzleState['phase3']): ValidationResult {
  if (!state.treasureRevealed || !state.animationComplete) {
    return {
      isValid: false,
      message: 'Watch the treasure reveal itself...',
    };
  }

  return {
    isValid: true,
    message: 'The treasure is revealed! Now solve its riddle to claim it...',
  };
}

// ============================================================================
// PHASE 4: VERIFICATION - Riddle Solving
// ============================================================================

/**
 * Initialize Phase 4: Riddle puzzle
 */
export function initializePhase4(quotes: Quote[]): ExplorerPuzzleState['phase4'] {
  const riddle: Riddle = {
    id: 'riddle-1',
    question: 'What is the beginning of creativity?',
    options: [
      'Preparation - gathering knowledge and inspiration',
      'Illumination - the sudden flash of insight',
      'Verification - testing and refining ideas',
      'Incubation - letting ideas develop subconsciously',
    ],
    correctAnswer: 0, // Preparation
    hint: 'Think about the four phases you\'ve experienced in this journey.',
  };

  return {
    riddle,
    answered: false,
    correct: false,
  };
}

/**
 * Submit answer to riddle
 */
export function submitAnswer(
  state: ExplorerPuzzleState['phase4'],
  answerIndex: number
): ExplorerPuzzleState['phase4'] {
  const correct = answerIndex === state.riddle.correctAnswer;

  return {
    ...state,
    selectedAnswer: answerIndex,
    answered: true,
    correct,
  };
}

/**
 * Get riddle hint
 */
export function getRiddleHint(state: ExplorerPuzzleState['phase4']): string {
  return state.riddle.hint || 'Think carefully about what you\'ve learned.';
}

/**
 * Validate Phase 4 completion
 */
export function validatePhase4(state: ExplorerPuzzleState['phase4']): ValidationResult {
  if (!state.answered) {
    return {
      isValid: false,
      message: 'Answer the riddle to unlock the treasure',
    };
  }

  if (!state.correct) {
    return {
      isValid: false,
      message: 'That\'s not quite right. Try again!',
    };
  }

  return {
    isValid: true,
    message: 'Correct! You have unlocked the treasure of creative discovery!',
  };
}

// ============================================================================
// COMPLETE PUZZLE VALIDATION
// ============================================================================

/**
 * Validate entire Explorer puzzle completion
 */
export function validateExplorerPuzzle(state: ExplorerPuzzleState): ValidationResult {
  const phase1Valid = validatePhase1(state.phase1);
  const phase2Valid = validatePhase2(state.phase2);
  const phase3Valid = validatePhase3(state.phase3);
  const phase4Valid = validatePhase4(state.phase4);

  if (!phase1Valid.isValid) return phase1Valid;
  if (!phase2Valid.isValid) return phase2Valid;
  if (!phase3Valid.isValid) return phase3Valid;
  if (!phase4Valid.isValid) return phase4Valid;

  return {
    isValid: true,
    message: 'Congratulations! You have completed the journey of creative discovery!',
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get hint for current phase
 */
export function getHint(phase: 1 | 2 | 3 | 4, state: ExplorerPuzzleState): string {
  switch (phase) {
    case 1:
      return 'Drag the map fragments to assemble the complete map. Look for matching edges.';
    case 2:
      return `You've explored ${state.phase2.pathTaken.length} tiles. Keep navigating to find the treasure!`;
    case 3:
      return 'Watch as the fog clears and the treasure reveals its secrets.';
    case 4:
      return state.phase4.riddle.hint || 'Think about the creative journey you\'ve taken.';
    default:
      return 'Continue your exploration.';
  }
}

/**
 * Calculate completion percentage
 */
export function calculateProgress(state: ExplorerPuzzleState): number {
  let progress = 0;

  if (validatePhase1(state.phase1).isValid) progress += 25;
  if (validatePhase2(state.phase2).isValid) progress += 25;
  if (validatePhase3(state.phase3).isValid) progress += 25;
  if (validatePhase4(state.phase4).isValid) progress += 25;

  return progress;
}

/**
 * Generate optimal path hint (A* pathfinding)
 */
export function getPathHint(state: ExplorerPuzzleState['phase2']): string {
  // Simplified hint - in production, implement A* algorithm
  const dx = state.treasurePosition.col - state.playerPosition.col;
  const dy = state.treasurePosition.row - state.playerPosition.row;

  if (Math.abs(dx) > Math.abs(dy)) {
    return dx > 0 ? 'Try moving right' : 'Try moving left';
  } else {
    return dy > 0 ? 'Try moving down' : 'Try moving up';
  }
}

/**
 * Reset puzzle to initial state
 */
export function resetExplorerPuzzle(quotes: Quote[]): ExplorerPuzzleState {
  return {
    isComplete: false,
    startTime: new Date(),
    attempts: 0,
    hintsUsed: 0,
    phase1: initializePhase1(quotes),
    phase2: initializePhase2(),
    phase3: initializePhase3(),
    phase4: initializePhase4(quotes),
  };
}

/**
 * Calculate exploration percentage
 */
export function calculateExplorationPercentage(state: ExplorerPuzzleState['phase2']): number {
  const totalTiles = state.tiles.length;
  const exploredTiles = state.tiles.filter((t) => !t.foggy).length;
  return Math.round((exploredTiles / totalTiles) * 100);
}
