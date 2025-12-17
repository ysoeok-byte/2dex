const db = require('../database/db');

const addWarning = async (guildId, userId, moderatorId, reason) => {
  await db.query(
    'INSERT INTO warnings (guild_id, user_id, moderator_id, reason) VALUES ($1, $2, $3, $4)',
    [guildId, userId, moderatorId, reason]
  );
  
  const result = await db.query(
    'SELECT COUNT(*) as count FROM warnings WHERE guild_id = $1 AND user_id = $2',
    [guildId, userId]
  );
  
  return parseInt(result.rows[0].count);
};

const getWarnings = async (guildId, userId) => {
  const result = await db.query(
    'SELECT * FROM warnings WHERE guild_id = $1 AND user_id = $2 ORDER BY created_at DESC',
    [guildId, userId]
  );
  return result.rows;
};

const clearWarnings = async (guildId, userId) => {
  await db.query(
    'DELETE FROM warnings WHERE guild_id = $1 AND user_id = $2',
    [guildId, userId]
  );
};

const removeWarning = async (warningId) => {
  await db.query('DELETE FROM warnings WHERE id = $1', [warningId]);
};

const logAction = async (guildId, action, targetId, moderatorId, reason) => {
  await db.query(
    'INSERT INTO moderation_logs (guild_id, action, target_id, moderator_id, reason) VALUES ($1, $2, $3, $4, $5)',
    [guildId, action, targetId, moderatorId, reason]
  );
  
  await db.query('UPDATE bot_stats SET total_commands = total_commands + 1, updated_at = CURRENT_TIMESTAMP');
};

const getModLogs = async (guildId, limit = 10) => {
  const result = await db.query(
    'SELECT * FROM moderation_logs WHERE guild_id = $1 ORDER BY created_at DESC LIMIT $2',
    [guildId, limit]
  );
  return result.rows;
};

module.exports = {
  addWarning,
  getWarnings,
  clearWarnings,
  removeWarning,
  logAction,
  getModLogs
};
