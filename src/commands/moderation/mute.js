const embeds = require('../../utils/embeds');
const permissions = require('../../utils/permissions');
const moderation = require('../../utils/moderation');
const serverConfig = require('../../utils/serverConfig');

module.exports = {
  name: 'mute',
  description: 'Rend muet un membre (timeout)',
  aliases: ['timeout', 'silence'],
  usage: '<@utilisateur> <durée en minutes> [raison]',
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
    
    if (!permissions.canModerate(message.member, target)) {
      return message.reply({ embeds: [embeds.error('Erreur', 'Vous ne pouvez pas mute cet utilisateur.')] });
    }
    
    const duration = parseInt(args[1]);
    if (!duration || duration < 1 || duration > 40320) {
      return message.reply({ embeds: [embeds.error('Erreur', 'Veuillez fournir une durée valide (1-40320 minutes).')] });
    }
    
    const reason = args.slice(2).join(' ') || 'Aucune raison fournie';
    
    try {
      await target.timeout(duration * 60 * 1000, reason);
      await moderation.logAction(message.guild.id, 'MUTE', target.id, message.author.id, `${duration} minutes - ${reason}`);
      
      message.reply({
        embeds: [embeds.moderation(`Mute (${duration} minutes)`, target, message.member, reason)]
      });
    } catch (error) {
      console.error('[MUTE] Error:', error);
      message.reply({ embeds: [embeds.error('Erreur', 'Une erreur est survenue.')] });
    }
  }
};
