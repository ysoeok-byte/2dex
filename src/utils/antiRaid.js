const { Collection } = require('discord.js');
const config = require('../config');

const joinCache = new Collection();
const messageCache = new Collection();
const duplicateCache = new Collection();

const checkJoinRaid = async (member, client) => {
  const guildId = member.guild.id;
  const now = Date.now();
  
  if (!joinCache.has(guildId)) {
    joinCache.set(guildId, []);
  }
  
  const joins = joinCache.get(guildId);
  joins.push({ id: member.id, timestamp: now });
  
  const recentJoins = joins.filter(j => now - j.timestamp < 60000);
  joinCache.set(guildId, recentJoins);
  
  if (recentJoins.length > config.antiRaid.maxJoinsPerMinute) {
    const accountAge = (now - member.user.createdTimestamp) / (1000 * 60 * 60 * 24);
    
    if (accountAge < config.antiRaid.newAccountAge) {
      try {
        await member.kick('Anti-Raid: Compte trop récent pendant un raid');
        return { isRaid: true, action: 'expulsé', reason: 'Compte trop récent pendant un raid' };
      } catch (error) {
        console.error('[ANTI-RAID] Error kicking member:', error);
      }
    }
    
    return { isRaid: true, action: 'détecté', reason: 'Trop de membres rejoignent en même temps' };
  }
  
  return { isRaid: false };
};

const checkSpam = async (message, client) => {
  const userId = message.author.id;
  const guildId = message.guild.id;
  const now = Date.now();
  const key = `${guildId}-${userId}`;
  
  if (!messageCache.has(key)) {
    messageCache.set(key, []);
  }
  
  const messages = messageCache.get(key);
  messages.push({ content: message.content, timestamp: now });
  
  const recentMessages = messages.filter(m => now - m.timestamp < 5000);
  messageCache.set(key, recentMessages);
  
  if (recentMessages.length > config.antiRaid.maxMessagesPerSecond) {
    try {
      await message.delete();
      const warning = await message.channel.send(`${message.author}, ralentissez ! Vous envoyez des messages trop rapidement.`);
      setTimeout(() => warning.delete().catch(() => {}), 5000);
      return { isSpam: true, reason: 'Messages trop rapides' };
    } catch (error) {
      console.error('[ANTI-SPAM] Error:', error);
    }
  }
  
  const mentions = message.mentions.users.size + message.mentions.roles.size;
  if (mentions > config.antiRaid.maxMentionsPerMessage) {
    try {
      await message.delete();
      const warning = await message.channel.send(`${message.author}, trop de mentions dans votre message !`);
      setTimeout(() => warning.delete().catch(() => {}), 5000);
      return { isSpam: true, reason: 'Trop de mentions' };
    } catch (error) {
      console.error('[ANTI-SPAM] Error:', error);
    }
  }
  
  if (!duplicateCache.has(key)) {
    duplicateCache.set(key, []);
  }
  
  const duplicates = duplicateCache.get(key);
  duplicates.push({ content: message.content, timestamp: now });
  
  const recentDuplicates = duplicates.filter(d => now - d.timestamp < 10000 && d.content === message.content);
  duplicateCache.set(key, duplicates.filter(d => now - d.timestamp < 10000));
  
  if (recentDuplicates.length >= config.antiRaid.duplicateMessageThreshold) {
    try {
      await message.delete();
      const warning = await message.channel.send(`${message.author}, arrêtez de répéter le même message !`);
      setTimeout(() => warning.delete().catch(() => {}), 5000);
      return { isSpam: true, reason: 'Messages dupliqués' };
    } catch (error) {
      console.error('[ANTI-SPAM] Error:', error);
    }
  }
  
  return { isSpam: false };
};

const clearCaches = () => {
  const now = Date.now();
  
  joinCache.forEach((joins, guildId) => {
    joinCache.set(guildId, joins.filter(j => now - j.timestamp < 60000));
  });
  
  messageCache.forEach((messages, key) => {
    messageCache.set(key, messages.filter(m => now - m.timestamp < 5000));
  });
  
  duplicateCache.forEach((duplicates, key) => {
    duplicateCache.set(key, duplicates.filter(d => now - d.timestamp < 10000));
  });
};

setInterval(clearCaches, 30000);

module.exports = {
  checkJoinRaid,
  checkSpam,
  clearCaches
};
