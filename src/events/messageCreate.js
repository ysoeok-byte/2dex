const { Collection } = require('discord.js');
const embeds = require('../utils/embeds');
const serverConfig = require('../utils/serverConfig');
const antiRaid = require('../utils/antiRaid');

module.exports = {
  name: 'messageCreate',
  async execute(message, client) {
    if (message.author.bot) return;
    if (!message.guild) return;
    
    let config = await serverConfig.getConfig(message.guild.id);
    if (!config) {
      config = await serverConfig.createConfig(message.guild.id, message.guild.ownerId);
    }
    
    if (config.anti_spam_enabled) {
      const spamResult = await antiRaid.checkSpam(message, client);
      if (spamResult.isSpam) {
        return;
      }
    }
    
    const prefix = config?.prefix || client.config.prefix;
    if (!message.content.startsWith(prefix)) return;
    
    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    
    const command = client.commands.get(commandName) || 
                    client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
    
    if (!command) return;
    
    if (!client.cooldowns.has(command.name)) {
      client.cooldowns.set(command.name, new Collection());
    }
    
    const now = Date.now();
    const timestamps = client.cooldowns.get(command.name);
    const cooldownAmount = (command.cooldown || 3) * 1000;
    
    if (timestamps.has(message.author.id)) {
      const expirationTime = timestamps.get(message.author.id) + cooldownAmount;
      if (now < expirationTime) {
        const timeLeft = (expirationTime - now) / 1000;
        return message.reply({
          embeds: [embeds.error('Cooldown', `Veuillez attendre ${timeLeft.toFixed(1)} secondes avant de réutiliser \`${command.name}\`.`)]
        });
      }
    }
    
    timestamps.set(message.author.id, now);
    setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
    
    try {
      await command.execute(message, args, client);
    } catch (error) {
      console.error(`[ERROR] Command ${command.name}:`, error);
      message.reply({
        embeds: [embeds.error('Erreur', 'Une erreur est survenue lors de l\'exécution de cette commande.')]
      });
    }
  }
};
