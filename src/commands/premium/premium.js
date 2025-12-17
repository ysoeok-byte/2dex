const { EmbedBuilder } = require('discord.js');
const embeds = require('../../utils/embeds');
const premium = require('../../utils/premium');
const config = require('../../config');

module.exports = {
  name: 'premium',
  description: 'Affiche les informations premium',
  aliases: ['prem', 'vip'],
  usage: '',
  category: 'premium',
  cooldown: 10,
  async execute(message, args, client) {
    const isPremiumUser = await premium.isPremium(message.author.id);
    const premiumInfo = await premium.getPremiumInfo(message.author.id);
    const isPremiumServer = await premium.isServerPremium(message.guild);
    
    const embed = new EmbedBuilder()
      .setColor(isPremiumUser ? config.premiumColor : config.embedColor)
      .setTitle('⭐ Premium')
      .setDescription('Débloquez des fonctionnalités avancées pour votre serveur!')
      .addFields(
        { name: 'Votre statut', value: isPremiumUser ? '✅ Premium' : '❌ Non Premium', inline: true },
        { name: 'Serveur Premium', value: isPremiumServer ? '✅ Oui' : '❌ Non', inline: true }
      );
    
    if (isPremiumUser && premiumInfo) {
      const expiresAt = new Date(premiumInfo.expires_at);
      embed.addFields(
        { name: 'Expire le', value: `<t:${Math.floor(expiresAt.getTime() / 1000)}:D>`, inline: true }
      );
    }
    
    embed.addFields(
      { name: '📋 Fonctionnalités Premium', value: 
        '• Anti-Raid avancé\n' +
        '• Anti-Spam personnalisable\n' +
        '• Lockdown du serveur\n' +
        '• Ban/Kick en masse\n' +
        '• Logs de modération avancés\n' +
        '• Configuration personnalisée'
      },
      { name: '🎫 Activer Premium', value: `Utilisez \`${config.prefix}redeem <code>\` pour activer un code premium` }
    );
    
    message.reply({ embeds: [embed] });
  }
};
