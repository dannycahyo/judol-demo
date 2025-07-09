import { NextApiRequest, NextApiResponse } from 'next';
import { getGameSettings } from '../../lib/db';
import { createClient } from 'redis';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Set SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control',
  });

  const sendEvent = (data: unknown) => {
    try {
      const jsonString = JSON.stringify(data);
      res.write(`data: ${jsonString}\n\n`);

      // Force flush the data immediately
      // Using type assertion since flush() is available but not in the type definition
      const resWithFlush = res as NextApiResponse & {
        flush?: () => void;
      };
      if (typeof resWithFlush.flush === 'function') {
        resWithFlush.flush();
      }
    } catch (error) {
      console.error('Error stringifying SSE data:', error);
    }
  };

  // Send initial connection message
  sendEvent({
    type: 'connected',
    timestamp: Date.now(),
    message: 'SSE connection established',
  });

  // Send current game settings
  try {
    const settings = await getGameSettings();
    sendEvent({
      type: 'settings_changed',
      outcomeOverride: settings.outcomeOverride,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Error fetching current settings:', error);
  }

  // Create a dedicated Redis subscriber for this SSE connection
  let subscriber: ReturnType<typeof createClient> | null = null;

  try {
    subscriber = createClient({
      url: process.env.REDIS_URL,
    });

    subscriber.on('error', (err) => {
      console.error('Redis Subscriber Error:', err);
    });

    subscriber.on('connect', () => {
      // Redis connected
    });

    await subscriber.connect();

    // Subscribe to game events
    await subscriber.subscribe('game:events', (message: string) => {
      try {
        const { event, data, timestamp } = JSON.parse(message);
        sendEvent({
          type: event,
          ...data,
          timestamp,
        });
      } catch (error) {
        console.error('Error parsing Redis message:', error);
      }
    });

    // Keep connection alive with heartbeat
    const heartbeat = setInterval(() => {
      sendEvent({
        type: 'heartbeat',
        timestamp: Date.now(),
      });
    }, 30000); // Every 30 seconds

    // Clean up when client disconnects
    const cleanup = async () => {
      clearInterval(heartbeat);
      if (subscriber) {
        try {
          await subscriber.unsubscribe();
          await subscriber.quit();
        } catch (error) {
          console.error('Error cleaning up Redis subscriber:', error);
        }
      }
      res.end();
    };

    req.on('close', cleanup);
    req.on('aborted', cleanup);
  } catch (error) {
    console.error('Error setting up Redis subscription:', error);
    sendEvent({
      type: 'error',
      message: 'Failed to establish real-time connection',
      timestamp: Date.now(),
    });
    res.end();
  }
}
