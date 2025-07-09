# Backend Implementation - Persistent Admin Controls

## Overview

The application now features a persistent backend that allows admin controls to affect all users globally, not just the current browser session. This ensures that when an admin sets the game outcome, it applies to all players across all devices and browsers.

## Database Schema

### Table: `game_settings`

```sql
CREATE TABLE game_settings (
  id SERIAL PRIMARY KEY,
  outcome_override VARCHAR(10) NOT NULL DEFAULT 'RNG',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

The table stores a history of all admin setting changes, with the most recent entry being the active setting.

## API Endpoints

### GET `/api/game-settings`

- **Purpose**: Retrieves the current game setting
- **Response**: `{ outcomeOverride: 'RNG' | 'WIN' | 'LOSS' }`
- **Used by**: Game frontend to check current override setting
- **Polling**: Frontend polls this endpoint every 2 seconds for real-time updates

### POST `/api/admin-settings`

- **Purpose**: Updates the game setting (admin only)
- **Request Body**: `{ outcomeOverride: 'RNG' | 'WIN' | 'LOSS' }`
- **Response**: `{ success: true, outcomeOverride: string }`
- **Used by**: Admin panel to change game behavior

## Frontend Integration

### GameContext Changes

- **Removed**: SessionStorage dependency
- **Added**: API polling every 2 seconds
- **Added**: API calls for setting changes
- **Added**: Automatic reset to 'RNG' after forced spins

### Real-time Updates

- All clients receive updates within 2 seconds
- No need to refresh pages
- Seamless experience for both players and admins

## How It Works

1. **Admin sets override**: Admin panel → POST `/api/admin-settings` → Database
2. **Players get updates**: Game frontend polls GET `/api/game-settings` every 2s
3. **Spin occurs**: If override is set, uses forced outcome
4. **Auto-reset**: After forced spin, automatically resets to 'RNG' via API
5. **Global effect**: All players see the same game behavior instantly

## Key Benefits

✅ **Global Control**: Admin settings affect ALL users, not just one browser
✅ **Real-time**: Changes propagate to all clients within 2 seconds  
✅ **Persistent**: Settings survive browser refreshes and device changes
✅ **Audit Trail**: Database keeps history of all setting changes
✅ **Reliable**: Uses proper database storage instead of local storage

## Database Provider

- **Service**: Neon Database (PostgreSQL)
- **Driver**: `@neondatabase/serverless`
- **Connection**: Automatic via DATABASE_URL environment variable

## Environment Setup

Ensure the `.env` file contains:

```
DATABASE_URL=postgresql://[your-neon-connection-string]
```

## Demo Flow Enhancement

The persistent backend greatly enhances the educational demo:

1. **Preparation**: Admin can set up game behavior before the presentation
2. **Multiple Devices**: Demo can work across multiple phones/tablets simultaneously
3. **Reliability**: No risk of settings being lost due to browser issues
4. **Scalability**: Can handle multiple concurrent players
5. **Analytics**: Database can track all admin interventions for presentation analysis

This implementation transforms the demo from a single-device proof-of-concept into a robust, multi-user educational tool that can effectively demonstrate the reality of centralized control in gambling systems.
