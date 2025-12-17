const { ActivityType } = require('discord.js');

module.exports = {
  name: 'ready',
  once: true,
  execute(client) {
    console.log(`[BOT] Logged in as ${client.user.tag}`);
    console.log(`[BOT] Serving ${client.guilds.cache.size} servers`);
    
    client.user.setPresence({
      activities: [{ name: `${client.guilds.cache.size} serveurs | !help`, type: ActivityType.Watching }],
      status: 'online'
    });
    
    setInterval(() => {
      client.user.setPresence({
        activities: [{ name: `${client.guilds.cache.size} serveurs | !help`, type: ActivityType.Watching }],
        status: 'online'
      });
    }, 60000);
  }
};
