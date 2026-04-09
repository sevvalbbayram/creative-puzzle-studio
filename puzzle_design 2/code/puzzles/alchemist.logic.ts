import {
  Crystal,
  AstrolabeSlot,
  CelestialRing,
  ShadowObject,
  AlchemistPuzzleState,
  ValidationResult,
  Quote,
} from '../types/game.types';

/**
 * Alchemist's Workshop Puzzle Logic
 * Theme: Creativity as Transformation
 */

// ============================================================================
// PHASE 1: PREPARATION - Elemental Alignment
// ============================================================================

/**
 * Initialize Phase 1: Create crystals and astrolabe slots
 */
export function initializePhase1(quotes: Quote[]): AlchemistPuzzleState['phase1'] {
  const elements: Array<'fire' | 'water' | 'earth' | 'air'> = ['fire', 'water', 'earth', 'air'];
  const colors: Array<'purple' | 'blue' | 'green' | 'gold'> = ['purple', 'blue', 'green', 'gold'];

  const crystals: Crystal[] = quotes.slice(0, 4).map((quote, index) => ({
    id: `crystal-${index}`,
    quote,
    element: elements[index],
    color: colors[index],
    position: {
      x: 100 + index * 200,
      y: 100,
    },
  }));

  const slots: AstrolabeSlot[] = elements.map((element, index) => ({
    id: `slot-${index}`,
    element,
    angle: index * 90, // 0, 90, 180, 270 degrees
    filled: false,
  }));

  return {
    crystals,
    slots,
    placedCrystals: 0,
  };
}

/**
 * Handle crystal placement in astrolabe slot
 */
export function placeCrystal(
  state: AlchemistPuzzleState['phase1'],
  crystalId: string,
  slotId: string
): { newState: AlchemistPuzzleState['phase1']; isValid: boolean } {
  const crystal = state.crystals.find((c) => c.id === crystalId);
  const slot = state.slots.find((s) => s.id === slotId);

  if (!crystal || !slot) {
    return { newState: state, isValid: false };
  }

  // Check if crystal element matches slot element
  const isValid = crystal.element === slot.element;

  if (isValid) {
    const newSlots = state.slots.map((s) =>
      s.id === slotId ? { ...s, filled: true, crystalId } : s
    );

    return {
      newState: {
        ...state,
        slots: newSlots,
        placedCrystals: state.placedCrystals + 1,
      },
      isValid: true,
    };
  }

  return { newState: state, isValid: false };
}

/**
 * Validate Phase 1 completion
 */
export function validatePhase1(state: AlchemistPuzzleState['phase1']): ValidationResult {
  const allSlotsFilled = state.slots.every((slot) => slot.filled);

  if (!allSlotsFilled) {
    return {
      isValid: false,
      message: 'Place all crystals in their matching elemental slots',
    };
  }

  // Verify correct placements
  const correctPlacements = state.slots.every((slot) => {
    const crystal = state.crystals.find((c) => c.id === slot.crystalId);
    return crystal && crystal.element === slot.element;
  });

  if (!correctPlacements) {
    return {
      isValid: false,
      message: 'Some crystals are in incorrect slots',
    };
  }

  return {
    isValid: true,
    message: 'All crystals aligned! The astrolabe awakens...',
  };
}

// ============================================================================
// PHASE 2: INCUBATION - Celestial Ring Rotation
// ============================================================================

/**
 * Initialize Phase 2: Create celestial rings
 */
export function initializePhase2(): AlchemistPuzzleState['phase2'] {
  const rings: CelestialRing[] = [
    {
      id: 'ring-outer',
      radius: 200,
      rotation: 0,
      symbols: ['☉', '☽', '★', '✦'],
      correctRotation: 90,
    },
    {
      id: 'ring-middle',
      radius: 150,
      rotation: 0,
      symbols: ['◆', '◇', '●', '○'],
      correctRotation: 180,
    },
    {
      id: 'ring-inner',
      radius: 100,
      rotation: 0,
      symbols: ['▲', '▼', '◄', '►'],
      correctRotation: 270,
    },
  ];

  return {
    rings,
    alignedRings: 0,
  };
}

/**
 * Rotate a celestial ring
 */
export function rotateRing(
  state: AlchemistPuzzleState['phase2'],
  ringId: string,
  degrees: number
): AlchemistPuzzleState['phase2'] {
  const newRings = state.rings.map((ring) => {
    if (ring.id === ringId) {
      const newRotation = (ring.rotation + degrees) % 360;
      return { ...ring, rotation: newRotation };
    }
    return ring;
  });

  const alignedRings = newRings.filter(
    (ring) => Math.abs(ring.rotation - ring.correctRotation) < 5
  ).length;

  return {
    rings: newRings,
    alignedRings,
  };
}

/**
 * Validate Phase 2 completion
 */
export function validatePhase2(state: AlchemistPuzzleState['phase2']): ValidationResult {
  const allAligned = state.rings.every(
    (ring) => Math.abs(ring.rotation - ring.correctRotation) < 5
  );

  if (!allAligned) {
    return {
      isValid: false,
      message: `${state.alignedRings} of ${state.rings.length} rings aligned`,
    };
  }

  return {
    isValid: true,
    message: 'Perfect alignment! The transformation begins...',
  };
}

// ============================================================================
// PHASE 3: ILLUMINATION - Philosopher's Stone Revelation
// ============================================================================

/**
 * Initialize Phase 3: Stone revelation (passive animation)
 */
export function initializePhase3(): AlchemistPuzzleState['phase3'] {
  return {
    stoneRevealed: false,
    animationComplete: false,
  };
}

/**
 * Trigger stone revelation animation
 */
export function revealPhilosophersStone(
  state: AlchemistPuzzleState['phase3']
): AlchemistPuzzleState['phase3'] {
  return {
    ...state,
    stoneRevealed: true,
  };
}

/**
 * Mark animation as complete
 */
export function completeRevealAnimation(
  state: AlchemistPuzzleState['phase3']
): AlchemistPuzzleState['phase3'] {
  return {
    ...state,
    animationComplete: true,
  };
}

/**
 * Validate Phase 3 completion
 */
export function validatePhase3(state: AlchemistPuzzleState['phase3']): ValidationResult {
  if (!state.stoneRevealed || !state.animationComplete) {
    return {
      isValid: false,
      message: 'Watch the stone reveal itself...',
    };
  }

  return {
    isValid: true,
    message: 'The Philosopher\'s Stone is active! Use its light to verify your creation.',
  };
}

// ============================================================================
// PHASE 4: VERIFICATION - Shadow Puppet Puzzle
// ============================================================================

/**
 * Initialize Phase 4: Shadow puzzle
 */
export function initializePhase4(): AlchemistPuzzleState['phase4'] {
  const objects: ShadowObject[] = [
    {
      id: 'obj-1',
      type: 'circle',
      position: { x: 100, y: 100 },
      rotation: 0,
      scale: 1,
    },
    {
      id: 'obj-2',
      type: 'triangle',
      position: { x: 200, y: 100 },
      rotation: 0,
      scale: 1,
    },
    {
      id: 'obj-3',
      type: 'square',
      position: { x: 300, y: 100 },
      rotation: 0,
      scale: 1,
    },
  ];

  return {
    objects,
    targetSilhouette: 'lightbulb', // Creative idea symbol
    currentSilhouette: '',
    matched: false,
  };
}

/**
 * Move shadow object
 */
export function moveShadowObject(
  state: AlchemistPuzzleState['phase4'],
  objectId: string,
  newPosition: { x: number; y: number }
): AlchemistPuzzleState['phase4'] {
  const newObjects = state.objects.map((obj) =>
    obj.id === objectId ? { ...obj, position: newPosition } : obj
  );

  const currentSilhouette = calculateSilhouette(newObjects);
  const matched = currentSilhouette === state.targetSilhouette;

  return {
    ...state,
    objects: newObjects,
    currentSilhouette,
    matched,
  };
}

/**
 * Rotate shadow object
 */
export function rotateShadowObject(
  state: AlchemistPuzzleState['phase4'],
  objectId: string,
  degrees: number
): AlchemistPuzzleState['phase4'] {
  const newObjects = state.objects.map((obj) =>
    obj.id === objectId ? { ...obj, rotation: (obj.rotation + degrees) % 360 } : obj
  );

  const currentSilhouette = calculateSilhouette(newObjects);
  const matched = currentSilhouette === state.targetSilhouette;

  return {
    ...state,
    objects: newObjects,
    currentSilhouette,
    matched,
  };
}

/**
 * Calculate current silhouette based on object positions
 * (Simplified - in real implementation, this would use canvas/SVG path calculations)
 */
function calculateSilhouette(objects: ShadowObject[]): string {
  // This is a simplified version
  // In production, you'd calculate the actual shadow shape
  const sortedObjects = [...objects].sort((a, b) => a.position.x - b.position.x);
  
  // Check if objects form a lightbulb shape
  const isLightbulbShape =
    sortedObjects[0].type === 'circle' &&
    sortedObjects[0].position.y < 150 &&
    sortedObjects[1].type === 'triangle' &&
    sortedObjects[1].rotation === 180 &&
    sortedObjects[2].type === 'square' &&
    sortedObjects[2].position.y > 150;

  return isLightbulbShape ? 'lightbulb' : 'unknown';
}

/**
 * Validate Phase 4 completion
 */
export function validatePhase4(state: AlchemistPuzzleState['phase4']): ValidationResult {
  if (!state.matched) {
    return {
      isValid: false,
      message: 'Arrange the objects to cast the shadow of a creative idea',
    };
  }

  return {
    isValid: true,
    message: 'Perfect! The light reveals the true form of creativity!',
  };
}

// ============================================================================
// COMPLETE PUZZLE VALIDATION
// ============================================================================

/**
 * Validate entire Alchemist puzzle completion
 */
export function validateAlchemistPuzzle(state: AlchemistPuzzleState): ValidationResult {
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
    message: 'Congratulations! You have mastered the art of creative transformation!',
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get hint for current phase
 */
export function getHint(phase: 1 | 2 | 3 | 4, state: AlchemistPuzzleState): string {
  switch (phase) {
    case 1:
      return 'Match each crystal\'s element to its corresponding slot. Fire (purple) goes to the top.';
    case 2:
      return `You have aligned ${state.phase2.alignedRings} of ${state.phase2.rings.length} rings. Rotate each ring until the symbols align.`;
    case 3:
      return 'Watch carefully as the Philosopher\'s Stone reveals itself through the power of aligned creativity.';
    case 4:
      return 'Arrange the objects to create the shadow of a lightbulb - the universal symbol of ideas!';
    default:
      return 'Continue your journey through the creative process.';
  }
}

/**
 * Calculate completion percentage
 */
export function calculateProgress(state: AlchemistPuzzleState): number {
  let progress = 0;

  // Phase 1: 25%
  if (validatePhase1(state.phase1).isValid) progress += 25;

  // Phase 2: 25%
  if (validatePhase2(state.phase2).isValid) progress += 25;

  // Phase 3: 25%
  if (validatePhase3(state.phase3).isValid) progress += 25;

  // Phase 4: 25%
  if (validatePhase4(state.phase4).isValid) progress += 25;

  return progress;
}

/**
 * Reset puzzle to initial state
 */
export function resetAlchemistPuzzle(quotes: Quote[]): AlchemistPuzzleState {
  return {
    isComplete: false,
    startTime: new Date(),
    attempts: 0,
    hintsUsed: 0,
    phase1: initializePhase1(quotes),
    phase2: initializePhase2(),
    phase3: initializePhase3(),
    phase4: initializePhase4(),
  };
}
