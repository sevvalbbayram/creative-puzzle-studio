# Puzzle of Inspiration - Code Implementation

This directory contains the complete Tailwind CSS configuration and puzzle logic implementation for the Puzzle of Inspiration game.

## 📁 Directory Structure

```
code/
├── README.md                      # This file
├── tailwind.config.ts             # Complete Tailwind CSS configuration
├── globals.css                    # Global styles and utility classes
├── types/
│   └── game.types.ts             # TypeScript type definitions
├── puzzles/
│   ├── alchemist.logic.ts        # Alchemist's Workshop puzzle logic
│   ├── gardener.logic.ts         # Gardener's Journey puzzle logic
│   └── explorer.logic.ts         # Explorer's Map puzzle logic
└── hooks/
    └── useGameState.ts           # React hooks for state management
```

## 🎨 Tailwind CSS Configuration

### `tailwind.config.ts`

Complete Tailwind configuration including:

- **Global Brand Colors**: Purple (#9333EA), Orange (#F97316)
- **World-Specific Color Palettes**:
  - Observatory: Space blue, starlight gold, cosmic purple
  - Alchemist: Mystical purple, potion green, alchemical gold
  - Gardener: Earth brown, leaf green, blossom pink
  - Explorer: Parchment beige, compass gold, ocean blue
- **Custom Gradients**: Background images for each world
- **Animations**: Float, pulse-glow, rotate, shimmer, sparkle
- **Box Shadows**: Glow effects for interactive elements
- **Extended Spacing, Border Radius, Z-Index**

### `globals.css`

Global CSS including:

- **CSS Variables**: Theme colors as CSS custom properties
- **Component Classes**: Buttons, cards, progress bars, phase indicators
- **World-Specific Backgrounds**: Gradient classes for each world
- **Glow Effects**: Purple, orange, green, gold glows
- **Glassmorphism**: Transparent overlay effects
- **Puzzle Elements**: Draggable pieces, drop zones, crystals
- **Animations**: Particle effects, starfield, confetti
- **Responsive Utilities**: Mobile, tablet, desktop helpers
- **Accessibility**: Focus rings, screen reader only, reduced motion

## 🎮 Puzzle Logic Implementation

### Type Definitions (`types/game.types.ts`)

Complete TypeScript interfaces for:

- **Core Game Types**: WorldType, PhaseType, Quote, Player, GameState
- **Alchemist Types**: Crystal, AstrolabeSlot, CelestialRing, ShadowObject
- **Gardener Types**: Seed, GardenPlot, WaterPipe, Flower, MandalaPattern
- **Explorer Types**: MapFragment, MapTile, Riddle
- **State Management**: GameAction, ValidationResult

### Alchemist's Workshop (`puzzles/alchemist.logic.ts`)

**Phase 1: Preparation - Elemental Alignment**
- `initializePhase1()`: Create 4 crystals with quotes and 4 astrolabe slots
- `placeCrystal()`: Handle crystal placement with element matching
- `validatePhase1()`: Check if all crystals are correctly placed

**Phase 2: Incubation - Celestial Ring Rotation**
- `initializePhase2()`: Create 3 concentric rings with symbols
- `rotateRing()`: Rotate rings to align symbols
- `validatePhase2()`: Check if all rings are aligned

**Phase 3: Illumination - Philosopher's Stone Revelation**
- `initializePhase3()`: Setup revelation animation
- `revealPhilosophersStone()`: Trigger stone appearance
- `validatePhase3()`: Confirm animation complete

**Phase 4: Verification - Shadow Puppet Puzzle**
- `initializePhase4()`: Create shadow objects
- `moveShadowObject()`, `rotateShadowObject()`: Manipulate objects
- `validatePhase4()`: Check if shadow matches target silhouette

**Helper Functions**:
- `getHint()`: Contextual hints for each phase
- `calculateProgress()`: Overall completion percentage
- `resetAlchemistPuzzle()`: Reset to initial state

### Gardener's Journey (`puzzles/gardener.logic.ts`)

**Phase 1: Preparation - Planting Seeds**
- `initializePhase1()`: Create 4 seeds and 3x3 garden grid
- `plantSeed()`: Place seed in plot
- `removeSeed()`: Remove seed from plot
- `validatePhase1()`: Check if all seeds planted

**Phase 2: Incubation - Water Flow Puzzle**
- `initializePhase2()`: Create 5x5 pipe grid
- `rotatePipe()`: Rotate pipes to connect water flow
- `calculateWaterFlow()`: Flood fill algorithm to trace water path
- `validatePhase2()`: Check if all plants are watered

**Phase 3: Illumination - Blooming Sequence**
- `initializePhase3()`: Setup bloom animation
- `advanceBloom()`: Progress through bloom sequence
- `validatePhase3()`: Confirm all flowers bloomed

**Phase 4: Verification - Mandala Arrangement**
- `initializePhase4()`: Create mandala pattern
- `placeFlower()`: Position flowers in mandala
- `checkMandalaPattern()`: Validate pattern matching
- `validatePhase4()`: Check if mandala is complete

**Helper Functions**:
- `getHint()`: Phase-specific guidance
- `calculateProgress()`: Completion tracking
- `resetGardenerPuzzle()`: Reset puzzle state

### Explorer's Map (`puzzles/explorer.logic.ts`)

**Phase 1: Preparation - Map Assembly**
- `initializePhase1()`: Create 3x3 jigsaw puzzle pieces
- `moveFragment()`: Drag and snap fragments
- `canConnect()`: Check if fragments can connect
- `validatePhase1()`: Verify map completion

**Phase 2: Incubation - Fog Navigation**
- `initializePhase2()`: Create 8x8 grid with fog
- `movePlayer()`: Navigate through map
- `getAvailableMoves()`: Check valid directions
- `validatePhase2()`: Confirm treasure found

**Phase 3: Illumination - Treasure Revelation**
- `initializePhase3()`: Setup treasure reveal
- `revealTreasure()`: Trigger revelation animation
- `validatePhase3()`: Check animation complete

**Phase 4: Verification - Riddle Solving**
- `initializePhase4()`: Create riddle puzzle
- `submitAnswer()`: Check answer correctness
- `getRiddleHint()`: Provide hint
- `validatePhase4()`: Validate correct answer

**Helper Functions**:
- `getHint()`: Contextual help
- `calculateProgress()`: Track completion
- `getPathHint()`: Navigation assistance
- `calculateExplorationPercentage()`: Fog clearing progress

## 🔧 State Management

### `hooks/useGameState.ts`

Custom React hooks for managing game state:

**Main Hook: `useGameState()`**
- Manages global game state
- Persists to localStorage
- Provides dispatch function for actions
- Helper functions: `setWorld()`, `setPhase()`, `completePhase()`, etc.
- Computed values: `totalCompletion`, `totalQuotes`, `totalAchievements`

**Timer Hook: `useWorldTimer()`**
- Tracks time spent in each world
- Updates progress automatically

**Sound Hook: `useSoundEffect()`**
- Plays sound effects based on settings
- Respects user preferences

**Achievement Hook: `useAchievementChecker()`**
- Automatically checks for achievement unlocks
- Triggers on state changes

## 🚀 Integration Guide

### 1. Install Dependencies

```bash
npm install tailwindcss@latest
npm install framer-motion  # For animations
npm install react-dnd react-dnd-html5-backend  # For drag-and-drop
```

### 2. Add Tailwind Config

Copy `tailwind.config.ts` to your project root:

```bash
cp tailwind.config.ts /path/to/your/project/
```

### 3. Import Global Styles

Add to your `app/globals.css` or `styles/globals.css`:

```css
@import './code/globals.css';
```

Or copy the contents directly into your existing global CSS file.

### 4. Use Type Definitions

Import types in your components:

```typescript
import { GameState, WorldType, PhaseType } from './types/game.types';
```

### 5. Implement Puzzle Logic

Example usage in a React component:

```typescript
import { useGameState } from './hooks/useGameState';
import { initializePhase1, placeCrystal, validatePhase1 } from './puzzles/alchemist.logic';

function AlchemistPuzzle() {
  const { gameState, completePhase, addQuote } = useGameState();
  const [puzzleState, setPuzzleState] = useState(() => 
    initializePhase1(gameState.collectedQuotes)
  );

  const handleCrystalPlace = (crystalId: string, slotId: string) => {
    const { newState, isValid } = placeCrystal(puzzleState, crystalId, slotId);
    
    if (isValid) {
      setPuzzleState(newState);
      
      const validation = validatePhase1(newState);
      if (validation.isValid) {
        completePhase('alchemist', 1);
      }
    }
  };

  return (
    <div className="bg-alchemist">
      {/* Your puzzle UI */}
    </div>
  );
}
```

### 6. Apply Tailwind Classes

Use the custom classes in your components:

```tsx
<button className="btn-primary">
  Start Puzzle
</button>

<div className="card-interactive">
  <div className="crystal crystal-purple">
    {/* Crystal content */}
  </div>
</div>

<div className="progress-bar">
  <div className="progress-fill" style={{ width: `${progress}%` }} />
</div>
```

## 🎨 Color Usage Examples

### Global Colors

```tsx
<div className="bg-brand-purple text-white">Purple Button</div>
<div className="bg-brand-orange text-white">Orange Button</div>
```

### World-Specific Colors

```tsx
{/* Observatory */}
<div className="bg-observatory-space text-observatory-gold">
  Observatory Hub
</div>

{/* Alchemist */}
<div className="bg-alchemist-purple text-alchemist-gold">
  Alchemist's Workshop
</div>

{/* Gardener */}
<div className="bg-gardener-green text-gardener-pink">
  Gardener's Journey
</div>

{/* Explorer */}
<div className="bg-explorer-parchment text-explorer-ink">
  Explorer's Map
</div>
```

### Gradient Backgrounds

```tsx
<div className="bg-observatory-space">Space Background</div>
<div className="bg-alchemist-workshop">Workshop Background</div>
<div className="bg-gardener-earth">Garden Background</div>
<div className="bg-explorer-parchment">Parchment Background</div>
```

### Glow Effects

```tsx
<div className="glow-purple">Purple Glow</div>
<div className="glow-orange">Orange Glow</div>
<div className="glow-green">Green Glow</div>
<div className="glow-gold">Gold Glow</div>
```

## 🎭 Animation Examples

```tsx
{/* Floating animation */}
<div className="animate-float">
  Floating Element
</div>

{/* Pulse glow */}
<div className="animate-pulse-glow glow-purple">
  Pulsing Glow
</div>

{/* Rotate */}
<div className="animate-rotate-slow">
  Rotating Element
</div>

{/* Fade in */}
<div className="animate-fade-in">
  Fading In
</div>
```

## 📱 Responsive Design

```tsx
{/* Responsive text */}
<h1 className="text-responsive-3xl">
  Responsive Heading
</h1>

{/* Responsive layout */}
<div className="mobile-stack tablet-grid desktop-grid">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>
```

## ♿ Accessibility

```tsx
{/* Focus ring */}
<button className="focus-ring">
  Accessible Button
</button>

{/* Screen reader only */}
<span className="sr-only">
  Hidden from visual users
</span>

{/* Touch targets */}
<button className="touch-target">
  Mobile-Friendly Button
</button>
```

## 🧪 Testing

Example test for puzzle logic:

```typescript
import { initializePhase1, placeCrystal, validatePhase1 } from './puzzles/alchemist.logic';

describe('Alchemist Phase 1', () => {
  it('should validate when all crystals are placed correctly', () => {
    const quotes = [/* mock quotes */];
    const state = initializePhase1(quotes);
    
    // Place all crystals correctly
    let currentState = state;
    state.crystals.forEach((crystal) => {
      const slot = state.slots.find(s => s.element === crystal.element);
      const { newState } = placeCrystal(currentState, crystal.id, slot!.id);
      currentState = newState;
    });
    
    const validation = validatePhase1(currentState);
    expect(validation.isValid).toBe(true);
  });
});
```

## 📚 Additional Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [React DnD Documentation](https://react-dnd.github.io/react-dnd/)
- [Framer Motion Documentation](https://www.framer.com/motion/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)

## 🎯 Next Steps

1. Copy all code files to your project
2. Install required dependencies
3. Import and configure Tailwind
4. Implement one world at a time
5. Test puzzle logic thoroughly
6. Add animations with Framer Motion
7. Implement drag-and-drop with React DnD
8. Add sound effects
9. Test on multiple devices
10. Optimize performance

## 💡 Tips

- Start with the Alchemist world as it has the most straightforward mechanics
- Use the provided type definitions to ensure type safety
- Leverage the custom Tailwind classes for consistent styling
- Test puzzle logic independently before integrating with UI
- Use the `useGameState` hook to manage global state
- Implement achievements to increase engagement
- Add sound effects for better user feedback

## 🐛 Common Issues

**Issue**: Tailwind classes not working  
**Solution**: Ensure `tailwind.config.ts` is in the root and content paths are correct

**Issue**: Drag-and-drop not working  
**Solution**: Make sure React DnD is properly configured with HTML5Backend

**Issue**: State not persisting  
**Solution**: Check localStorage is enabled and `useGameState` hook is used correctly

**Issue**: Animations not smooth  
**Solution**: Use Framer Motion for complex animations, ensure GPU acceleration

---

**Happy Coding!** 🚀✨
