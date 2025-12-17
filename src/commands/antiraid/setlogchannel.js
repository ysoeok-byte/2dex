const embeds = require('../../utils/embeds');
const permissions = require('../../utils/permissions');
const premium = require('../../utils/premium');
const serverConfig = require('../../utils/serverConfig');

module.exports = {
  name: 'setlogchannel',
  description: 'Définit le channel de logs (Premium)',
  aliases: ['setlogs', 'logchannel'],
  usage: '<#channel>',
  category: 'antiraid',
  premiumOnly: true,
  cooldown: 10,
  async execute(message, args, client) {
    if (!permissions.isAdmin(message.member)) {
      return message.reply({ embeds: [embeds.error('Permission refusée', 'Vous devez être administrateur.')] });
    }
    
    const isPremiumServer = await premium.isServerPremium(message.guild);
    if (!isPremiumServer) {
      return message.reply({
        embeds: [embeds.premium('Fonctionnalité Premium', 
          'Les logs de modération sont une fonctionnalité Premium.\n' +
          'Le propriétaire du serveur doit avoir un abonnement Premium actif.'
        )]
      });
    }
    
    const channel = message.mentions.channels.first();
    if (!channel) {
      return message.reply({ embeds: [embeds.error('Erreur', 'Veuillez mentionner un channel.')] });
    }
    
    await serverConfig.setLogChannel(message.guild.id, channel.id);
    
    message.reply({
      embeds: [embeds.success('Logs configurés', `Les logs de modération seront envoyés dans ${channel}.`)]
    });
  }
};
