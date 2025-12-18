const embeds = require('../../utils/embeds');
const permissions = require('../../utils/permissions');
const moderation = require('../../utils/moderation');

module.exports = {
  name: 'mutechat',
  description: 'Empêche les non-modos de parler dans un channel',
  aliases: ['slowmode', 'lock-chat'],
  usage: '<on/off> [durée slowmode en secondes]',
  category: 'moderation',
  cooldown: 10,
  async execute(message, args, client) {
    if (!permissions.isModerator(message.member)) {
      return message.reply({ embeds: [embeds.error('Permission refusée', 'Vous devez être modérateur.')] });
    }
    
    const action = args[0]?.toLowerCase();
    if (!action || !['on', 'off'].includes(action)) {
      return message.reply({ embeds: [embeds.error('Erreur', 'Utilisez: `!mutechat on/off [slowmode]`')] });
    }
    
    const slowmode = parseInt(args[1]) || 0;
    if (slowmode < 0 || slowmode > 21600) {
      return message.reply({ embeds: [embeds.error('Erreur', 'Slowmode doit être entre 0 et 21600 secondes.')] });
    }
    
    try {
      if (action === 'on') {
        await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, {
          SendMessages: false
        });
        
        if (slowmode > 0) {
          await message.channel.setRateLimitPerUser(slowmode);
        }
        
        await moderation.logAction(message.guild.id, 'MUTECHAT_ON', message.channel.id, message.author.id, `Slowmode: ${slowmode}s`);
        
        message.reply({
          embeds: [embeds.antiRaid('Chat muté', 
            `Ce channel est maintenant muté pour les membres normaux.\n` +
            (slowmode > 0 ? `Slowmode: ${slowmode}s` : 'Aucun slowmode')
          )]
        });
      } else {
        await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, {
          SendMessages: null
        });
        
        await message.channel.setRateLimitPerUser(0);
        await moderation.logAction(message.guild.id, 'MUTECHAT_OFF', message.channel.id, message.author.id, 'Chat démuté');
        
        message.reply({
          embeds: [embeds.success('Chat démuté', 'Les membres peuvent à nouveau parler dans ce channel.')]
        });
      }
    } catch (error) {
      console.error('[MUTECHAT] Error:', error);
      message.reply({ embeds: [embeds.error('Erreur', 'Une erreur est survenue.')] });
    }
  }
};
