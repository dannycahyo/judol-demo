import { NextApiRequest, NextApiResponse } from 'next';
import { getGameSettings, initializeDatabase } from '../../lib/db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Initialize database on first request
    await initializeDatabase();

    const settings = await getGameSettings();

    res.status(200).json({
      outcomeOverride: settings.outcomeOverride,
      updatedAt: settings.updatedAt,
    });
  } catch (error) {
    console.error('Error in game-settings API:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
