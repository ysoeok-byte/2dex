const embeds = require('../../utils/embeds');
const permissions = require('../../utils/permissions');
const moderation = require('../../utils/moderation');

module.exports = {
  name: 'kick',
  description: 'Expulse un membre du serveur',
  aliases: ['expulser'],
  usage: '<@utilisateur> [raison]',
  category: 'moderation',
  cooldown: 5,
  async execute(message, args, client) {
    if (!permissions.isModerator(message.member)) {
      return message.reply({ embeds: [embeds.error('Permission refusée', 'Vous devez avoir la permission de modérer les membres.')] });
    }
    
    const target = message.mentions.members.first();
    if (!target) {
      return message.reply({ embeds: [embeds.error('Erreur', 'Veuillez mentionner un utilisateur à expulser.')] });
    }
    
    if (!permissions.canModerate(message.member, target)) {
      return message.reply({ embeds: [embeds.error('Erreur', 'Vous ne pouvez pas expulser cet utilisateur.')] });
    }
    
    if (!target.kickable) {
      return message.reply({ embeds: [embeds.error('Erreur', 'Je ne peux pas expulser cet utilisateur.')] });
    }
    
    const reason = args.slice(1).join(' ') || 'Aucune raison fournie';
    
    try {
      await target.kick(reason);
      await moderation.logAction(message.guild.id, 'KICK', target.id, message.author.id, reason);
      
      message.reply({ embeds: [embeds.moderation('Expulsion', target, message.member, reason)] });
    } catch (error) {
      console.error('[KICK] Error:', error);
      message.reply({ embeds: [embeds.error('Erreur', 'Une erreur est survenue lors de l\'expulsion.')] });
    }
  }
};
