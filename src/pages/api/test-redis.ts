import { NextApiRequest, NextApiResponse } from 'next';
import { publishGameEvent } from '../../lib/db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🧪 Test: Publishing manual Redis event');
    await publishGameEvent('settings_changed', {
      outcomeOverride: 'WIN',
      updatedAt: Date.now(),
    });

    res.status(200).json({ message: 'Test event published' });
  } catch (error) {
    console.error('Error in test API:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
