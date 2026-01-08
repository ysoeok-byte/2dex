const embeds = require('../../utils/embeds');
const permissions = require('../../utils/permissions');
const moderation = require('../../utils/moderation');

module.exports = {
  name: 'tempban',
  description: 'Bannit temporairement un utilisateur',
  usage: '<@utilisateur> <durée (ex: 1d, 1h)> [raison]',
  category: 'moderation',
  async execute(message, args, client) {
    if (!permissions.isModerator(message.member)) return message.reply({ embeds: [embeds.error('Permission refusée', 'Vous devez être modérateur.')] });
    const target = message.mentions.members.first();
    if (!target) return message.reply({ embeds: [embeds.error('Erreur', 'Mentionnez un utilisateur.')] });
    const durationStr = args[1];
    if (!durationStr) return message.reply({ embeds: [embeds.error('Erreur', 'Fournissez une durée (ex: 1d, 1h).')] });
    
    const ms = require('ms'); // Need to ensure ms is installed or use a simple parser
    const duration = ms(durationStr);
    if (!duration) return message.reply({ embeds: [embeds.error('Erreur', 'Durée invalide.')] });

    const reason = args.slice(2).join(' ') || 'Tempban';
    try {
      await target.ban({ reason });
      message.reply({ embeds: [embeds.success('Tempban', `${target.user.tag} a été banni pour ${durationStr}.`)] });
      setTimeout(async () => {
        try { await message.guild.members.unban(target.id, 'Fin du tempban'); } catch(e) {}
      }, duration);
    } catch (e) {
      message.reply({ embeds: [embeds.error('Erreur', 'Impossible de bannir cet utilisateur.')] });
    }
  }
};
