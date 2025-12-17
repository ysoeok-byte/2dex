const db = require('../database/db');
const { v4: uuidv4 } = require('uuid');

const generateCode = async (creatorId, durationDays) => {
  const code = `PREM-${uuidv4().substring(0, 8).toUpperCase()}-${uuidv4().substring(0, 4).toUpperCase()}`;
  await db.query(
    'INSERT INTO premium_codes (code, duration_days, created_by) VALUES ($1, $2, $3)',
    [code, durationDays, creatorId]
  );
  return code;
};

const redeemCode = async (userId, code) => {
  const result = await db.query(
    'SELECT * FROM premium_codes WHERE code = $1 AND is_used = FALSE',
    [code]
  );
  
  if (result.rows.length === 0) {
    return { success: false, message: 'Code invalide ou déjà utilisé.' };
  }
  
  const codeData = result.rows[0];
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + codeData.duration_days);
  
  const existingPremium = await db.query(
    'SELECT * FROM premium_users WHERE user_id = $1',
    [userId]
  );
  
  if (existingPremium.rows.length > 0) {
    const currentExpiry = new Date(existingPremium.rows[0].expires_at);
    if (currentExpiry > new Date()) {
      expiresAt.setDate(expiresAt.getDate() + Math.ceil((currentExpiry - new Date()) / (1000 * 60 * 60 * 24)));
    }
    await db.query(
      'UPDATE premium_users SET expires_at = $1, code_used = $2 WHERE user_id = $3',
      [expiresAt, code, userId]
    );
  } else {
    await db.query(
      'INSERT INTO premium_users (user_id, expires_at, code_used) VALUES ($1, $2, $3)',
      [userId, expiresAt, code]
    );
  }
  
  await db.query(
    'UPDATE premium_codes SET is_used = TRUE, used_by = $1, used_at = CURRENT_TIMESTAMP WHERE code = $2',
    [userId, code]
  );
  
  await db.query('UPDATE bot_stats SET total_premium_activated = total_premium_activated + 1, updated_at = CURRENT_TIMESTAMP');
  
  return { success: true, expiresAt, durationDays: codeData.duration_days };
};

const isPremium = async (userId) => {
  const result = await db.query(
    'SELECT * FROM premium_users WHERE user_id = $1 AND expires_at > CURRENT_TIMESTAMP',
    [userId]
  );
  return result.rows.length > 0;
};

const getPremiumInfo = async (userId) => {
  const result = await db.query(
    'SELECT * FROM premium_users WHERE user_id = $1',
    [userId]
  );
  if (result.rows.length === 0) return null;
  return result.rows[0];
};

const isServerPremium = async (guild) => {
  if (!guild) return false;
  const owner = await guild.fetchOwner();
  return await isPremium(owner.id);
};

const getAllCodes = async () => {
  const result = await db.query('SELECT * FROM premium_codes ORDER BY created_at DESC');
  return result.rows;
};

const getUnusedCodes = async () => {
  const result = await db.query('SELECT * FROM premium_codes WHERE is_used = FALSE ORDER BY created_at DESC');
  return result.rows;
};

const getAllPremiumUsers = async () => {
  const result = await db.query('SELECT * FROM premium_users ORDER BY activated_at DESC');
  return result.rows;
};

const revokePremium = async (userId) => {
  await db.query('DELETE FROM premium_users WHERE user_id = $1', [userId]);
  return true;
};

module.exports = {
  generateCode,
  redeemCode,
  isPremium,
  getPremiumInfo,
  isServerPremium,
  getAllCodes,
  getUnusedCodes,
  getAllPremiumUsers,
  revokePremium
};
