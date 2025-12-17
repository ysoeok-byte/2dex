const { EmbedBuilder } = require('discord.js');
const embeds = require('../../utils/embeds');
const permissions = require('../../utils/permissions');
const premium = require('../../utils/premium');
const config = require('../../config');

module.exports = {
  name: 'codes',
  description: 'Liste les codes premium (Owner only)',
  aliases: ['listcodes', 'allcodes'],
  usage: '[unused]',
  category: 'owner',
  ownerOnly: true,
  cooldown: 10,
  async execute(message, args, client) {
    if (!permissions.isBotOwner(message.author.id)) {
      return message.reply({ embeds: [embeds.error('Permission refusée', 'Cette commande est réservée aux owners du bot.')] });
    }
    
    const unusedOnly = args[0]?.toLowerCase() === 'unused';
    const codes = unusedOnly ? await premium.getUnusedCodes() : await premium.getAllCodes();
    
    if (codes.length === 0) {
      return message.reply({ embeds: [embeds.info('Codes', 'Aucun code trouvé.')] });
    }
    
    const embed = new EmbedBuilder()
      .setColor(config.premiumColor)
      .setTitle(`🎫 ${unusedOnly ? 'Codes Non Utilisés' : 'Tous les Codes'}`)
      .setDescription(`Total: ${codes.length} code(s)`)
      .setTimestamp();
    
    const displayCodes = codes.slice(0, 15);
    displayCodes.forEach(code => {
      const status = code.is_used ? `✅ Utilisé par <@${code.used_by}>` : '❌ Non utilisé';
      embed.addFields({
        name: code.code,
        value: `Durée: ${code.duration_days} jours\n${status}`,
        inline: true
      });
    });
    
    if (codes.length > 15) {
      embed.setFooter({ text: `Et ${codes.length - 15} autres codes...` });
    }
    
    try {
      await message.author.send({ embeds: [embed] });
      message.reply({ embeds: [embeds.success('Codes', 'La liste a été envoyée en message privé.')] });
    } catch (error) {
      message.reply({ embeds: [embed] });
    }
  }
};
