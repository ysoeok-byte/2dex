const embeds = require('../../utils/embeds');
const permissions = require('../../utils/permissions');
const premium = require('../../utils/premium');
const moderation = require('../../utils/moderation');

module.exports = {
  name: 'massban',
  description: 'Bannit plusieurs utilisateurs (Premium)',
  aliases: ['mban'],
  usage: '<@user1> <@user2> ... [raison]',
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
        embeds: [embeds.premium('Fonctionnalité Premium', 
          'Le massban est une fonctionnalité Premium.\n' +
          'Le propriétaire du serveur doit avoir un abonnement Premium actif.'
        )]
      });
    }
    
    const targets = message.mentions.members;
    if (targets.size === 0) {
      return message.reply({ embeds: [embeds.error('Erreur', 'Veuillez mentionner au moins un utilisateur à bannir.')] });
    }
    
    const reason = args.filter(a => !a.startsWith('<@')).join(' ') || 'Massban';
    let banned = 0;
    let failed = 0;
    
    const status = await message.reply({
      embeds: [embeds.antiRaid('Massban', `Bannissement en cours... 0/${targets.size}`)]
    });
    
    for (const [, target] of targets) {
      if (!permissions.canModerate(message.member, target) || !target.bannable) {
        failed++;
        continue;
      }
      
      try {
        await target.ban({ reason, deleteMessageDays: 1 });
        await moderation.logAction(message.guild.id, 'MASSBAN', target.id, message.author.id, reason);
        banned++;
      } catch (error) {
        failed++;
        console.error(`[MASSBAN] Error banning ${target.user.tag}:`, error);
      }
    }
    
    status.edit({
      embeds: [embeds.antiRaid('Massban terminé', 
        `**Bannis:** ${banned}\n**Échoués:** ${failed}\n**Raison:** ${reason}`
      )]
    });
  }
};
