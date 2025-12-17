const embeds = require('../../utils/embeds');
const permissions = require('../../utils/permissions');
const moderation = require('../../utils/moderation');

module.exports = {
  name: 'unmute',
  description: 'Retire le mute d\'un membre',
  aliases: ['untimeout'],
  usage: '<@utilisateur>',
  category: 'moderation',
  cooldown: 5,
  async execute(message, args, client) {
    if (!permissions.isModerator(message.member)) {
      return message.reply({ embeds: [embeds.error('Permission refusée', 'Vous devez être modérateur.')] });
    }
    
    const target = message.mentions.members.first();
    if (!target) {
      return message.reply({ embeds: [embeds.error('Erreur', 'Veuillez mentionner un utilisateur.')] });
    }
    
    try {
      await target.timeout(null);
      await moderation.logAction(message.guild.id, 'UNMUTE', target.id, message.author.id, 'Unmute');
      
      message.reply({ embeds: [embeds.success('Unmute', `${target.user.tag} peut à nouveau parler.`)] });
    } catch (error) {
      console.error('[UNMUTE] Error:', error);
      message.reply({ embeds: [embeds.error('Erreur', 'Une erreur est survenue.')] });
    }
  }
};
