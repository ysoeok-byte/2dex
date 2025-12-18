const embeds = require('../../utils/embeds');
const permissions = require('../../utils/permissions');
const premium = require('../../utils/premium');
const moderation = require('../../utils/moderation');

module.exports = {
  name: 'muteall',
  description: 'Met en mute tous les membres du serveur (Premium)',
  aliases: ['maall'],
  usage: '<durée en minutes> [raison]',
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
        embeds: [embeds.premium('Fonctionnalité Premium', 'Mute all est une fonctionnalité Premium.')] });
    }
    
    const duration = parseInt(args[0]);
    if (!duration || duration < 1 || duration > 40320) {
      return message.reply({ embeds: [embeds.error('Erreur', 'Veuillez fournir une durée valide (1-40320 minutes).')] });
    }
    
    const reason = args.slice(1).join(' ') || 'Mute all';
    const members = await message.guild.members.fetch();
    let muted = 0;
    let failed = 0;
    
    const status = await message.channel.send({
      embeds: [embeds.antiRaid('Mute All', `Mise en sourdine en cours... 0/${members.size}`)]
    });
    
    for (const [, member] of members) {
      if (member.id === client.user.id || member.user.bot || member.id === message.guild.ownerId) {
        continue;
      }
      
      try {
        await member.timeout(duration * 60 * 1000, reason);
        await moderation.logAction(message.guild.id, 'MUTE_ALL', member.id, message.author.id, `${duration}m - ${reason}`);
        muted++;
      } catch (error) {
        failed++;
      }
      
      if ((muted + failed) % 10 === 0) {
        await status.edit({
          embeds: [embeds.antiRaid('Mute All', `Mise en sourdine en cours... ${muted + failed}/${members.size}`)]
        });
      }
    }
    
    status.edit({
      embeds: [embeds.antiRaid('Mute All Terminé', 
        `**En mute:** ${muted}\n**Échoués:** ${failed}\n**Durée:** ${duration} minutes`
      )]
    });
  }
};
