const { EmbedBuilder } = require('discord.js');
const config = require('../../config');
const premium = require('../../utils/premium');
const permissions = require('../../utils/permissions');

module.exports = {
  name: 'help',
  description: 'Affiche la liste des commandes disponibles',
  aliases: ['h', 'commands', 'aide'],
  usage: '[commande]',
  cooldown: 5,
  async execute(message, args, client) {
    const isPremiumServer = await premium.isServerPremium(message.guild);
    const isBotOwner = permissions.isBotOwner(message.author.id);
    
    if (args[0]) {
      const command = client.commands.get(args[0].toLowerCase()) ||
                      client.commands.find(c => c.aliases && c.aliases.includes(args[0].toLowerCase()));
      
      if (!command) {
        return message.reply('Commande non trouvée.');
      }
      
      const embed = new EmbedBuilder()
        .setColor(config.embedColor)
        .setTitle(`Commande: ${command.name}`)
        .setDescription(command.description || 'Pas de description')
        .addFields(
          { name: 'Usage', value: `\`${config.prefix}${command.name} ${command.usage || ''}\``, inline: true },
          { name: 'Aliases', value: command.aliases?.join(', ') || 'Aucun', inline: true },
          { name: 'Cooldown', value: `${command.cooldown || 3} secondes`, inline: true }
        );
      
      if (command.premiumOnly) {
        embed.addFields({ name: '⭐ Premium', value: 'Cette commande est réservée aux serveurs Premium', inline: true });
      }
      
      return message.reply({ embeds: [embed] });
    }
    
    const categories = {};
    client.commands.forEach(cmd => {
      const category = cmd.category || 'general';
      if (!categories[category]) categories[category] = [];
      
      if (cmd.ownerOnly && !isBotOwner) return;
      if (cmd.premiumOnly && !isPremiumServer) {
        categories[category].push(`~~${cmd.name}~~ ⭐`);
      } else {
        categories[category].push(cmd.name);
      }
    });
    
    const embed = new EmbedBuilder()
      .setColor(isPremiumServer ? config.premiumColor : config.embedColor)
      .setTitle('📚 Liste des Commandes')
      .setDescription(`Préfixe: \`${config.prefix}\`\nUtilisez \`${config.prefix}help <commande>\` pour plus de détails.`)
      .setFooter({ text: isPremiumServer ? '⭐ Serveur Premium' : 'Utilisez !premium pour activer les fonctionnalités premium' });
    
    for (const [category, commands] of Object.entries(categories)) {
      if (commands.length > 0) {
        const categoryName = {
          'general': '📋 Général',
          'moderation': '🔨 Modération',
          'premium': '⭐ Premium',
          'antiraid': '🛡️ Anti-Raid',
          'owner': '👑 Owner Bot'
        }[category] || category;
        
        embed.addFields({ name: categoryName, value: commands.join(', '), inline: false });
      }
    }
    
    message.reply({ embeds: [embed] });
  }
};
