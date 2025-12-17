const { EmbedBuilder } = require('discord.js');
const embeds = require('../../utils/embeds');
const permissions = require('../../utils/permissions');
const moderation = require('../../utils/moderation');
const config = require('../../config');

module.exports = {
  name: 'modlogs',
  description: 'Affiche les logs de modération du serveur',
  aliases: ['logs', 'modlog'],
  usage: '[nombre]',
  category: 'moderation',
  cooldown: 10,
  async execute(message, args, client) {
    if (!permissions.isModerator(message.member)) {
      return message.reply({ embeds: [embeds.error('Permission refusée', 'Vous devez être modérateur.')] });
    }
    
    const limit = Math.min(parseInt(args[0]) || 10, 25);
    
    try {
      const logs = await moderation.getModLogs(message.guild.id, limit);
      
      if (logs.length === 0) {
        return message.reply({ embeds: [embeds.info('Logs', 'Aucun log de modération trouvé.')] });
      }
      
      const embed = new EmbedBuilder()
        .setColor(config.embedColor)
        .setTitle('📋 Logs de Modération')
        .setDescription(`Derniers ${logs.length} logs`)
        .setTimestamp();
      
      logs.forEach(log => {
        embed.addFields({
          name: `${log.action} - ${new Date(log.created_at).toLocaleString('fr-FR')}`,
          value: `Cible: <@${log.target_id}>\nModérateur: <@${log.moderator_id}>\nRaison: ${log.reason || 'Aucune'}`,
          inline: false
        });
      });
      
      message.reply({ embeds: [embed] });
    } catch (error) {
      console.error('[MODLOGS] Error:', error);
      message.reply({ embeds: [embeds.error('Erreur', 'Une erreur est survenue.')] });
    }
  }
};
