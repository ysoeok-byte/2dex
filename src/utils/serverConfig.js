const db = require('../database/db');

const getConfig = async (guildId) => {
  const result = await db.query(
    'SELECT * FROM server_configs WHERE guild_id = $1',
    [guildId]
  );
  return result.rows[0] || null;
};

const createConfig = async (guildId, ownerId) => {
  await db.query(
    'INSERT INTO server_configs (guild_id, owner_id) VALUES ($1, $2) ON CONFLICT (guild_id) DO NOTHING',
    [guildId, ownerId]
  );
  return await getConfig(guildId);
};

const updateConfig = async (guildId, updates) => {
  const fields = [];
  const values = [];
  let paramIndex = 1;
  
  for (const [key, value] of Object.entries(updates)) {
    fields.push(`${key} = $${paramIndex}`);
    values.push(value);
    paramIndex++;
  }
  
  fields.push(`updated_at = CURRENT_TIMESTAMP`);
  values.push(guildId);
  
  await db.query(
    `UPDATE server_configs SET ${fields.join(', ')} WHERE guild_id = $${paramIndex}`,
    values
  );
  
  return await getConfig(guildId);
};

const setLogChannel = async (guildId, channelId) => {
  return await updateConfig(guildId, { log_channel: channelId });
};

const setMuteRole = async (guildId, roleId) => {
  return await updateConfig(guildId, { mute_role: roleId });
};

const toggleAntiRaid = async (guildId, enabled) => {
  return await updateConfig(guildId, { anti_raid_enabled: enabled });
};

const toggleAntiSpam = async (guildId, enabled) => {
  return await updateConfig(guildId, { anti_spam_enabled: enabled });
};

module.exports = {
  getConfig,
  createConfig,
  updateConfig,
  setLogChannel,
  setMuteRole,
  toggleAntiRaid,
  toggleAntiSpam
};
