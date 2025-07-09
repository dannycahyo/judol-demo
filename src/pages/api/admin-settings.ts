import { NextApiRequest, NextApiResponse } from 'next';
import { updateGameSettings, initializeDatabase } from '../../lib/db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Initialize database on first request
    await initializeDatabase();

    const { outcomeOverride } = req.body;

    // Validate outcome override value
    if (!['RNG', 'WIN', 'LOSS'].includes(outcomeOverride)) {
      return res
        .status(400)
        .json({ error: 'Invalid outcome override value' });
    }

    const result = await updateGameSettings(outcomeOverride);

    res.status(200).json(result);
  } catch (error) {
    console.error('Error in admin-settings API:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
