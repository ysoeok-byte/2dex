const config = require('../config');

const isBotOwner = (userId) => {
  return config.botOwners.includes(userId);
};

const isServerOwner = (member) => {
  return member.id === member.guild.ownerId;
};

const isAdmin = (member) => {
  return member.permissions.has('Administrator');
};

const isModerator = (member) => {
  return member.permissions.has('ModerateMembers') || 
         member.permissions.has('KickMembers') || 
         member.permissions.has('BanMembers');
};

const canModerate = (moderator, target) => {
  if (!target.guild) return false;
  if (moderator.id === target.id) return false;
  if (target.id === target.guild.ownerId) return false;
  return moderator.roles.highest.position > target.roles.highest.position;
};

module.exports = {
  isBotOwner,
  isServerOwner,
  isAdmin,
  isModerator,
  canModerate
};
