import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';

export type OutcomeOverride = 'RNG' | 'WIN' | 'LOSS';

interface GameState {
  balance: number;
  betAmount: number;
  lastWin: number;
  totalSpins: number;
  totalWins: number;
  isSpinning: boolean;
  outcomeOverride: OutcomeOverride;
  reels: string[];
}

interface GameContextType {
  gameState: GameState;
  setBetAmount: (amount: number) => void;
  spin: () => Promise<{ reels: string[]; win: number }>;
  setOutcomeOverride: (override: OutcomeOverride) => Promise<void>;
  resetGame: () => Promise<void>;
}

const GameContext = createContext<GameContextType | undefined>(
  undefined,
);

const INITIAL_BALANCE = 1000000; // 1 million Rupiah
const SYMBOLS = ['🍒', '🍋', '🍊', '🔔', '⭐', '💎', '🧨'];

// Payout table (multiplier of bet amount)
const PAYOUTS: Record<string, number> = {
  '💎💎💎': 50,
  '🧨🧨🧨': 30,
  '⭐⭐⭐': 20,
  '🔔🔔🔔': 15,
  '🍊🍊🍊': 10,
  '🍋🍋🍋': 8,
  '🍒🍒🍒': 5,
  '💎💎': 3,
  '🧨🧨': 2,
  '🍒🍒': 2,
  '🍒': 1,
};

export function GameProvider({ children }: { children: ReactNode }) {
  const [gameState, setGameState] = useState<GameState>({
    balance: INITIAL_BALANCE,
    betAmount: 10000, // 10,000 Rupiah
    lastWin: 0,
    totalSpins: 0,
    totalWins: 0,
    isSpinning: false,
    outcomeOverride: 'RNG',
    reels: ['🍒', '🍋', '🍊'],
  });

  // Helper: Reset outcome override to RNG via API
  const resetOutcomeOverride = async () => {
    try {
      await fetch('/api/admin-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ outcomeOverride: 'RNG' }),
      });
    } catch (error) {
      console.error('Error resetting game settings:', error);
    }
  };

  // Helper: Update admin settings via API
  const updateAdminSettings = async (
    outcomeOverride: OutcomeOverride,
  ) => {
    try {
      console.log(
        `🎮 Setting outcome override to: ${outcomeOverride}`,
      );
      const response = await fetch('/api/admin-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ outcomeOverride }),
      });

      if (response.ok) {
        try {
          const result = await response.json();
          console.log('✅ Admin settings updated:', result);
          return result;
        } catch (jsonError) {
          console.error(
            'Error parsing admin settings response:',
            jsonError,
          );
        }
      } else {
        console.error(
          'Failed to update game settings. Status:',
          response.status,
        );
        const errorText = await response.text();
        console.error('Error response:', errorText);
      }
    } catch (error) {
      console.error('Error setting outcome override:', error);
    }
  };

  // Helper: Fetch game settings from API
  const fetchGameSettings = async () => {
    try {
      const response = await fetch('/api/game-settings');
      if (response.ok) {
        const data = await response.json();
        setGameState((prev) => ({
          ...prev,
          outcomeOverride: data.outcomeOverride,
        }));
      }
    } catch (error) {
      console.error('Error fetching game settings:', error);
    }
  };

  // Connect to SSE for real-time updates
  useEffect(() => {
    let eventSource: EventSource | null = null;
    let reconnectTimeout: NodeJS.Timeout | null = null;

    const connectToSSE = () => {
      try {
        eventSource = new EventSource('/api/game-events');

        eventSource.onopen = () => {
          // Connection established
        };

        eventSource.onmessage = (event) => {
          try {
            // Check if event.data is empty or undefined
            if (!event.data || event.data.trim() === '') {
              return;
            }

            const data = JSON.parse(event.data);

            if (
              data.type === 'settings_changed' &&
              data.outcomeOverride
            ) {
              setGameState((prev) => ({
                ...prev,
                outcomeOverride: data.outcomeOverride,
              }));
            }
          } catch (error) {
            console.error('Error parsing SSE message:', error);
            console.error('Raw event data:', event.data);
          }
        };

        eventSource.onerror = () => {
          eventSource?.close();

          // Reconnect after 3 seconds
          reconnectTimeout = setTimeout(() => {
            connectToSSE();
          }, 3000);
        };
      } catch (error) {
        console.error('Error creating SSE connection:', error);
        // Fallback to initial fetch if SSE fails
        fallbackFetch();
      }
    };

    const fallbackFetch = async () => {
      await fetchGameSettings();
    };

    // Start SSE connection
    connectToSSE();

    // Cleanup on unmount
    return () => {
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
      if (eventSource) {
        eventSource.close();
      }
    };
  }, []);

  const setBetAmount = (amount: number) => {
    setGameState((prev) => ({
      ...prev,
      betAmount: Math.max(1, Math.min(amount, prev.balance)),
    }));
  };

  const generateRandomReels = (): string[] => {
    return [
      SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
      SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
      SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
    ];
  };

  const generateWinningReels = (): string[] => {
    // Generate a mid-tier winning combination
    const winningCombos = [
      ['🍋', '🍋', '🍋'],
      ['🍊', '🍊', '🍊'],
      ['🔔', '🔔', '🔔'],
      ['🍒', '🍒', '🍒'],
      ['🍒', '🍒', '🍋'],
      ['💎', '💎', '🍒'],
    ];
    return winningCombos[
      Math.floor(Math.random() * winningCombos.length)
    ];
  };

  const generateLosingReels = (): string[] => {
    let reels: string[];
    do {
      reels = generateRandomReels();
    } while (calculateWin(reels, gameState.betAmount) > 0);
    return reels;
  };

  const calculateWin = (
    reels: string[],
    betAmount: number,
  ): number => {
    const reelString = reels.join('');

    // Check for exact matches first
    if (PAYOUTS[reelString]) {
      return PAYOUTS[reelString] * betAmount;
    }

    // Check for partial matches
    const firstTwo = reels.slice(0, 2).join('');
    if (PAYOUTS[firstTwo]) {
      return PAYOUTS[firstTwo] * betAmount;
    }

    // Check for single cherry
    if (reels[0] === '🍒' && PAYOUTS['🍒']) {
      return PAYOUTS['🍒'] * betAmount;
    }

    return 0;
  };

  const spin = async (): Promise<{
    reels: string[];
    win: number;
  }> => {
    if (
      gameState.isSpinning ||
      gameState.balance < gameState.betAmount
    ) {
      return { reels: gameState.reels, win: 0 };
    }

    setGameState((prev) => ({ ...prev, isSpinning: true }));

    // Simulate spinning animation delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    let newReels: string[];

    // Check outcome override
    if (gameState.outcomeOverride === 'WIN') {
      newReels = generateWinningReels();
      await resetOutcomeOverride();
    } else if (gameState.outcomeOverride === 'LOSS') {
      newReels = generateLosingReels();
      await resetOutcomeOverride();
    } else {
      // Normal RNG
      newReels = generateRandomReels();
    }

    const win = calculateWin(newReels, gameState.betAmount);
    const newBalance = gameState.balance - gameState.betAmount + win;

    setGameState((prev) => ({
      ...prev,
      balance: newBalance,
      lastWin: win,
      totalSpins: prev.totalSpins + 1,
      totalWins: win > 0 ? prev.totalWins + 1 : prev.totalWins,
      isSpinning: false,
      reels: newReels,
    }));

    return { reels: newReels, win };
  };

  const setOutcomeOverride = async (override: OutcomeOverride) => {
    await updateAdminSettings(override);
    // Update local state regardless of API result
    setGameState((prev) => ({
      ...prev,
      outcomeOverride: override,
    }));
  };

  const resetGame = async () => {
    setGameState({
      balance: INITIAL_BALANCE,
      betAmount: 10000,
      lastWin: 0,
      totalSpins: 0,
      totalWins: 0,
      isSpinning: false,
      outcomeOverride: 'RNG',
      reels: ['🍒', '🍋', '🍊'],
    });

    // Reset game settings in database as well
    await resetOutcomeOverride();
  };

  return (
    <GameContext.Provider
      value={{
        gameState,
        setBetAmount,
        spin,
        setOutcomeOverride,
        resetGame,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}

export { PAYOUTS };
