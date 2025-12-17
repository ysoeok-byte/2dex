const { EmbedBuilder, version: djsVersion } = require('discord.js');
const embeds = require('../../utils/embeds');
const permissions = require('../../utils/permissions');
const db = require('../../database/db');
const config = require('../../config');

module.exports = {
  name: 'botstats',
  description: 'Affiche les statistiques du bot (Owner only)',
  aliases: ['stats', 'botinfo'],
  usage: '',
  category: 'owner',
  ownerOnly: true,
  cooldown: 10,
  async execute(message, args, client) {
    if (!permissions.isBotOwner(message.author.id)) {
      return message.reply({ embeds: [embeds.error('Permission refusée', 'Cette commande est réservée aux owners du bot.')] });
    }
    
    const stats = await db.query('SELECT * FROM bot_stats LIMIT 1');
    const premiumCount = await db.query('SELECT COUNT(*) as count FROM premium_users WHERE expires_at > CURRENT_TIMESTAMP');
    const codesCount = await db.query('SELECT COUNT(*) as total, SUM(CASE WHEN is_used THEN 1 ELSE 0 END) as used FROM premium_codes');
    
    const uptime = process.uptime();
    const days = Math.floor(uptime / 86400);
    const hours = Math.floor((uptime % 86400) / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    
    const embed = new EmbedBuilder()
      .setColor(config.embedColor)
      .setTitle('📊 Statistiques du Bot')
      .setThumbnail(client.user.displayAvatarURL())
      .addFields(
        { name: '🖥️ Serveurs', value: `${client.guilds.cache.size}`, inline: true },
        { name: '👥 Utilisateurs', value: `${client.users.cache.size}`, inline: true },
        { name: '💬 Channels', value: `${client.channels.cache.size}`, inline: true },
        { name: '⏰ Uptime', value: `${days}j ${hours}h ${minutes}m`, inline: true },
        { name: '📦 Discord.js', value: `v${djsVersion}`, inline: true },
        { name: '🟢 Node.js', value: `${process.version}`, inline: true },
        { name: '⭐ Utilisateurs Premium', value: `${premiumCount.rows[0]?.count || 0}`, inline: true },
        { name: '🎫 Codes (Utilisés/Total)', value: `${codesCount.rows[0]?.used || 0}/${codesCount.rows[0]?.total || 0}`, inline: true },
        { name: '📝 Commandes exécutées', value: `${stats.rows[0]?.total_commands || 0}`, inline: true },
        { name: '💾 Mémoire', value: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`, inline: true }
      )
      .setTimestamp();
    
    message.reply({ embeds: [embed] });
  }
};
