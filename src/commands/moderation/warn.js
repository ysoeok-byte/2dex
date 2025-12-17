const embeds = require('../../utils/embeds');
const permissions = require('../../utils/permissions');
const moderation = require('../../utils/moderation');

module.exports = {
  name: 'warn',
  description: 'Avertit un membre',
  aliases: ['avertir'],
  usage: '<@utilisateur> [raison]',
  category: 'moderation',
  cooldown: 3,
  async execute(message, args, client) {
    if (!permissions.isModerator(message.member)) {
      return message.reply({ embeds: [embeds.error('Permission refusée', 'Vous devez être modérateur.')] });
    }
    
    const target = message.mentions.members.first();
    if (!target) {
      return message.reply({ embeds: [embeds.error('Erreur', 'Veuillez mentionner un utilisateur.')] });
    }
    
    if (!permissions.canModerate(message.member, target)) {
      return message.reply({ embeds: [embeds.error('Erreur', 'Vous ne pouvez pas avertir cet utilisateur.')] });
    }
    
    const reason = args.slice(1).join(' ') || 'Aucune raison fournie';
    
    try {
      const warnCount = await moderation.addWarning(message.guild.id, target.id, message.author.id, reason);
      await moderation.logAction(message.guild.id, 'WARN', target.id, message.author.id, reason);
      
      message.reply({
        embeds: [embeds.moderation(`Avertissement #${warnCount}`, target, message.member, reason)]
      });
      
      try {
        await target.send({
          embeds: [embeds.error('Avertissement', `Vous avez reçu un avertissement sur **${message.guild.name}**\nRaison: ${reason}\nTotal: ${warnCount} avertissement(s)`)]
        });
      } catch (e) {}
    } catch (error) {
      console.error('[WARN] Error:', error);
      message.reply({ embeds: [embeds.error('Erreur', 'Une erreur est survenue.')] });
    }
  }
};
