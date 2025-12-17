const { EmbedBuilder } = require('discord.js');
const embeds = require('../../utils/embeds');
const permissions = require('../../utils/permissions');
const config = require('../../config');

module.exports = {
  name: 'announce',
  description: 'Envoie une annonce à tous les serveurs (Owner only)',
  aliases: ['broadcast'],
  usage: '<message>',
  category: 'owner',
  ownerOnly: true,
  cooldown: 60,
  async execute(message, args, client) {
    if (!permissions.isBotOwner(message.author.id)) {
      return message.reply({ embeds: [embeds.error('Permission refusée', 'Cette commande est réservée aux owners du bot.')] });
    }
    
    const announcement = args.join(' ');
    if (!announcement) {
      return message.reply({ embeds: [embeds.error('Erreur', 'Veuillez fournir un message à annoncer.')] });
    }
    
    const embed = new EmbedBuilder()
      .setColor(config.embedColor)
      .setTitle('📢 Annonce')
      .setDescription(announcement)
      .setFooter({ text: `De: ${message.author.tag}` })
      .setTimestamp();
    
    let sent = 0;
    let failed = 0;
    
    const status = await message.reply({
      embeds: [embeds.info('Annonce', `Envoi en cours... 0/${client.guilds.cache.size} serveurs`)]
    });
    
    for (const [, guild] of client.guilds.cache) {
      try {
        const channel = guild.systemChannel || 
                        guild.channels.cache.find(c => c.type === 0 && c.permissionsFor(guild.members.me).has('SendMessages'));
        
        if (channel) {
          await channel.send({ embeds: [embed] });
          sent++;
        } else {
          failed++;
        }
      } catch (error) {
        failed++;
      }
      
      if ((sent + failed) % 10 === 0) {
        await status.edit({
          embeds: [embeds.info('Annonce', `Envoi en cours... ${sent + failed}/${client.guilds.cache.size} serveurs`)]
        });
      }
    }
    
    status.edit({
      embeds: [embeds.success('Annonce terminée', `**Envoyés:** ${sent}\n**Échoués:** ${failed}`)]
    });
  }
};
