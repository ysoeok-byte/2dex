const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const init = async () => {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS premium_codes (
        id SERIAL PRIMARY KEY,
        code VARCHAR(50) UNIQUE NOT NULL,
        duration_days INTEGER NOT NULL,
        created_by VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        used_by VARCHAR(50),
        used_at TIMESTAMP,
        is_used BOOLEAN DEFAULT FALSE
      );
      
      CREATE TABLE IF NOT EXISTS premium_users (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(50) UNIQUE NOT NULL,
        activated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP NOT NULL,
        code_used VARCHAR(50)
      );
      
      CREATE TABLE IF NOT EXISTS server_configs (
        id SERIAL PRIMARY KEY,
        guild_id VARCHAR(50) UNIQUE NOT NULL,
        owner_id VARCHAR(50) NOT NULL,
        prefix VARCHAR(10) DEFAULT '!',
        log_channel VARCHAR(50),
        mute_role VARCHAR(50),
        anti_raid_enabled BOOLEAN DEFAULT FALSE,
        anti_spam_enabled BOOLEAN DEFAULT FALSE,
        max_joins_per_minute INTEGER DEFAULT 10,
        max_messages_per_second INTEGER DEFAULT 5,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS warnings (
        id SERIAL PRIMARY KEY,
        guild_id VARCHAR(50) NOT NULL,
        user_id VARCHAR(50) NOT NULL,
        moderator_id VARCHAR(50) NOT NULL,
        reason TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS moderation_logs (
        id SERIAL PRIMARY KEY,
        guild_id VARCHAR(50) NOT NULL,
        action VARCHAR(50) NOT NULL,
        target_id VARCHAR(50) NOT NULL,
        moderator_id VARCHAR(50) NOT NULL,
        reason TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS bot_stats (
        id SERIAL PRIMARY KEY,
        total_commands INTEGER DEFAULT 0,
        total_premium_activated INTEGER DEFAULT 0,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      INSERT INTO bot_stats (total_commands, total_premium_activated)
      SELECT 0, 0
      WHERE NOT EXISTS (SELECT 1 FROM bot_stats);
    `);
    console.log('[DB] Tables created/verified successfully');
  } finally {
    client.release();
  }
};

const query = async (text, params) => {
  const result = await pool.query(text, params);
  return result;
};

module.exports = { init, query, pool };
