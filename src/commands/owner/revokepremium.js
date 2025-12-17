const embeds = require('../../utils/embeds');
const permissions = require('../../utils/permissions');
const premium = require('../../utils/premium');

module.exports = {
  name: 'revokepremium',
  description: 'Révoque le premium d\'un utilisateur (Owner only)',
  aliases: ['rprem', 'removepremium'],
  usage: '<@utilisateur ou ID>',
  category: 'owner',
  ownerOnly: true,
  cooldown: 5,
  async execute(message, args, client) {
    if (!permissions.isBotOwner(message.author.id)) {
      return message.reply({ embeds: [embeds.error('Permission refusée', 'Cette commande est réservée aux owners du bot.')] });
    }
    
    const userId = message.mentions.users.first()?.id || args[0];
    if (!userId) {
      return message.reply({ embeds: [embeds.error('Erreur', 'Veuillez mentionner un utilisateur ou fournir son ID.')] });
    }
    
    const isPremium = await premium.isPremium(userId);
    if (!isPremium) {
      return message.reply({ embeds: [embeds.error('Erreur', 'Cet utilisateur n\'est pas premium.')] });
    }
    
    await premium.revokePremium(userId);
    
    message.reply({
      embeds: [embeds.success('Premium révoqué', `Le premium de <@${userId}> a été révoqué.`)]
    });
  }
};
