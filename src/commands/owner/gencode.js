const { EmbedBuilder } = require('discord.js');
const embeds = require('../../utils/embeds');
const permissions = require('../../utils/permissions');
const premium = require('../../utils/premium');
const config = require('../../config');

module.exports = {
  name: 'gencode',
  description: 'Génère un code premium (Owner only)',
  aliases: ['generatecode', 'gc'],
  usage: '<durée en jours> [quantité]',
  category: 'owner',
  ownerOnly: true,
  cooldown: 5,
  async execute(message, args, client) {
    if (!permissions.isBotOwner(message.author.id)) {
      return message.reply({ embeds: [embeds.error('Permission refusée', 'Cette commande est réservée aux owners du bot.')] });
    }
    
    const duration = parseInt(args[0]);
    if (!duration || duration < 1) {
      return message.reply({ embeds: [embeds.error('Erreur', 'Veuillez fournir une durée valide en jours.')] });
    }
    
    const quantity = Math.min(parseInt(args[1]) || 1, 10);
    const codes = [];
    
    for (let i = 0; i < quantity; i++) {
      const code = await premium.generateCode(message.author.id, duration);
      codes.push(code);
    }
    
    const embed = new EmbedBuilder()
      .setColor(config.premiumColor)
      .setTitle('🎫 Codes Premium Générés')
      .setDescription(`**Durée:** ${duration} jours\n**Quantité:** ${quantity}`)
      .addFields({ name: 'Codes', value: codes.map(c => `\`${c}\``).join('\n') })
      .setFooter({ text: 'Ces codes peuvent être utilisés avec !redeem <code>' })
      .setTimestamp();
    
    try {
      await message.author.send({ embeds: [embed] });
      message.reply({ embeds: [embeds.success('Codes générés', 'Les codes ont été envoyés en message privé.')] });
    } catch (error) {
      message.reply({ embeds: [embed] });
    }
  }
};
