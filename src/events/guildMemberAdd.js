const serverConfig = require('../utils/serverConfig');
const antiRaid = require('../utils/antiRaid');
const embeds = require('../utils/embeds');

module.exports = {
  name: 'guildMemberAdd',
  async execute(member, client) {
    let config = await serverConfig.getConfig(member.guild.id);
    if (!config) {
      config = await serverConfig.createConfig(member.guild.id, member.guild.ownerId);
    }
    
    if (config.anti_raid_enabled) {
      const raidResult = await antiRaid.checkJoinRaid(member, client);
      
      if (raidResult.isRaid) {
        if (config.log_channel) {
          const logChannel = member.guild.channels.cache.get(config.log_channel);
          if (logChannel) {
            logChannel.send({
              embeds: [embeds.antiRaid('Raid Détecté', `${member.user.tag} a été ${raidResult.action} - Raison: ${raidResult.reason}`)]
            });
          }
        }
      }
    }
  }
};
