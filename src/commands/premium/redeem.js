const embeds = require('../../utils/embeds');
const premium = require('../../utils/premium');

module.exports = {
  name: 'redeem',
  description: 'Utilise un code premium',
  aliases: ['activate', 'code'],
  usage: '<code>',
  category: 'premium',
  cooldown: 10,
  async execute(message, args, client) {
    const code = args[0];
    if (!code) {
      return message.reply({ embeds: [embeds.error('Erreur', 'Veuillez fournir un code premium.')] });
    }
    
    try {
      const result = await premium.redeemCode(message.author.id, code.toUpperCase());
      
      if (result.success) {
        message.reply({
          embeds: [embeds.premium('Premium Activé!', 
            `Félicitations! Vous êtes maintenant Premium!\n\n` +
            `**Durée:** ${result.durationDays} jours\n` +
            `**Expire le:** <t:${Math.floor(result.expiresAt.getTime() / 1000)}:D>\n\n` +
            `Tous les serveurs dont vous êtes propriétaire bénéficient maintenant des fonctionnalités Premium!`
          )]
        });
      } else {
        message.reply({ embeds: [embeds.error('Erreur', result.message)] });
      }
    } catch (error) {
      console.error('[REDEEM] Error:', error);
      message.reply({ embeds: [embeds.error('Erreur', 'Une erreur est survenue.')] });
    }
  }
};
