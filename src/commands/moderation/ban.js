const embeds = require('../../utils/embeds');
const permissions = require('../../utils/permissions');
const moderation = require('../../utils/moderation');

module.exports = {
  name: 'ban',
  description: 'Bannit un membre du serveur',
  aliases: ['bannir'],
  usage: '<@utilisateur> [raison]',
  category: 'moderation',
  cooldown: 5,
  async execute(message, args, client) {
    if (!permissions.isModerator(message.member)) {
      return message.reply({ embeds: [embeds.error('Permission refusée', 'Vous devez avoir la permission de bannir des membres.')] });
    }
    
    const target = message.mentions.members.first();
    if (!target) {
      return message.reply({ embeds: [embeds.error('Erreur', 'Veuillez mentionner un utilisateur à bannir.')] });
    }
    
    if (!permissions.canModerate(message.member, target)) {
      return message.reply({ embeds: [embeds.error('Erreur', 'Vous ne pouvez pas bannir cet utilisateur.')] });
    }
    
    if (!target.bannable) {
      return message.reply({ embeds: [embeds.error('Erreur', 'Je ne peux pas bannir cet utilisateur.')] });
    }
    
    const reason = args.slice(1).join(' ') || 'Aucune raison fournie';
    
    try {
      await target.ban({ reason, deleteMessageDays: 1 });
      await moderation.logAction(message.guild.id, 'BAN', target.id, message.author.id, reason);
      
      message.reply({ embeds: [embeds.moderation('Bannissement', target, message.member, reason)] });
    } catch (error) {
      console.error('[BAN] Error:', error);
      message.reply({ embeds: [embeds.error('Erreur', 'Une erreur est survenue lors du bannissement.')] });
    }
  }
};
