const embeds = require('../../utils/embeds');
const permissions = require('../../utils/permissions');

module.exports = {
  name: 'watch',
  description: 'Change le statut du bot',
  category: 'owner',
  async execute(message, args, client) {
    if (!permissions.isBotOwner(message.author.id)) return;
    const status = args.join(' ');
    if (!status) return message.reply('Veuillez fournir un statut.');
    client.user.setActivity(status);
    message.reply(`Statut mis à jour: ${status}`);
  }
};
