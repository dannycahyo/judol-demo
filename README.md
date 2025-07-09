# Responsible Gambling Simulator

An educational slot machine simulator designed to demonstrate the mechanics of gambling games and how outcomes can be controlled. This application serves as a powerful tool for educators, counselors, and presenters to discuss gambling awareness and system fairness.

## 🎯 Purpose

This application is an educational demo that:

- Demonstrates how slot machines work (RNG, RTP, House Edge)
- Shows that gambling outcomes are controlled by the system, not the player
- Provides a safe environment to understand gambling mechanics without financial risk
- Includes a hidden admin panel for powerful presentation moments

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Neon Database account (for persistent admin controls)

### Environment Setup

1. Create a `.env` file in the root directory
2. Add your Neon database connection string:

```bash
DATABASE_URL=postgresql://[your-neon-connection-string]
```

### Installation

1. Clone the repository and navigate to the project directory
2. Install dependencies:

```bash
npm install
```

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

The database will be automatically initialized on first API request.

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🎮 How to Use

### For Players (Educational Experience)

1. Visit the main page at `http://localhost:3000`
2. Use the slot machine interface:
   - Adjust bet amount with +/- buttons
   - Click "SPIN" to play
   - View your balance, wins, and statistics
3. Learn about gambling mechanics:
   - Click "How It Works" to understand RNG and RTP
   - Click "Payout Table" to see winning combinations
   - Observe how the house edge works over time

### For Presenters/Educators (Admin Features)

1. Let audience members play normally for several spins
2. Discreetly navigate to `http://localhost:3000/admin`
3. Use the Admin Control Panel to:
   - View current game statistics
   - Set next spin outcome (Win/Loss/Normal RNG)
   - Create predetermined results for demonstration
4. Return to main game and have audience spin again
5. Reveal the admin panel to show how outcomes were controlled
6. Discuss implications for trust and fairness in real gambling

## 🔧 Features

### Main Game Features

- **Slot Machine Simulation**: Classic 3-reel slot with multiple symbols
- **Realistic Game Mechanics**:
  - Configurable bet amounts
  - Balance tracking
  - Win/loss calculations
  - Session statistics
- **Educational Content**:
  - RNG and RTP explanations
  - Detailed payout table
  - Real-time statistics showing house edge
- **Visual Effects**:
  - Spinning animations
  - Win celebrations
  - Modern, attractive UI

### Admin Panel Features

- **Global Outcome Control**: Force next spin to win, lose, or use normal RNG (affects ALL users globally)
- **Real-time Updates**: Changes propagate to all players within 2 seconds
- **Game Monitoring**: View player's current balance, bet amount, and statistics
- **Automatic Reset**: Control reverts to normal RNG after forced spins
- **Persistent Database**: Settings stored in PostgreSQL database, not browser storage
- **Audit Trail**: Complete history of all admin interventions

## 📊 Game Mechanics

### Symbols & Payouts

- 💎💎💎: 50x bet
- 7️⃣7️⃣7️⃣: 30x bet
- ⭐⭐⭐: 20x bet
- 🔔🔔🔔: 15x bet
- 🍊🍊🍊: 10x bet
- 🍋🍋🍋: 8x bet
- 🍒🍒🍒: 5x bet
- Two-of-a-kind and single cherry combinations also pay

### RTP Configuration

- Approximately 85% Return to Player
- 15% House Edge (typical for demonstration)

## ⚠️ Disclaimer

This application is for educational purposes only. It does not involve real money and should not be used to promote gambling. The goal is to educate about gambling mechanics and promote responsible decision-making regarding gambling activities.
