import { useGame, OutcomeOverride } from '../context/GameContext';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function AdminPanel() {
  const { gameState, setOutcomeOverride } = useGame();
  const [selectedOverride, setSelectedOverride] =
    useState<OutcomeOverride>('RNG');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(true);
  const router = useRouter();

  const ADMIN_PASSWORD =
    process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin123'; // In production, this should come from secure env variables

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setShowPasswordModal(false);
    } else {
      alert('Incorrect password');
      router.push('/');
    }
  };

  useEffect(() => {
    setSelectedOverride(gameState.outcomeOverride);
  }, [gameState.outcomeOverride]);

  const handleOverrideChange = async (override: OutcomeOverride) => {
    setIsUpdating(true);
    setSelectedOverride(override);
    try {
      await setOutcomeOverride(override);
    } catch (error) {
      console.error('Failed to update settings:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-2 md:p-8">
      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Admin Access
            </h2>
            <p className="text-gray-600 mb-6">
              Please enter the admin password to access the control
              panel.
            </p>
            <form onSubmit={handlePasswordSubmit}>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
              />
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                >
                  Access Admin Panel
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/')}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Admin Content - Only show if authenticated */}
      {isAuthenticated && (
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Admin Controls */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Admin Control Panel
              </h1>
              <p className="text-gray-600 mb-8">
                This hidden panel allows you to control the outcome of
                the next spin on the main game. Use this for
                educational demonstrations only.
              </p>

              {/* Current Game State */}
              <div className="bg-gray-50 rounded-lg p-6 mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Current Game State
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      ${gameState.balance}
                    </div>
                    <div className="text-sm text-gray-600">
                      Player Balance
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      ${gameState.betAmount}
                    </div>
                    <div className="text-sm text-gray-600">
                      Current Bet
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {gameState.totalSpins}
                    </div>
                    <div className="text-sm text-gray-600">
                      Total Spins
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {gameState.totalSpins > 0
                        ? Math.round(
                            (gameState.totalWins /
                              gameState.totalSpins) *
                              100,
                          )
                        : 0}
                      %
                    </div>
                    <div className="text-sm text-gray-600">
                      Win Rate
                    </div>
                  </div>
                </div>
              </div>

              {/* Outcome Control */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
                <h2 className="text-xl font-semibold text-red-800 mb-4">
                  ⚠️ Next Spin Outcome Control
                </h2>
                <p className="text-red-700 text-sm mb-6">
                  Select how you want to control the next spin result.
                  After the forced spin occurs, the control will
                  automatically revert to Normal RNG.
                </p>

                <div className="space-y-4">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="outcome"
                      value="RNG"
                      checked={selectedOverride === 'RNG'}
                      onChange={() => handleOverrideChange('RNG')}
                      className="form-radio h-5 w-5 text-blue-600"
                      disabled={isUpdating}
                    />
                    <div>
                      <div className="font-medium text-gray-800">
                        Normal RNG (Default)
                      </div>
                      <div className="text-sm text-gray-600">
                        Game operates based on standard random
                        algorithm
                      </div>
                    </div>
                  </label>

                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="outcome"
                      value="WIN"
                      checked={selectedOverride === 'WIN'}
                      onChange={() => handleOverrideChange('WIN')}
                      className="form-radio h-5 w-5 text-green-600"
                      disabled={isUpdating}
                    />
                    <div>
                      <div className="font-medium text-gray-800">
                        Force Win
                      </div>
                      <div className="text-sm text-gray-600">
                        Next spin guaranteed to result in a winning
                        combination
                      </div>
                    </div>
                  </label>

                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="outcome"
                      value="LOSS"
                      checked={selectedOverride === 'LOSS'}
                      onChange={() => handleOverrideChange('LOSS')}
                      className="form-radio h-5 w-5 text-red-600"
                      disabled={isUpdating}
                    />
                    <div>
                      <div className="font-medium text-gray-800">
                        Force Loss
                      </div>
                      <div className="text-sm text-gray-600">
                        Next spin guaranteed to result in a
                        non-winning combination
                      </div>
                    </div>
                  </label>

                  {isUpdating && (
                    <div className="text-center text-blue-600 text-sm">
                      Updating settings...
                    </div>
                  )}
                </div>
              </div>

              {/* Current Status */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">
                  Current Status
                </h3>
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      selectedOverride === 'RNG'
                        ? 'bg-blue-500'
                        : selectedOverride === 'WIN'
                        ? 'bg-green-500'
                        : 'bg-red-500'
                    }`}
                  />
                  <span className="font-bold text-gray-800">
                    {selectedOverride === 'RNG' &&
                      'Normal Random Generation Active'}
                    {selectedOverride === 'WIN' &&
                      'Next Spin Will Be a WIN'}
                    {selectedOverride === 'LOSS' &&
                      'Next Spin Will Be a LOSS'}
                  </span>
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                  📋 Demonstration Instructions
                </h3>
                <ol className="list-decimal list-inside space-y-2 text-sm text-yellow-800">
                  <li>
                    Let the audience play the game normally for
                    several spins to show typical random results
                  </li>
                  <li>
                    Discreetly open this admin panel in a new tab
                    (audience should not see this)
                  </li>
                  <li>
                    Select &quot;Force Win&quot; or &quot;Force
                    Loss&quot; depending on your demonstration needs
                  </li>
                  <li>
                    Return to the main game and have the audience spin
                    again
                  </li>
                  <li>
                    The predetermined outcome will occur, creating the
                    &quot;reveal&quot; moment
                  </li>
                  <li>
                    Show this admin panel to the audience to explain
                    how the outcome was controlled
                  </li>
                  <li>
                    Discuss the implications for trust and system
                    fairness in real gambling
                  </li>
                </ol>
              </div>

              {/* Quick Actions */}
              <div className="mt-8 flex gap-4">
                <Link
                  href="/"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  Go to Main Game
                </Link>
                <button
                  onClick={() => handleOverrideChange('RNG')}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  Reset to Normal RNG
                </button>
              </div>
            </div>

            {/* Right Column - Educational Content */}
            <div className="space-y-8">
              {/* How It Works Section */}
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  How It Works
                </h2>
                <div className="mt-6 space-y-4 text-gray-700">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-800 mb-2">
                      🎰 Slot Machine Logic
                    </h3>
                    <p className="text-sm">
                      This simulator uses a weighted random system.
                      Each reel has symbols with different
                      probabilities: 🍒 (40%), 🍋 (30%), 🍊 (20%), 💎
                      (8%), and 🎰 (2%).
                    </p>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="font-semibold text-green-800 mb-2">
                      💰 Payout System
                    </h3>
                    <p className="text-sm">
                      Wins are calculated based on matching symbols.
                      The rarer the symbol, the higher the payout.
                      This creates the illusion of &quot;big
                      wins&quot; while ensuring the house edge.
                    </p>
                  </div>

                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h3 className="font-semibold text-red-800 mb-2">
                      ⚠️ House Edge
                    </h3>
                    <p className="text-sm">
                      The game is designed so that over time, players
                      will lose money. This is called the &quot;house
                      edge&quot; - typically 2-15% in real gambling.
                    </p>
                  </div>

                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h3 className="font-semibold text-purple-800 mb-2">
                      🧠 Psychological Factors
                    </h3>
                    <p className="text-sm">
                      Near-misses, win celebrations, and variable
                      reward schedules are designed to keep players
                      engaged, similar to real gambling machines.
                    </p>
                  </div>
                </div>
              </div>

              {/* Payout Table Section */}
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  Payout Table
                </h2>
                <div className="mt-6">
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <h3 className="font-semibold text-gray-800 mb-3">
                      Winning Combinations (3 matching symbols)
                    </h3>
                    <div className="space-y-3 text-gray-700">
                      <div className="flex justify-between items-center py-2 px-3 bg-white rounded">
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl">🎰🎰🎰</span>
                          <span className="font-medium">
                            Triple Jackpot
                          </span>
                        </div>
                        <span className="font-bold text-green-600">
                          50x bet
                        </span>
                      </div>

                      <div className="flex justify-between items-center py-2 px-3 bg-white rounded">
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl">💎💎💎</span>
                          <span className="font-medium">
                            Triple Diamond
                          </span>
                        </div>
                        <span className="font-bold text-green-600">
                          25x bet
                        </span>
                      </div>

                      <div className="flex justify-between items-center py-2 px-3 bg-white rounded">
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl">🍊🍊🍊</span>
                          <span className="font-medium">
                            Triple Orange
                          </span>
                        </div>
                        <span className="font-bold text-green-600">
                          10x bet
                        </span>
                      </div>

                      <div className="flex justify-between items-center py-2 px-3 bg-white rounded">
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl">🍋🍋🍋</span>
                          <span className="font-medium">
                            Triple Lemon
                          </span>
                        </div>
                        <span className="font-bold text-green-600">
                          5x bet
                        </span>
                      </div>

                      <div className="flex justify-between items-center py-2 px-3 bg-white rounded">
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl">🍒🍒🍒</span>
                          <span className="font-medium">
                            Triple Cherry
                          </span>
                        </div>
                        <span className="font-bold text-green-600">
                          3x bet
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-semibold text-yellow-800 mb-2">
                      📊 Probability Analysis
                    </h4>
                    <p className="text-sm text-yellow-800">
                      While high payouts look attractive, remember
                      that 🎰 symbols only appear 2% of the time per
                      reel. The chance of hitting 🎰🎰🎰 is only
                      0.008% (1 in 12,500 spins).
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
