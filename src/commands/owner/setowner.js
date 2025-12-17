const embeds = require('../../utils/embeds');
const permissions = require('../../utils/permissions');
const config = require('../../config');

module.exports = {
  name: 'setowner',
  description: 'Affiche les owners actuels du bot (Owner only)',
  aliases: ['owners'],
  usage: '',
  category: 'owner',
  ownerOnly: true,
  cooldown: 10,
  async execute(message, args, client) {
    if (!permissions.isBotOwner(message.author.id)) {
      return message.reply({ embeds: [embeds.error('Permission refusée', 'Cette commande est réservée aux owners du bot.')] });
    }
    
    const owners = config.botOwners;
    
    if (owners.length === 0) {
      return message.reply({
        embeds: [embeds.info('Owners du Bot', 
          'Aucun owner configuré.\n\n' +
          'Pour ajouter des owners, configurez la variable d\'environnement `BOT_OWNERS` avec les IDs séparés par des virgules.'
        )]
      });
    }
    
    const ownerList = owners.map((id, index) => `${index + 1}. <@${id}> (\`${id}\`)`).join('\n');
    
    message.reply({
      embeds: [embeds.info('Owners du Bot', 
        `**Owners actuels:**\n${ownerList}\n\n` +
        'Pour modifier les owners, changez la variable `BOT_OWNERS` dans les secrets.'
      )]
    });
  }
};
