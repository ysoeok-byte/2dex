const embeds = require('../../utils/embeds');

module.exports = {
  name: 'ping',
  description: 'Affiche la latence du bot',
  aliases: ['latency', 'pong'],
  category: 'general',
  cooldown: 5,
  async execute(message, args, client) {
    const sent = await message.reply({ embeds: [embeds.info('Ping', '🏓 Calcul en cours...')] });
    const latency = sent.createdTimestamp - message.createdTimestamp;
    const apiLatency = Math.round(client.ws.ping);
    
    sent.edit({
      embeds: [embeds.info('Pong!', `🏓 Latence: **${latency}ms**\n📡 API Discord: **${apiLatency}ms**`)]
    });
  }
};
