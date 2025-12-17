const { PermissionFlagsBits } = require('discord.js');
const embeds = require('../../utils/embeds');
const permissions = require('../../utils/permissions');
const premium = require('../../utils/premium');
const moderation = require('../../utils/moderation');

module.exports = {
  name: 'lockdown',
  description: 'Verrouille le serveur (Premium)',
  aliases: ['lock'],
  usage: '[unlock]',
  category: 'antiraid',
  premiumOnly: true,
  cooldown: 30,
  async execute(message, args, client) {
    if (!permissions.isAdmin(message.member)) {
      return message.reply({ embeds: [embeds.error('Permission refusée', 'Vous devez être administrateur.')] });
    }
    
    const isPremiumServer = await premium.isServerPremium(message.guild);
    if (!isPremiumServer) {
      return message.reply({
        embeds: [embeds.premium('Fonctionnalité Premium', 
          'Le lockdown est une fonctionnalité Premium.\n' +
          'Le propriétaire du serveur doit avoir un abonnement Premium actif.'
        )]
      });
    }
    
    const unlock = args[0]?.toLowerCase() === 'unlock';
    const channels = message.guild.channels.cache.filter(c => c.type === 0);
    
    let count = 0;
    const status = await message.reply({
      embeds: [embeds.antiRaid('Lockdown', `${unlock ? 'Déverrouillage' : 'Verrouillage'} en cours... 0/${channels.size} channels`)]
    });
    
    for (const [, channel] of channels) {
      try {
        await channel.permissionOverwrites.edit(message.guild.roles.everyone, {
          SendMessages: unlock ? null : false
        });
        count++;
        
        if (count % 5 === 0) {
          await status.edit({
            embeds: [embeds.antiRaid('Lockdown', `${unlock ? 'Déverrouillage' : 'Verrouillage'} en cours... ${count}/${channels.size} channels`)]
          });
        }
      } catch (error) {
        console.error(`[LOCKDOWN] Error on channel ${channel.name}:`, error);
      }
    }
    
    await moderation.logAction(message.guild.id, unlock ? 'UNLOCK' : 'LOCKDOWN', message.guild.id, message.author.id, `${count} channels affectés`);
    
    status.edit({
      embeds: [embeds.antiRaid(unlock ? 'Déverrouillage terminé' : 'Lockdown terminé', 
        `${count}/${channels.size} channels ont été ${unlock ? 'déverrouillés' : 'verrouillés'}.`
      )]
    });
  }
};
