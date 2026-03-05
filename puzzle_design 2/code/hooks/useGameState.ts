import { useState, useEffect, useCallback } from 'react';
import {
  GameState,
  GameAction,
  WorldType,
  PhaseType,
  Quote,
  Achievement,
  WorldProgress,
} from '../types/game.types';

/**
 * Custom React Hook for Game State Management
 */

const STORAGE_KEY = 'puzzle-of-inspiration-game-state';

// Initial game state
const initialGameState: GameState = {
  player: {
    id: 'player-1',
    name: 'Explorer',
    level: 1,
    experience: 0,
  },
  currentWorld: 'hub',
  currentPhase: 1,
  worldProgress: {
    hub: {
      worldId: 'hub',
      currentPhase: 1,
      completedPhases: [],
      completionPercentage: 0,
      timeSpent: 0,
    },
    alchemist: {
      worldId: 'alchemist',
      currentPhase: 1,
      completedPhases: [],
      completionPercentage: 0,
      timeSpent: 0,
    },
    gardener: {
      worldId: 'gardener',
      currentPhase: 1,
      completedPhases: [],
      completionPercentage: 0,
      timeSpent: 0,
    },
    explorer: {
      worldId: 'explorer',
      currentPhase: 1,
      completedPhases: [],
      completionPercentage: 0,
      timeSpent: 0,
    },
  },
  collectedQuotes: [],
  achievements: [],
  settings: {
    soundEnabled: true,
    musicEnabled: true,
    difficulty: 'medium',
    language: 'en',
  },
};

export function useGameState() {
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [isLoading, setIsLoading] = useState(true);

  // Load game state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem(STORAGE_KEY);
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        setGameState(parsed);
      } catch (error) {
        console.error('Failed to load game state:', error);
      }
    }
    setIsLoading(false);
  }, []);

  // Save game state to localStorage whenever it changes
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
    }
  }, [gameState, isLoading]);

  // Dispatch action to update game state
  const dispatch = useCallback((action: GameAction) => {
    setGameState((prevState) => {
      switch (action.type) {
        case 'SET_WORLD':
          return {
            ...prevState,
            currentWorld: action.payload,
            currentPhase: prevState.worldProgress[action.payload].currentPhase,
          };

        case 'SET_PHASE':
          return {
            ...prevState,
            currentPhase: action.payload,
          };

        case 'COMPLETE_PHASE': {
          const { world, phase } = action.payload;
          const worldProgress = prevState.worldProgress[world];
          const completedPhases = [...worldProgress.completedPhases];
          
          if (!completedPhases.includes(phase)) {
            completedPhases.push(phase);
          }

          const nextPhase = (phase + 1) as PhaseType;
          const completionPercentage = (completedPhases.length / 4) * 100;

          return {
            ...prevState,
            worldProgress: {
              ...prevState.worldProgress,
              [world]: {
                ...worldProgress,
                currentPhase: nextPhase <= 4 ? nextPhase : 4,
                completedPhases,
                completionPercentage,
                lastPlayed: new Date(),
              },
            },
            player: {
              ...prevState.player,
              experience: prevState.player.experience + 100,
              level: Math.floor((prevState.player.experience + 100) / 400) + 1,
            },
          };
        }

        case 'ADD_QUOTE': {
          const quoteExists = prevState.collectedQuotes.some(
            (q) => q.id === action.payload.id
          );
          
          if (quoteExists) return prevState;

          return {
            ...prevState,
            collectedQuotes: [...prevState.collectedQuotes, action.payload],
          };
        }

        case 'UNLOCK_ACHIEVEMENT': {
          const achievementExists = prevState.achievements.some(
            (a) => a.id === action.payload.id
          );
          
          if (achievementExists) return prevState;

          return {
            ...prevState,
            achievements: [
              ...prevState.achievements,
              { ...action.payload, unlockedAt: new Date() },
            ],
          };
        }

        case 'UPDATE_PROGRESS': {
          const { world, progress } = action.payload;
          return {
            ...prevState,
            worldProgress: {
              ...prevState.worldProgress,
              [world]: {
                ...prevState.worldProgress[world],
                ...progress,
              },
            },
          };
        }

        case 'UPDATE_SETTINGS':
          return {
            ...prevState,
            settings: {
              ...prevState.settings,
              ...action.payload,
            },
          };

        default:
          return prevState;
      }
    });
  }, []);

  // Helper functions
  const setWorld = useCallback(
    (world: WorldType) => {
      dispatch({ type: 'SET_WORLD', payload: world });
    },
    [dispatch]
  );

  const setPhase = useCallback(
    (phase: PhaseType) => {
      dispatch({ type: 'SET_PHASE', payload: phase });
    },
    [dispatch]
  );

  const completePhase = useCallback(
    (world: WorldType, phase: PhaseType) => {
      dispatch({ type: 'COMPLETE_PHASE', payload: { world, phase } });
    },
    [dispatch]
  );

  const addQuote = useCallback(
    (quote: Quote) => {
      dispatch({ type: 'ADD_QUOTE', payload: quote });
    },
    [dispatch]
  );

  const unlockAchievement = useCallback(
    (achievement: Achievement) => {
      dispatch({ type: 'UNLOCK_ACHIEVEMENT', payload: achievement });
    },
    [dispatch]
  );

  const updateProgress = useCallback(
    (world: WorldType, progress: Partial<WorldProgress>) => {
      dispatch({ type: 'UPDATE_PROGRESS', payload: { world, progress } });
    },
    [dispatch]
  );

  const resetGame = useCallback(() => {
    setGameState(initialGameState);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // Computed values
  const totalCompletion = Object.values(gameState.worldProgress).reduce(
    (sum, world) => sum + world.completionPercentage,
    0
  ) / 3; // Divide by 3 worlds (excluding hub)

  const totalQuotes = gameState.collectedQuotes.length;
  const totalAchievements = gameState.achievements.length;

  return {
    gameState,
    isLoading,
    dispatch,
    setWorld,
    setPhase,
    completePhase,
    addQuote,
    unlockAchievement,
    updateProgress,
    resetGame,
    totalCompletion,
    totalQuotes,
    totalAchievements,
  };
}

/**
 * Hook for tracking time spent in a world
 */
export function useWorldTimer(world: WorldType) {
  const [startTime] = useState(Date.now());
  const { updateProgress } = useGameState();

  useEffect(() => {
    const interval = setInterval(() => {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      updateProgress(world, { timeSpent });
    }, 1000);

    return () => clearInterval(interval);
  }, [world, startTime, updateProgress]);
}

/**
 * Hook for sound effects
 */
export function useSoundEffect() {
  const { gameState } = useGameState();

  const playSound = useCallback(
    (soundName: string) => {
      if (!gameState.settings.soundEnabled) return;

      // In production, implement actual sound playing
      console.log(`Playing sound: ${soundName}`);
      
      // Example with Web Audio API:
      // const audio = new Audio(`/sounds/${soundName}.mp3`);
      // audio.play();
    },
    [gameState.settings.soundEnabled]
  );

  return { playSound };
}

/**
 * Hook for achievement checking
 */
export function useAchievementChecker() {
  const { gameState, unlockAchievement } = useGameState();

  const checkAchievements = useCallback(() => {
    // Check for first world completion
    Object.entries(gameState.worldProgress).forEach(([worldId, progress]) => {
      if (
        progress.completionPercentage === 100 &&
        !gameState.achievements.some((a) => a.id === `complete-${worldId}`)
      ) {
        unlockAchievement({
          id: `complete-${worldId}`,
          title: `${worldId} Master`,
          description: `Complete all phases in ${worldId}`,
          icon: `🏆`,
          world: worldId as WorldType,
        });
      }
    });

    // Check for quote collection milestones
    const quoteCount = gameState.collectedQuotes.length;
    const milestones = [5, 10, 20, 50];
    
    milestones.forEach((milestone) => {
      if (
        quoteCount >= milestone &&
        !gameState.achievements.some((a) => a.id === `quotes-${milestone}`)
      ) {
        unlockAchievement({
          id: `quotes-${milestone}`,
          title: `Quote Collector`,
          description: `Collect ${milestone} creativity quotes`,
          icon: `📚`,
        });
      }
    });

    // Check for speed run
    Object.entries(gameState.worldProgress).forEach(([worldId, progress]) => {
      if (
        progress.completionPercentage === 100 &&
        progress.timeSpent < 600 && // 10 minutes
        !gameState.achievements.some((a) => a.id === `speedrun-${worldId}`)
      ) {
        unlockAchievement({
          id: `speedrun-${worldId}`,
          title: `Speed Explorer`,
          description: `Complete ${worldId} in under 10 minutes`,
          icon: `⚡`,
          world: worldId as WorldType,
        });
      }
    });
  }, [gameState, unlockAchievement]);

  useEffect(() => {
    checkAchievements();
  }, [checkAchievements]);
}
