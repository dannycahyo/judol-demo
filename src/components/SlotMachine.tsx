import { useGame } from '../context/GameContext';
import { useState, useEffect } from 'react';

export default function SlotMachine() {
  const { gameState, setBetAmount, spin } = useGame();
  const [showWinCelebration, setShowWinCelebration] = useState(false);

  const handleSpin = async () => {
    if (gameState.balance < gameState.betAmount) {
      alert('Insufficient balance!');
      return;
    }
    const result = await spin();
    if (result.win > 0) {
      setShowWinCelebration(true);
      setTimeout(() => setShowWinCelebration(false), 3000);
    }
  };

  useEffect(() => {
    if (gameState.lastWin > 0 && !gameState.isSpinning) {
      setShowWinCelebration(true);
      setTimeout(() => setShowWinCelebration(false), 3000);
    }
  }, [gameState.lastWin, gameState.isSpinning]);

  const increaseBet = () => {
    setBetAmount(gameState.betAmount + 5);
  };

  const decreaseBet = () => {
    setBetAmount(gameState.betAmount - 5);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gradient-to-b from-purple-900 to-blue-900 rounded-2xl shadow-2xl relative">
      {/* Win Celebration Overlay */}
      {showWinCelebration && gameState.lastWin > 0 && (
        <div className="absolute inset-0 bg-yellow-400/90 rounded-2xl flex items-center justify-center z-50 animate-pulse">
          <div className="text-center">
            <div className="text-6xl font-bold text-purple-900 mb-4">
              🎉 WIN! 🎉
            </div>
            <div className="text-4xl font-bold text-purple-900">
              ${gameState.lastWin}
            </div>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">
          🎰 Responsible Gambling Simulator
        </h1>
        <p className="text-purple-200">
          Educational Demo - No Real Money Involved
        </p>
      </div>

      {/* Game Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
          <div className="text-xl md:text-2xl font-bold text-yellow-400">
            ${gameState.balance}
          </div>
          <div className="text-purple-200 text-xs md:text-sm">
            Balance
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
          <div className="text-xl md:text-2xl font-bold text-green-400">
            ${gameState.lastWin}
          </div>
          <div className="text-purple-200 text-xs md:text-sm">
            Last Win
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
          <div className="text-xl md:text-2xl font-bold text-blue-400">
            {gameState.totalSpins}
          </div>
          <div className="text-purple-200 text-xs md:text-sm">
            Total Spins
          </div>
        </div>
      </div>

      {/* Slot Machine */}
      <div className="bg-gradient-to-b from-yellow-400 to-yellow-600 p-8 rounded-2xl shadow-inner mb-8">
        {/* Reels */}
        <div className="flex justify-center mb-6">
          <div className="bg-white rounded-lg p-4 shadow-inner">
            <div className="flex gap-4">
              {gameState.reels.map((symbol, index) => (
                <div
                  key={index}
                  className={`w-20 h-20 bg-gray-100 border-4 border-gray-300 rounded-lg flex items-center justify-center text-4xl font-bold shadow-inner overflow-hidden ${
                    gameState.isSpinning ? 'reel-spinning' : ''
                  }`}
                  style={{
                    animationDelay: gameState.isSpinning
                      ? `${index * 0.1}s`
                      : '0s',
                  }}
                >
                  {gameState.isSpinning ? '🎰' : symbol}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bet Controls */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <button
            onClick={decreaseBet}
            disabled={
              gameState.betAmount <= 5 || gameState.isSpinning
            }
            className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-lg transition-colors"
          >
            -
          </button>
          <div className="bg-white rounded-lg px-6 py-2 min-w-24 text-center">
            <div className="text-sm text-gray-800 font-bold">Bet</div>
            <div className="text-xl font-bold text-gray-900">
              ${gameState.betAmount}
            </div>
          </div>
          <button
            onClick={increaseBet}
            disabled={
              gameState.betAmount >= gameState.balance ||
              gameState.isSpinning
            }
            className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-lg transition-colors"
          >
            +
          </button>
        </div>

        {/* Spin Button */}
        <div className="text-center">
          <button
            onClick={handleSpin}
            disabled={
              gameState.isSpinning ||
              gameState.balance < gameState.betAmount
            }
            className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-4 px-12 rounded-full text-2xl shadow-lg transform transition-all hover:scale-105 active:scale-95"
          >
            {gameState.isSpinning ? 'SPINNING...' : 'SPIN'}
          </button>
        </div>
      </div>

      {/* Game Statistics */}
      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
        <h3 className="text-white font-semibold mb-2">
          Session Statistics
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="text-lg font-bold text-yellow-400">
              {gameState.totalSpins}
            </div>
            <div className="text-purple-200">Total Spins</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-400">
              {gameState.totalWins}
            </div>
            <div className="text-purple-200">Wins</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-red-400">
              {gameState.totalSpins > 0
                ? Math.round(
                    (gameState.totalWins / gameState.totalSpins) *
                      100,
                  )
                : 0}
              %
            </div>
            <div className="text-purple-200">Win Rate</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-orange-400">
              ${1000 - gameState.balance}
            </div>
            <div className="text-purple-200">Net Loss</div>
          </div>
        </div>
      </div>
    </div>
  );
}
