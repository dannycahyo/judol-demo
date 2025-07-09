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
  });

  // Load outcome override from API on component mount
  useEffect(() => {
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

    fetchGameSettings();
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
      // Reset override after use via API
      try {
        await fetch('/api/admin-settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ outcomeOverride: 'RNG' }),
        });
      } catch (error) {
        console.error('Error resetting game settings:', error);
      }
    } else if (gameState.outcomeOverride === 'LOSS') {
      newReels = generateLosingReels();
      // Reset override after use via API
      try {
        await fetch('/api/admin-settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ outcomeOverride: 'RNG' }),
        });
      } catch (error) {
        console.error('Error resetting game settings:', error);
      }
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
    try {
      const response = await fetch('/api/admin-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ outcomeOverride: override }),
      });

      if (response.ok) {
        setGameState((prev) => ({
          ...prev,
          outcomeOverride: override,
        }));
      } else {
        console.error('Failed to update game settings');
      }
    } catch (error) {
      console.error('Error setting outcome override:', error);
    }
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
    });

    // Reset game settings in database as well
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
