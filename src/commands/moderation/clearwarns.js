const embeds = require('../../utils/embeds');
const permissions = require('../../utils/permissions');
const moderation = require('../../utils/moderation');

module.exports = {
  name: 'clearwarns',
  description: 'Efface tous les avertissements d\'un membre',
  aliases: ['clearwarnings'],
  usage: '<@utilisateur>',
  category: 'moderation',
  cooldown: 5,
  async execute(message, args, client) {
    if (!permissions.isAdmin(message.member)) {
      return message.reply({ embeds: [embeds.error('Permission refusée', 'Vous devez être administrateur.')] });
    }
    
    const target = message.mentions.members.first();
    if (!target) {
      return message.reply({ embeds: [embeds.error('Erreur', 'Veuillez mentionner un utilisateur.')] });
    }
    
    try {
      await moderation.clearWarnings(message.guild.id, target.id);
      await moderation.logAction(message.guild.id, 'CLEAR_WARNS', target.id, message.author.id, 'Avertissements effacés');
      
      message.reply({ embeds: [embeds.success('Succès', `Les avertissements de ${target.user.tag} ont été effacés.`)] });
    } catch (error) {
      console.error('[CLEARWARNS] Error:', error);
      message.reply({ embeds: [embeds.error('Erreur', 'Une erreur est survenue.')] });
    }
  }
};
