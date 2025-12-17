const { EmbedBuilder } = require('discord.js');
const embeds = require('../../utils/embeds');
const permissions = require('../../utils/permissions');
const premium = require('../../utils/premium');
const config = require('../../config');

module.exports = {
  name: 'premiumusers',
  description: 'Liste les utilisateurs premium (Owner only)',
  aliases: ['pusers', 'premlist'],
  usage: '',
  category: 'owner',
  ownerOnly: true,
  cooldown: 10,
  async execute(message, args, client) {
    if (!permissions.isBotOwner(message.author.id)) {
      return message.reply({ embeds: [embeds.error('Permission refusée', 'Cette commande est réservée aux owners du bot.')] });
    }
    
    const users = await premium.getAllPremiumUsers();
    
    if (users.length === 0) {
      return message.reply({ embeds: [embeds.info('Premium Users', 'Aucun utilisateur premium.')] });
    }
    
    const embed = new EmbedBuilder()
      .setColor(config.premiumColor)
      .setTitle('⭐ Utilisateurs Premium')
      .setDescription(`Total: ${users.length} utilisateur(s)`)
      .setTimestamp();
    
    const now = new Date();
    users.slice(0, 20).forEach(user => {
      const expiresAt = new Date(user.expires_at);
      const isExpired = expiresAt < now;
      const status = isExpired ? '⏰ Expiré' : `✅ Expire: <t:${Math.floor(expiresAt.getTime() / 1000)}:R>`;
      
      embed.addFields({
        name: `<@${user.user_id}>`,
        value: `${status}\nCode: \`${user.code_used || 'N/A'}\``,
        inline: true
      });
    });
    
    if (users.length > 20) {
      embed.setFooter({ text: `Et ${users.length - 20} autres utilisateurs...` });
    }
    
    message.reply({ embeds: [embed] });
  }
};
