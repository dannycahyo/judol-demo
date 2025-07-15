import { useGame, PAYOUTS } from '../context/GameContext';
import { useState, useEffect } from 'react';

// Helper function to format currency in Indonesian Rupiah
const formatRupiah = (amount: number): string => {
  return new Intl.NumberFormat('id-ID').format(amount);
};

export default function SlotMachine() {
  const { gameState, setBetAmount, spin } = useGame();
  const [showWinCelebration, setShowWinCelebration] = useState(false);
  const [showAdminNotification, setShowAdminNotification] =
    useState(false);
  const [lastOverride, setLastOverride] = useState(
    gameState.outcomeOverride,
  );
  const [isPayoutsVisible, setIsPayoutsVisible] = useState(false);
  const [betInput, setBetInput] = useState(
    gameState.betAmount.toString(),
  );

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

  // Show notification when admin updates rules in real-time
  useEffect(() => {
    if (
      gameState.outcomeOverride !== lastOverride &&
      lastOverride !== null
    ) {
      setShowAdminNotification(true);
      setTimeout(() => setShowAdminNotification(false), 3000);
    }
    setLastOverride(gameState.outcomeOverride);
  }, [gameState.outcomeOverride, lastOverride]);

  // Sync bet input with game state
  useEffect(() => {
    setBetInput(gameState.betAmount.toString());
  }, [gameState.betAmount]);

  const increaseBet = () => {
    setBetAmount(gameState.betAmount + 5000);
    setBetInput((gameState.betAmount + 5000).toString());
  };

  const decreaseBet = () => {
    setBetAmount(gameState.betAmount - 5000);
    setBetInput((gameState.betAmount - 5000).toString());
  };

  const handleBetInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = e.target.value;
    // Only allow numbers
    if (value === '' || /^\d+$/.test(value)) {
      setBetInput(value);
    }
  };

  const handleBetInputBlur = () => {
    const numericValue = parseInt(betInput) || 5000;
    const clampedValue = Math.max(
      5000,
      Math.min(numericValue, gameState.balance),
    );
    setBetAmount(clampedValue);
    setBetInput(clampedValue.toString());
  };

  const handleBetInputKeyPress = (
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === 'Enter') {
      handleBetInputBlur();
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gradient-to-b from-purple-900 to-blue-900 rounded-2xl shadow-2xl relative">
      {/* Admin Update Notification */}
      {showAdminNotification && (
        <div className="absolute top-4 right-4 bg-blue-500/90 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-bounce">
          <div className="flex items-center space-x-2">
            <span className="text-lg">🔄</span>
            <span className="font-semibold">
              Admin updated rules!
            </span>
          </div>
        </div>
      )}

      {/* Win Celebration Overlay */}
      {showWinCelebration && gameState.lastWin > 0 && (
        <div className="absolute inset-0 bg-yellow-400/90 rounded-2xl flex items-center justify-center z-50 animate-pulse">
          <div className="text-center">
            <div className="text-6xl font-bold text-purple-900 mb-4">
              🎉 WIN! 🎉
            </div>
            <div className="text-4xl font-bold text-purple-900">
              Rp {formatRupiah(gameState.lastWin)}
            </div>
          </div>
        </div>
      )}
      {/* Admin Notification Banner */}
      {showAdminNotification && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white text-center py-2 px-4 rounded-full shadow-lg z-50">
          Admin has updated the game rules!
        </div>
      )}
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
          🎰 Pragmatic Play - No. 1 Slot Gacor
        </h1>
        <p className="text-purple-200">
          Situs judi slot online terpopuler & terpercaya di Indonesia
        </p>
      </div>

      {/* Game Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
          <div className="text-xl md:text-2xl font-bold text-yellow-400">
            {formatRupiah(gameState.balance)}
          </div>
          <div className="text-purple-200 text-xs md:text-sm">
            Saldo
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
          <div className="text-xl md:text-2xl font-bold text-green-400">
            {formatRupiah(gameState.lastWin)}
          </div>
          <div className="text-purple-200 text-xs md:text-sm">
            Kemenangan Terakhir
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
          <div className="text-xl md:text-2xl font-bold text-blue-400">
            {gameState.totalSpins}
          </div>
          <div className="text-purple-200 text-xs md:text-sm">
            Total Putaran
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
              gameState.betAmount <= 5000 || gameState.isSpinning
            }
            className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-lg transition-colors"
          >
            -
          </button>
          <div className="bg-white rounded-lg px-6 py-2 min-w-32 text-center">
            <div className="text-sm text-gray-800 font-bold mb-1">
              Taruhan
            </div>
            <div className="text-base font-bold text-gray-900 mb-1">
              Rp {formatRupiah(gameState.betAmount)}
            </div>
            <input
              type="text"
              value={betInput}
              onChange={handleBetInputChange}
              onBlur={handleBetInputBlur}
              onKeyPress={handleBetInputKeyPress}
              disabled={gameState.isSpinning}
              placeholder="Masukkan jumlah"
              className="w-full text-center text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
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

      {/* Payout Table Accordion */}
      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-8">
        <button
          onClick={() => setIsPayoutsVisible(!isPayoutsVisible)}
          className="w-full flex justify-between items-center text-left text-white font-semibold"
        >
          <span>Tabel Pembayaran (Payout Table)</span>
          <span
            className={`transform transition-transform ${
              isPayoutsVisible ? 'rotate-180' : ''
            }`}
          >
            ▼
          </span>
        </button>
        {isPayoutsVisible && (
          <div className="mt-4">
            <ul className="space-y-2 text-sm">
              {Object.entries(PAYOUTS).map(
                ([combination, multiplier]) => (
                  <li
                    key={combination}
                    className="flex justify-between items-center bg-white/5 p-2 rounded-md"
                  >
                    <span className="text-lg font-mono">
                      {[...combination].join(' ')}
                    </span>
                    <span className="font-bold text-yellow-400">
                      x{multiplier}
                    </span>
                  </li>
                ),
              )}
            </ul>
            <p className="text-md text-center font-bold text-purple-200 mt-2">
              Kemenangan dihitung dari jumlah taruhan dikalikan dengan
              pengganda.
            </p>
          </div>
        )}
      </div>

      {/* Game Statistics */}
      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
        <h3 className="text-white font-semibold mb-2">
          Statistik Sesi
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="text-lg font-bold text-yellow-400">
              {gameState.totalSpins}
            </div>
            <div className="text-purple-200">Total Putaran</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-400">
              {gameState.totalWins}
            </div>
            <div className="text-purple-200">Kemenangan</div>
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
            <div className="text-purple-200">Peluang Menang</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-orange-400">
              Rp {formatRupiah(1000000 - gameState.balance)}
            </div>
            <div className="text-purple-200">Total Kerugian</div>
          </div>
        </div>
      </div>
    </div>
  );
}
