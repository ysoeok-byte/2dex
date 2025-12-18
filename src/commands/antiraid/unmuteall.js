const embeds = require('../../utils/embeds');
const permissions = require('../../utils/permissions');
const premium = require('../../utils/premium');
const moderation = require('../../utils/moderation');

module.exports = {
  name: 'unmuteall',
  description: 'Retire le mute à tous les membres (Premium)',
  aliases: ['umaall'],
  usage: '',
  category: 'antiraid',
  premiumOnly: true,
  cooldown: 30,
  async execute(message, args, client) {
    if (!permissions.isAdmin(message.member)) {
      return message.reply({ embeds: [embeds.error('Permission refusée', 'Vous devez être administrateur.')] });
    }
    
    const isPremiumServer = await premium.isServerPremium(message.guild);
    if (!isPremiumServer) {
      return message.reply({
        embeds: [embeds.premium('Fonctionnalité Premium', 'Unmute all est une fonctionnalité Premium.')] });
    }
    
    const members = await message.guild.members.fetch();
    let unmuted = 0;
    let failed = 0;
    
    const status = await message.channel.send({
      embeds: [embeds.antiRaid('Unmute All', `Retrait de la sourdine en cours... 0/${members.size}`)]
    });
    
    for (const [, member] of members) {
      if (member.communicationDisabledUntil && member.communicationDisabledUntil > new Date()) {
        try {
          await member.timeout(null);
          await moderation.logAction(message.guild.id, 'UNMUTE_ALL', member.id, message.author.id, 'Unmute all');
          unmuted++;
        } catch (error) {
          failed++;
        }
        
        if ((unmuted + failed) % 10 === 0) {
          await status.edit({
            embeds: [embeds.antiRaid('Unmute All', `Retrait de la sourdine en cours... ${unmuted + failed}/${members.size}`)]
          });
        }
      }
    }
    
    status.edit({
      embeds: [embeds.antiRaid('Unmute All Terminé', 
        `**Unmutés:** ${unmuted}\n**Échoués:** ${failed}`
      )]
    });
  }
};
