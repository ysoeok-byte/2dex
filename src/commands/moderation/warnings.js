const { EmbedBuilder } = require('discord.js');
const embeds = require('../../utils/embeds');
const permissions = require('../../utils/permissions');
const moderation = require('../../utils/moderation');
const config = require('../../config');

module.exports = {
  name: 'warnings',
  description: 'Affiche les avertissements d\'un membre',
  aliases: ['warns', 'infractions'],
  usage: '<@utilisateur>',
  category: 'moderation',
  cooldown: 5,
  async execute(message, args, client) {
    const target = message.mentions.members.first() || message.member;
    
    if (target.id !== message.author.id && !permissions.isModerator(message.member)) {
      return message.reply({ embeds: [embeds.error('Permission refusée', 'Vous ne pouvez voir que vos propres avertissements.')] });
    }
    
    try {
      const warnings = await moderation.getWarnings(message.guild.id, target.id);
      
      if (warnings.length === 0) {
        return message.reply({ embeds: [embeds.info('Avertissements', `${target.user.tag} n'a aucun avertissement.`)] });
      }
      
      const embed = new EmbedBuilder()
        .setColor(config.embedColor)
        .setTitle(`⚠️ Avertissements de ${target.user.tag}`)
        .setDescription(`Total: ${warnings.length} avertissement(s)`)
        .setThumbnail(target.user.displayAvatarURL());
      
      warnings.slice(0, 10).forEach((warn, index) => {
        embed.addFields({
          name: `#${warn.id} - ${new Date(warn.created_at).toLocaleDateString('fr-FR')}`,
          value: `Modérateur: <@${warn.moderator_id}>\nRaison: ${warn.reason || 'Aucune'}`
        });
      });
      
      if (warnings.length > 10) {
        embed.setFooter({ text: `Et ${warnings.length - 10} autres avertissements...` });
      }
      
      message.reply({ embeds: [embed] });
    } catch (error) {
      console.error('[WARNINGS] Error:', error);
      message.reply({ embeds: [embeds.error('Erreur', 'Une erreur est survenue.')] });
    }
  }
};
