const embeds = require('../../utils/embeds');
const permissions = require('../../utils/permissions');
const premium = require('../../utils/premium');
const serverConfig = require('../../utils/serverConfig');

module.exports = {
  name: 'antiraid',
  description: 'Configure le système anti-raid (Premium)',
  aliases: ['ar'],
  usage: '<on/off>',
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
          'L\'anti-raid avancé est une fonctionnalité Premium.\n' +
          'Le propriétaire du serveur doit avoir un abonnement Premium actif.'
        )]
      });
    }
    
    const option = args[0]?.toLowerCase();
    if (!option || !['on', 'off'].includes(option)) {
      const config = await serverConfig.getConfig(message.guild.id);
      return message.reply({
        embeds: [embeds.info('Anti-Raid', 
          `**Statut actuel:** ${config?.anti_raid_enabled ? '✅ Activé' : '❌ Désactivé'}\n\n` +
          `Utilisez \`!antiraid on\` ou \`!antiraid off\` pour changer le statut.`
        )]
      });
    }
    
    const enabled = option === 'on';
    await serverConfig.toggleAntiRaid(message.guild.id, enabled);
    
    message.reply({
      embeds: [embeds.antiRaid('Anti-Raid', `Le système anti-raid a été ${enabled ? '**activé**' : '**désactivé**'}.`)]
    });
  }
};
