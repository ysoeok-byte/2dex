const embeds = require('../../utils/embeds');
const permissions = require('../../utils/permissions');

module.exports = {
  name: 'eval',
  description: 'Exécute du code JavaScript (Owner only)',
  aliases: ['execute', 'run'],
  usage: '<code>',
  category: 'owner',
  ownerOnly: true,
  cooldown: 0,
  async execute(message, args, client) {
    if (!permissions.isBotOwner(message.author.id)) {
      return;
    }
    
    const code = args.join(' ');
    if (!code) {
      return message.reply({ embeds: [embeds.error('Erreur', 'Veuillez fournir du code à exécuter.')] });
    }
    
    try {
      let result = eval(code);
      if (result instanceof Promise) result = await result;
      
      if (typeof result !== 'string') {
        result = require('util').inspect(result, { depth: 2 });
      }
      
      if (result.length > 1900) {
        result = result.substring(0, 1900) + '...';
      }
      
      message.reply({
        embeds: [embeds.success('Eval', `\`\`\`js\n${result}\n\`\`\``)]
      });
    } catch (error) {
      message.reply({
        embeds: [embeds.error('Erreur', `\`\`\`js\n${error.message}\n\`\`\``)]
      });
    }
  }
};
