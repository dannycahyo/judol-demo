import { createClient } from 'redis';
import type { RedisClientType } from 'redis';

let redis: RedisClientType | null = null;

const GAME_SETTINGS_KEY = 'game:settings';
const GAME_EVENTS_CHANNEL = 'game:events';

export interface GameEventData {
  outcomeOverride?: 'RNG' | 'WIN' | 'LOSS';
  updatedAt?: number;
  [key: string]: unknown;
}

export async function getRedisClient(): Promise<RedisClientType> {
  if (!redis) {
    redis = createClient({
      url: process.env.REDIS_URL,
    });

    redis.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });

    redis.on('connect', () => {
      console.log('Redis Client Connected');
    });

    await redis.connect();
  }

  return redis;
}

export async function initializeDatabase() {
  try {
    const client = await getRedisClient();

    // Check if game settings exist, if not, set default
    const exists = await client.exists(GAME_SETTINGS_KEY);
    if (!exists) {
      await client.hSet(GAME_SETTINGS_KEY, {
        outcomeOverride: 'RNG',
        updatedAt: Date.now().toString(),
      });
      console.log('Initialized default game settings in Redis');
    }

    console.log('Redis initialized successfully');
  } catch (error) {
    console.error('Error initializing Redis:', error);
    throw error;
  }
}

export async function getGameSettings() {
  try {
    const client = await getRedisClient();
    const settings = await client.hGetAll(GAME_SETTINGS_KEY);

    return {
      outcomeOverride: (settings.outcomeOverride || 'RNG') as
        | 'RNG'
        | 'WIN'
        | 'LOSS',
      updatedAt: settings.updatedAt
        ? parseInt(settings.updatedAt)
        : Date.now(),
    };
  } catch (error) {
    console.error('Error getting game settings from Redis:', error);
    return { outcomeOverride: 'RNG' as const, updatedAt: Date.now() };
  }
}

export async function updateGameSettings(
  outcomeOverride: 'RNG' | 'WIN' | 'LOSS',
) {
  try {
    const client = await getRedisClient();
    const updatedAt = Date.now();

    // Update settings in Redis
    await client.hSet(GAME_SETTINGS_KEY, {
      outcomeOverride,
      updatedAt: updatedAt.toString(),
    });

    // Publish event to notify all connected clients
    await publishGameEvent('settings_changed', {
      outcomeOverride,
      updatedAt,
    });

    return { success: true, outcomeOverride, updatedAt };
  } catch (error) {
    console.error('Error updating game settings in Redis:', error);
    throw error;
  }
}

export async function publishGameEvent(
  event: string,
  data: GameEventData,
) {
  try {
    // Create a separate client for publishing to avoid connection conflicts
    const publishClient = createClient({
      url: process.env.REDIS_URL,
    });

    await publishClient.connect();

    const message = JSON.stringify({
      event,
      data,
      timestamp: Date.now(),
    });
    console.log(`📢 Publishing Redis event: ${event}`, message);
    const result = await publishClient.publish(
      GAME_EVENTS_CHANNEL,
      message,
    );
    console.log(`📢 Published to ${result} subscribers`);

    await publishClient.quit();
  } catch (error) {
    console.error('Error publishing game event:', error);
  }
}

export async function subscribeToGameEvents(
  callback: (event: string, data: GameEventData) => void,
) {
  try {
    const subscriber = await getRedisClient();

    await subscriber.subscribe(GAME_EVENTS_CHANNEL, (message) => {
      try {
        const { event, data } = JSON.parse(message);
        callback(event, data);
      } catch (error) {
        console.error('Error parsing game event message:', error);
      }
    });

    return subscriber;
  } catch (error) {
    console.error('Error subscribing to game events:', error);
    throw error;
  }
}

// Clean up function for Redis connections
export async function closeRedisConnection() {
  if (redis) {
    await redis.quit();
    redis = null;
  }
}
