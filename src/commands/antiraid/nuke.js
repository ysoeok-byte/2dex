const embeds = require('../../utils/embeds');
const permissions = require('../../utils/permissions');
const premium = require('../../utils/premium');
const moderation = require('../../utils/moderation');

module.exports = {
  name: 'nuke',
  description: 'Supprime tous les messages d\'un channel (Premium)',
  aliases: ['nukechannel'],
  usage: '[#channel]',
  category: 'antiraid',
  premiumOnly: true,
  cooldown: 30,
  async execute(message, args, client) {
    if (!permissions.isAdmin(message.member)) {
      return message.reply({ embeds: [embeds.error('Permission refusée', 'Vous devez être administrateur.')] });
    }
    
    const isPremiumServer = await premium.isServerPremium(message.guild);
    if (!isPremiumServer) {
      return message.reply({
        embeds: [embeds.premium('Fonctionnalité Premium', 'Nuke est une fonctionnalité Premium.')] });
    }
    
    const channel = message.mentions.channels.first() || message.channel;
    
    const confirmMsg = await message.reply({
      embeds: [embeds.error('⚠️ Confirmation', 
        `Êtes-vous sûr de vouloir **SUPPRIMER TOUS** les messages de ${channel}?\n\n` +
        `Réagissez avec ✅ pour confirmer ou ❌ pour annuler.`
      )]
    });
    
    await confirmMsg.react('✅');
    await confirmMsg.react('❌');
    
    const filter = (reaction, user) => user.id === message.author.id && ['✅', '❌'].includes(reaction.emoji.name);
    const collected = await confirmMsg.awaitReactions({ filter, max: 1, time: 30000 });
    
    if (!collected.size || collected.first().emoji.name === '❌') {
      return confirmMsg.edit({ embeds: [embeds.error('Annulé', 'Nuke annulé.')] });
    }
    
    try {
      let deleted = 0;
      let fetched = true;
      
      const status = await message.channel.send({
        embeds: [embeds.antiRaid('Nuke', `Suppression en cours... ${deleted} messages supprimés`)]
      });
      
      while (fetched) {
        const messages = await channel.messages.fetch({ limit: 100 });
        if (messages.size === 0) fetched = false;
        
        for (const msg of messages.values()) {
          try {
            await msg.delete();
            deleted++;
          } catch (error) {}
        }
        
        if (deleted % 50 === 0) {
          await status.edit({
            embeds: [embeds.antiRaid('Nuke', `Suppression en cours... ${deleted} messages supprimés`)]
          });
        }
      }
      
      await moderation.logAction(message.guild.id, 'NUKE', channel.id, message.author.id, `${deleted} messages supprimés`);
      
      status.edit({
        embeds: [embeds.antiRaid('Nuke Terminé', 
          `**${deleted}** messages supprimés du channel ${channel}`
        )]
      });
    } catch (error) {
      console.error('[NUKE] Error:', error);
      message.reply({ embeds: [embeds.error('Erreur', 'Une erreur est survenue lors du nuke.')] });
    }
  }
};
