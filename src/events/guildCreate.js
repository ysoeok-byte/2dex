const serverConfig = require('../utils/serverConfig');

module.exports = {
  name: 'guildCreate',
  async execute(guild, client) {
    console.log(`[BOT] Joined new guild: ${guild.name} (${guild.id})`);
    await serverConfig.createConfig(guild.id, guild.ownerId);
  }
};
