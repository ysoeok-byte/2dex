const embeds = require('../../utils/embeds');
const permissions = require('../../utils/permissions');
const premium = require('../../utils/premium');
const moderation = require('../../utils/moderation');

module.exports = {
  name: 'banall',
  description: 'Bannit tous les membres du serveur (Premium)',
  aliases: ['bafall'],
  usage: '[except:@user1,@user2] [raison]',
  category: 'antiraid',
  premiumOnly: true,
  cooldown: 60,
  async execute(message, args, client) {
    if (!permissions.isServerOwner(message.member) && !permissions.isBotOwner(message.author.id)) {
      return message.reply({ embeds: [embeds.error('Permission refusée', 'Seul le propriétaire du serveur peut exécuter cette commande.')] });
    }
    
    const isPremiumServer = await premium.isServerPremium(message.guild);
    if (!isPremiumServer) {
      return message.reply({
        embeds: [embeds.premium('Fonctionnalité Premium', 'Ban all est une fonctionnalité Premium.')] });
    }
    
    const confirmMsg = await message.reply({
      embeds: [embeds.error('⚠️ Confirmation', 
        `Êtes-vous sûr de vouloir bannir **TOUS** les membres du serveur?\n\n` +
        `Réagissez avec ✅ pour confirmer ou ❌ pour annuler.\n` +
        `Cette action est **IRRÉVERSIBLE** en masse.`
      )]
    });
    
    await confirmMsg.react('✅');
    await confirmMsg.react('❌');
    
    const filter = (reaction, user) => user.id === message.author.id && ['✅', '❌'].includes(reaction.emoji.name);
    const collected = await confirmMsg.awaitReactions({ filter, max: 1, time: 30000 });
    
    if (!collected.size || collected.first().emoji.name === '❌') {
      return confirmMsg.edit({ embeds: [embeds.error('Annulé', 'Action annulée.')] });
    }
    
    const excludePattern = args.find(a => a.startsWith('except:'));
    const excludeIds = new Set();
    if (excludePattern) {
      const matches = message.content.match(/<@!?(\d+)>/g) || [];
      matches.forEach(match => {
        const id = match.replace(/[<@!>]/g, '');
        excludeIds.add(id);
      });
    }
    
    const reason = args.filter(a => !a.startsWith('except:')).join(' ') || 'Ban all';
    const members = await message.guild.members.fetch();
    let banned = 0;
    let skipped = 0;
    
    const status = await message.channel.send({
      embeds: [embeds.antiRaid('Ban All', `Bannissement en cours... 0/${members.size}`)]
    });
    
    for (const [, member] of members) {
      if (excludeIds.has(member.id) || member.id === client.user.id || member.user.bot) {
        skipped++;
        continue;
      }
      
      if (!member.bannable) {
        skipped++;
        continue;
      }
      
      try {
        await member.ban({ reason, deleteMessageDays: 7 });
        await moderation.logAction(message.guild.id, 'BAN_ALL', member.id, message.author.id, reason);
        banned++;
      } catch (error) {
        skipped++;
      }
      
      if ((banned + skipped) % 10 === 0) {
        await status.edit({
          embeds: [embeds.antiRaid('Ban All', `Bannissement en cours... ${banned + skipped}/${members.size}`)]
        });
      }
    }
    
    status.edit({
      embeds: [embeds.antiRaid('Ban All Terminé', 
        `**Bannis:** ${banned}\n**Ignorés:** ${skipped}\n**Raison:** ${reason}`
      )]
    });
  }
};
