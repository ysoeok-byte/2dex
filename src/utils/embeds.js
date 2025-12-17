const { EmbedBuilder } = require('discord.js');
const config = require('../config');

const success = (title, description) => {
  return new EmbedBuilder()
    .setColor(config.successColor)
    .setTitle(`✅ ${title}`)
    .setDescription(description)
    .setTimestamp();
};

const error = (title, description) => {
  return new EmbedBuilder()
    .setColor(config.errorColor)
    .setTitle(`❌ ${title}`)
    .setDescription(description)
    .setTimestamp();
};

const info = (title, description) => {
  return new EmbedBuilder()
    .setColor(config.embedColor)
    .setTitle(`ℹ️ ${title}`)
    .setDescription(description)
    .setTimestamp();
};

const premium = (title, description) => {
  return new EmbedBuilder()
    .setColor(config.premiumColor)
    .setTitle(`⭐ ${title}`)
    .setDescription(description)
    .setTimestamp();
};

const moderation = (action, target, moderator, reason) => {
  return new EmbedBuilder()
    .setColor(config.embedColor)
    .setTitle(`🔨 ${action}`)
    .addFields(
      { name: 'Utilisateur', value: `${target.user?.tag || target.tag || target}`, inline: true },
      { name: 'Modérateur', value: `${moderator.user?.tag || moderator.tag}`, inline: true },
      { name: 'Raison', value: reason || 'Aucune raison fournie' }
    )
    .setTimestamp();
};

const antiRaid = (title, description) => {
  return new EmbedBuilder()
    .setColor('#FF6B6B')
    .setTitle(`🛡️ ${title}`)
    .setDescription(description)
    .setTimestamp();
};

module.exports = {
  success,
  error,
  info,
  premium,
  moderation,
  antiRaid
};
