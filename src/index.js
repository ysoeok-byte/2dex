require('dotenv').config();
const { Client, GatewayIntentBits, Collection, Partials } = require('discord.js');
const fs = require('fs');
const path = require('path');
const db = require('./database/db');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildBans,
    GatewayIntentBits.GuildModeration
  ],
  partials: [Partials.Message, Partials.Channel, Partials.GuildMember]
});

client.commands = new Collection();
client.cooldowns = new Collection();
client.config = require('./config');

const loadCommands = () => {
  const commandFolders = fs.readdirSync(path.join(__dirname, 'commands'));
  for (const folder of commandFolders) {
    const commandFiles = fs.readdirSync(path.join(__dirname, 'commands', folder)).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
      const command = require(path.join(__dirname, 'commands', folder, file));
      if (command.name) {
        client.commands.set(command.name, command);
        console.log(`[COMMAND] Loaded: ${command.name}`);
      }
    }
  }
};

const loadEvents = () => {
  const eventFiles = fs.readdirSync(path.join(__dirname, 'events')).filter(file => file.endsWith('.js'));
  for (const file of eventFiles) {
    const event = require(path.join(__dirname, 'events', file));
    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args, client));
    } else {
      client.on(event.name, (...args) => event.execute(...args, client));
    }
    console.log(`[EVENT] Loaded: ${event.name}`);
  }
};

const init = async () => {
  try {
    console.log('[BOT] Initializing database...');
    await db.init();
    console.log('[BOT] Database initialized successfully');
    
    console.log('[BOT] Loading commands...');
    loadCommands();
    
    console.log('[BOT] Loading events...');
    loadEvents();
    
    console.log('[BOT] Logging in...');
    await client.login(process.env.DISCORD_TOKEN);
  } catch (error) {
    console.error('[BOT] Error during initialization:', error);
    process.exit(1);
  }
};

init();
