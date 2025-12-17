module.exports = {
  prefix: '!',
  botOwners: process.env.BOT_OWNERS ? process.env.BOT_OWNERS.split(',') : [],
  embedColor: '#5865F2',
  premiumColor: '#FFD700',
  errorColor: '#FF0000',
  successColor: '#00FF00',
  antiRaid: {
    maxJoinsPerMinute: 10,
    maxMessagesPerSecond: 5,
    maxMentionsPerMessage: 5,
    duplicateMessageThreshold: 3,
    newAccountAge: 7
  }
};
