const embeds = require('../../utils/embeds');
const permissions = require('../../utils/permissions');
const moderation = require('../../utils/moderation');

module.exports = {
  name: 'clear',
  description: 'Supprime des messages dans le channel',
  aliases: ['purge', 'delete'],
  usage: '<nombre 1-100>',
  category: 'moderation',
  cooldown: 5,
  async execute(message, args, client) {
    if (!permissions.isModerator(message.member)) {
      return message.reply({ embeds: [embeds.error('Permission refusée', 'Vous devez être modérateur.')] });
    }
    
    const amount = parseInt(args[0]);
    if (!amount || amount < 1 || amount > 100) {
      return message.reply({ embeds: [embeds.error('Erreur', 'Veuillez fournir un nombre entre 1 et 100.')] });
    }
    
    try {
      await message.delete();
      const deleted = await message.channel.bulkDelete(amount, true);
      await moderation.logAction(message.guild.id, 'CLEAR', message.channel.id, message.author.id, `${deleted.size} messages supprimés`);
      
      const reply = await message.channel.send({
        embeds: [embeds.success('Messages supprimés', `${deleted.size} messages ont été supprimés.`)]
      });
      
      setTimeout(() => reply.delete().catch(() => {}), 5000);
    } catch (error) {
      console.error('[CLEAR] Error:', error);
      message.channel.send({ embeds: [embeds.error('Erreur', 'Une erreur est survenue. Les messages de plus de 14 jours ne peuvent pas être supprimés.')] });
    }
  }
};
