const embeds = require('../../utils/embeds');
const permissions = require('../../utils/permissions');
const moderation = require('../../utils/moderation');

module.exports = {
  name: 'nick',
  description: 'Change le pseudo d\'un membre',
  aliases: ['setnick', 'nickname'],
  usage: '<@utilisateur> <nouveau pseudo>',
  category: 'moderation',
  cooldown: 5,
  async execute(message, args, client) {
    if (!permissions.isModerator(message.member)) {
      return message.reply({ embeds: [embeds.error('Permission refusée', 'Vous devez être modérateur.')] });
    }
    
    const member = message.mentions.members.first();
    if (!member) {
      return message.reply({ embeds: [embeds.error('Erreur', 'Veuillez mentionner un utilisateur.')] });
    }
    
    if (!permissions.canModerate(message.member, member)) {
      return message.reply({ embeds: [embeds.error('Erreur', 'Vous ne pouvez pas modifier ce pseudo.')] });
    }
    
    const nick = args.slice(1).join(' ');
    if (!nick) {
      return message.reply({ embeds: [embeds.error('Erreur', 'Veuillez fournir un nouveau pseudo.')] });
    }
    
    if (nick.length > 32) {
      return message.reply({ embeds: [embeds.error('Erreur', 'Le pseudo doit faire moins de 32 caractères.')] });
    }
    
    try {
      const oldNick = member.displayName;
      await member.setNickname(nick);
      await moderation.logAction(message.guild.id, 'NICK_CHANGE', member.id, message.author.id, `${oldNick} → ${nick}`);
      
      message.reply({
        embeds: [embeds.success('Pseudo changé', `${member.user.tag}: **${oldNick}** → **${nick}**`)]
      });
    } catch (error) {
      console.error('[NICK] Error:', error);
      message.reply({ embeds: [embeds.error('Erreur', 'Une erreur est survenue.')] });
    }
  }
};
