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
  beginnersLuck: boolean; // Track if player is in beginner's luck phase
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

const INITIAL_BALANCE = 1000;
const SYMBOLS = ['🍒', '🍋', '🍊', '🔔', '⭐', '💎', '7️⃣'];

// Payout table (multiplier of bet amount)
const PAYOUTS: Record<string, number> = {
  '💎💎💎': 50,
  '7️⃣7️⃣7️⃣': 30,
  '⭐⭐⭐': 20,
  '🔔🔔🔔': 15,
  '🍊🍊🍊': 10,
  '🍋🍋🍋': 8,
  '🍒🍒🍒': 5,
  '💎💎': 3,
  '7️⃣7️⃣': 2,
  '🍒🍒': 2,
  '🍒': 1,
};

export function GameProvider({ children }: { children: ReactNode }) {
  const [gameState, setGameState] = useState<GameState>({
    balance: INITIAL_BALANCE,
    betAmount: 10,
    lastWin: 0,
    totalSpins: 0,
    totalWins: 0,
    isSpinning: false,
    outcomeOverride: 'RNG',
    reels: ['🍒', '🍋', '🍊'],
    beginnersLuck: true, // Start with beginner's luck enabled
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
    // Define weighted probabilities for each symbol (higher value = less frequent)
    const symbolWeights = {
      '🍒': 30, // Most common
      '🍋': 25,
      '🍊': 20,
      '🔔': 10,
      '⭐': 8,
      '💎': 5,
      '7️⃣': 2, // Least common
    };

    // Calculate total weight
    const totalWeight = Object.values(symbolWeights).reduce(
      (sum, weight) => sum + weight,
      0,
    );

    // Function to select a random symbol based on weights
    const selectWeightedSymbol = (): string => {
      let random = Math.random() * totalWeight;
      for (const symbol of SYMBOLS) {
        const weight =
          symbolWeights[symbol as keyof typeof symbolWeights];
        if (random < weight) {
          return symbol;
        }
        random -= weight;
      }
      return SYMBOLS[0]; // Fallback
    };

    // Generate three reels with weighted randomness
    return [
      selectWeightedSymbol(),
      selectWeightedSymbol(),
      selectWeightedSymbol(),
    ];
  };

  const generateWinningReels = (): string[] => {
    // Create weighted combinations based on the PAYOUTS table
    const payoutEntries = Object.entries(PAYOUTS);

    // Sort by payout value (descending)
    payoutEntries.sort((a, b) => b[1] - a[1]);

    // Group payouts into tiers for better control
    const highPayouts = payoutEntries.filter(
      ([, value]) => value >= 20,
    );
    const mediumPayouts = payoutEntries.filter(
      ([, value]) => value >= 5 && value < 20,
    );
    const lowPayouts = payoutEntries.filter(([, value]) => value < 5);

    // Select a tier with weighted probability
    // 10% chance for high payout, 30% for medium, 60% for low
    const rand = Math.random();
    let selectedTier;

    if (rand < 0.1 && highPayouts.length > 0) {
      selectedTier = highPayouts;
    } else if (rand < 0.4 && mediumPayouts.length > 0) {
      selectedTier = mediumPayouts;
    } else {
      selectedTier = lowPayouts;
    }

    // Choose a random combination from the selected tier
    const [combination] =
      selectedTier[Math.floor(Math.random() * selectedTier.length)];

    // Convert the combination string into an array of symbols
    if (combination.length === 3) {
      // For three-symbol combinations like '💎💎💎'
      return combination.split('');
    } else if (combination.length === 2) {
      // For two-symbol combinations like '��'
      return [
        ...combination.split(''),
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
      ];
    } else {
      // For single symbol combinations like '🍒'
      return [
        combination,
        ...SYMBOLS.slice(0, 2).map(
          () => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        ),
      ];
    }
  };

  const generateLosingReels = (): string[] => {
    // Map of known losing combinations to avoid infinite loops
    const losingCombinations = [
      ['🍋', '🍊', '🔔'],
      ['🔔', '⭐', '💎'],
      ['💎', '🍋', '⭐'],
      ['7️⃣', '🍊', '🍋'],
      ['⭐', '7️⃣', '🔔'],
      ['🍊', '💎', '7️⃣'],
    ];

    // Try up to 10 times to generate a random losing combination
    let attempts = 0;
    let reels: string[];

    do {
      // After a few attempts, just use a predetermined losing combination
      if (attempts > 5) {
        const safeLosingCombo =
          losingCombinations[
            Math.floor(Math.random() * losingCombinations.length)
          ];
        return safeLosingCombo;
      }

      reels = generateRandomReels();
      attempts++;
    } while (
      calculateWin(reels, gameState.betAmount) > 0 &&
      attempts < 10
    );

    return reels;
  };

  const calculateWin = (
    reels: string[],
    betAmount: number,
  ): number => {
    // Handle full combination (all three reels match)
    if (reels[0] === reels[1] && reels[1] === reels[2]) {
      const fullMatch = reels[0].repeat(3);
      if (PAYOUTS[fullMatch]) {
        return PAYOUTS[fullMatch] * betAmount;
      }
    }

    // Handle first two reels matching
    if (reels[0] === reels[1]) {
      const partialMatch = reels[0].repeat(2);
      if (PAYOUTS[partialMatch]) {
        return PAYOUTS[partialMatch] * betAmount;
      }
    }

    // Check for special combinations that may not follow the above patterns
    const reelString = reels.join('');
    if (PAYOUTS[reelString]) {
      return PAYOUTS[reelString] * betAmount;
    }

    // Handle single cherry payout (only if in first position)
    if (reels[0] === '🍒' && PAYOUTS['🍒']) {
      return PAYOUTS['🍒'] * betAmount;
    }

    // No winning combination
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
    let shouldDisableBeginnersLuck = false;

    // Check outcome override
    if (gameState.outcomeOverride === 'WIN') {
      newReels = generateWinningReels();
      // Reset override after use via API
      await resetOutcomeOverride();
    } else if (gameState.outcomeOverride === 'LOSS') {
      newReels = generateLosingReels();
      // Reset override after use via API
      await resetOutcomeOverride();
    } else {
      // Apply beginner's luck for the first two spins
      if (gameState.beginnersLuck && gameState.totalSpins < 2) {
        // 75% chance of winning for first two spins
        const luckyRoll = Math.random();
        if (luckyRoll < 0.75) {
          newReels = generateWinningReels();
          console.log("🍀 Beginner's luck activated!");
        } else {
          newReels = generateRandomReels();
        }

        // Check if we should disable beginner's luck after this spin
        if (gameState.totalSpins === 1) {
          shouldDisableBeginnersLuck = true;
          console.log("🍀 Beginner's luck has ended");
        }
      } else {
        // Normal RNG after beginner's luck period
        newReels = generateRandomReels();
      }
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
      beginnersLuck: shouldDisableBeginnersLuck
        ? false
        : prev.beginnersLuck,
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
      betAmount: 10,
      lastWin: 0,
      totalSpins: 0,
      totalWins: 0,
      isSpinning: false,
      outcomeOverride: 'RNG',
      reels: ['🍒', '🍋', '🍊'],
      beginnersLuck: true, // Start with beginner's luck enabled
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
