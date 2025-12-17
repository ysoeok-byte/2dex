const embeds = require('../../utils/embeds');
const permissions = require('../../utils/permissions');
const moderation = require('../../utils/moderation');

module.exports = {
  name: 'unban',
  description: 'Débannit un utilisateur du serveur',
  aliases: ['debannir'],
  usage: '<ID utilisateur>',
  category: 'moderation',
  cooldown: 5,
  async execute(message, args, client) {
    if (!permissions.isAdmin(message.member)) {
      return message.reply({ embeds: [embeds.error('Permission refusée', 'Vous devez être administrateur.')] });
    }
    
    const userId = args[0];
    if (!userId) {
      return message.reply({ embeds: [embeds.error('Erreur', 'Veuillez fournir l\'ID de l\'utilisateur à débannir.')] });
    }
    
    try {
      await message.guild.members.unban(userId);
      await moderation.logAction(message.guild.id, 'UNBAN', userId, message.author.id, 'Débannissement');
      
      message.reply({ embeds: [embeds.success('Débannissement', `L'utilisateur <@${userId}> a été débanni.`)] });
    } catch (error) {
      console.error('[UNBAN] Error:', error);
      message.reply({ embeds: [embeds.error('Erreur', 'Utilisateur non trouvé dans la liste des bannis.')] });
    }
  }
};
