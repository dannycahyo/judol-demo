import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function initializeDatabase() {
  try {
    // Create game_settings table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS game_settings (
        id SERIAL PRIMARY KEY,
        outcome_override VARCHAR(10) NOT NULL DEFAULT 'RNG',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Insert default setting if table is empty
    const existing = await sql`SELECT * FROM game_settings LIMIT 1`;
    if (existing.length === 0) {
      await sql`INSERT INTO game_settings (outcome_override) VALUES ('RNG')`;
    }

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

export async function getGameSettings() {
  try {
    const result = await sql`
      SELECT outcome_override 
      FROM game_settings 
      ORDER BY id DESC 
      LIMIT 1
    `;

    return result[0]?.outcome_override || 'RNG';
  } catch (error) {
    console.error('Error getting game settings:', error);
    return 'RNG';
  }
}

export async function updateGameSettings(outcomeOverride: string) {
  try {
    // First ensure we have exactly one settings record
    const existing = await sql`SELECT id FROM game_settings LIMIT 1`;

    if (existing.length === 0) {
      // Insert first record
      await sql`
        INSERT INTO game_settings (outcome_override) 
        VALUES (${outcomeOverride})
      `;
    } else {
      // Update the existing record
      await sql`
        UPDATE game_settings 
        SET outcome_override = ${outcomeOverride}, 
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ${existing[0].id}
      `;
    }

    return { success: true, outcomeOverride };
  } catch (error) {
    console.error('Error updating game settings:', error);
    throw error;
  }
}
