const embeds = require('../../utils/embeds');
const permissions = require('../../utils/permissions');
const moderation = require('../../utils/moderation');

module.exports = {
  name: 'role',
  description: 'Ajoute ou retire un rôle à un membre',
  aliases: ['addrole', 'removerole'],
  usage: '<add/remove> <@utilisateur> <@rôle> [raison]',
  category: 'moderation',
  cooldown: 5,
  async execute(message, args, client) {
    if (!permissions.isAdmin(message.member)) {
      return message.reply({ embeds: [embeds.error('Permission refusée', 'Vous devez être administrateur.')] });
    }
    
    const action = args[0]?.toLowerCase();
    if (!action || !['add', 'remove'].includes(action)) {
      return message.reply({ embeds: [embeds.error('Erreur', 'Utilisez: `!role add/remove @user @role`')] });
    }
    
    const member = message.mentions.members.at(0);
    const role = message.mentions.roles.at(0);
    
    if (!member || !role) {
      return message.reply({ embeds: [embeds.error('Erreur', 'Veuillez mentionner un utilisateur et un rôle.')] });
    }
    
    const reason = args.slice(1).join(' ') || 'Gestion de rôle';
    
    try {
      if (action === 'add') {
        if (member.roles.cache.has(role.id)) {
          return message.reply({ embeds: [embeds.error('Erreur', `${member.user.tag} a déjà le rôle ${role}.`)] });
        }
        await member.roles.add(role, reason);
        await moderation.logAction(message.guild.id, 'ROLE_ADD', member.id, message.author.id, `Rôle ajouté: ${role.name}`);
        message.reply({
          embeds: [embeds.success('Rôle ajouté', `${role} ajouté à ${member.user.tag}`)]
        });
      } else {
        if (!member.roles.cache.has(role.id)) {
          return message.reply({ embeds: [embeds.error('Erreur', `${member.user.tag} n'a pas le rôle ${role}.`)] });
        }
        await member.roles.remove(role, reason);
        await moderation.logAction(message.guild.id, 'ROLE_REMOVE', member.id, message.author.id, `Rôle retiré: ${role.name}`);
        message.reply({
          embeds: [embeds.success('Rôle retiré', `${role} retiré à ${member.user.tag}`)]
        });
      }
    } catch (error) {
      console.error('[ROLE] Error:', error);
      message.reply({ embeds: [embeds.error('Erreur', 'Une erreur est survenue.')] });
    }
  }
};
