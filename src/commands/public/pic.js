const embeds = require('../../utils/embeds');
module.exports = {
  name: 'pic',
  description: 'Voir la photo de profil d\'un utilisateur',
  aliases: ['avatar', 'av'],
  category: 'public',
  async execute(message, args, client) {
    const user = message.mentions.users.first() || message.author;
    const embed = embeds.info('Avatar', `${user.tag}`)
      .setImage(user.displayAvatarURL({ dynamic: true, size: 1024 }));
    message.reply({ embeds: [embed] });
  }
};
