const { EmbedBuilder } = require('discord.js');
const config = require('../../config');
const premium = require('../../utils/premium');

module.exports = {
  name: 'serverinfo',
  description: 'Affiche les informations du serveur',
  aliases: ['si', 'server'],
  category: 'general',
  cooldown: 10,
  async execute(message, args, client) {
    const guild = message.guild;
    const isPremiumServer = await premium.isServerPremium(guild);
    
    const embed = new EmbedBuilder()
      .setColor(isPremiumServer ? config.premiumColor : config.embedColor)
      .setTitle(guild.name)
      .setThumbnail(guild.iconURL({ dynamic: true, size: 512 }))
      .addFields(
        { name: '👑 Propriétaire', value: `<@${guild.ownerId}>`, inline: true },
        { name: '📅 Créé le', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:D>`, inline: true },
        { name: '👥 Membres', value: `${guild.memberCount}`, inline: true },
        { name: '💬 Channels', value: `${guild.channels.cache.size}`, inline: true },
        { name: '🎭 Rôles', value: `${guild.roles.cache.size}`, inline: true },
        { name: '😀 Emojis', value: `${guild.emojis.cache.size}`, inline: true },
        { name: '⭐ Premium', value: isPremiumServer ? 'Oui' : 'Non', inline: true }
      )
      .setFooter({ text: `ID: ${guild.id}` })
      .setTimestamp();
    
    message.reply({ embeds: [embed] });
  }
};
