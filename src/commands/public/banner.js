const embeds = require('../../utils/embeds');
module.exports = {
  name: 'banner',
  description: 'Voir la bannière d\'un utilisateur',
  category: 'public',
  async execute(message, args, client) {
    const user = message.mentions.users.first() || message.author;
    const fullUser = await client.users.fetch(user.id, { force: true });
    if (!fullUser.bannerURL()) return message.reply('Cet utilisateur n\'a pas de bannière.');
    const embed = embeds.info('Bannière', `${user.tag}`)
      .setImage(fullUser.bannerURL({ dynamic: true, size: 1024 }));
    message.reply({ embeds: [embed] });
  }
};
