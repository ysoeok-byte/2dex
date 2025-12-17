const { EmbedBuilder } = require('discord.js');
const config = require('../../config');
const premium = require('../../utils/premium');

module.exports = {
  name: 'userinfo',
  description: 'Affiche les informations d\'un utilisateur',
  aliases: ['ui', 'user', 'whois'],
  usage: '[@utilisateur]',
  category: 'general',
  cooldown: 5,
  async execute(message, args, client) {
    const member = message.mentions.members.first() || message.member;
    const isPremiumUser = await premium.isPremium(member.id);
    
    const embed = new EmbedBuilder()
      .setColor(isPremiumUser ? config.premiumColor : config.embedColor)
      .setTitle(member.user.tag)
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 512 }))
      .addFields(
        { name: '🆔 ID', value: member.id, inline: true },
        { name: '📅 Compte créé', value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`, inline: true },
        { name: '📥 A rejoint', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`, inline: true },
        { name: '🎭 Rôles', value: member.roles.cache.filter(r => r.id !== message.guild.id).map(r => r.toString()).join(', ') || 'Aucun', inline: false },
        { name: '⭐ Premium', value: isPremiumUser ? 'Oui' : 'Non', inline: true }
      )
      .setTimestamp();
    
    message.reply({ embeds: [embed] });
  }
};
