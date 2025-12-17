# Discord Moderation & Anti-Raid Bot

## Overview
A comprehensive Discord moderation bot with premium features, anti-raid protection, and a premium code system.

## Project Structure
```
src/
├── index.js           # Main entry point
├── config.js          # Bot configuration
├── database/
│   └── db.js          # PostgreSQL database connection
├── commands/
│   ├── general/       # General commands (help, ping, serverinfo, userinfo)
│   ├── moderation/    # Moderation commands (kick, ban, mute, warn, etc.)
│   ├── premium/       # Premium commands (premium, redeem)
│   ├── antiraid/      # Anti-raid commands (antiraid, antispam, lockdown, massban)
│   └── owner/         # Bot owner commands (gencode, codes, botstats, etc.)
├── events/            # Discord event handlers
└── utils/             # Utility functions
    ├── premium.js     # Premium system
    ├── permissions.js # Permission checks
    ├── embeds.js      # Embed builders
    ├── moderation.js  # Moderation logging
    ├── serverConfig.js # Server configuration
    └── antiRaid.js    # Anti-raid protection
```

## Features

### Free Features
- Basic moderation: kick, ban, unban, mute, unmute, warn
- Warning system with history
- Message clearing
- Moderation logs
- Server/user info

### Premium Features (requires server owner to have premium)
- Anti-raid protection (mass join detection)
- Anti-spam system (message rate limiting, duplicate detection)
- Server lockdown
- Mass ban
- Custom log channel

### Bot Owner Commands
- Generate premium codes
- View all codes
- View premium users
- Revoke premium
- Bot statistics
- Announcement system
- Eval command

## Environment Variables Required
- `DISCORD_TOKEN` - Your Discord bot token
- `BOT_OWNERS` - Comma-separated list of Discord user IDs for bot owners
- `DATABASE_URL` - PostgreSQL connection string (auto-configured)

## Commands
Prefix: `!`

### General
- `!help [command]` - Show commands or command details
- `!ping` - Check bot latency
- `!serverinfo` - Server information
- `!userinfo [@user]` - User information

### Moderation
- `!kick @user [reason]` - Kick a member
- `!ban @user [reason]` - Ban a member
- `!unban <user_id>` - Unban a user
- `!mute @user <minutes> [reason]` - Timeout a member
- `!unmute @user` - Remove timeout
- `!warn @user [reason]` - Warn a member
- `!warnings [@user]` - View warnings
- `!clearwarns @user` - Clear all warnings
- `!clear <amount>` - Delete messages
- `!modlogs [amount]` - View moderation logs

### Premium
- `!premium` - View premium info
- `!redeem <code>` - Activate premium code

### Anti-Raid (Premium)
- `!antiraid <on/off>` - Toggle anti-raid
- `!antispam <on/off>` - Toggle anti-spam
- `!lockdown [unlock]` - Lock/unlock server
- `!massban @users [reason]` - Mass ban users
- `!setlogchannel #channel` - Set log channel

### Owner Only
- `!gencode <days> [quantity]` - Generate premium codes
- `!codes [unused]` - List codes
- `!premiumusers` - List premium users
- `!revokepremium @user` - Revoke premium
- `!botstats` - Bot statistics
- `!announce <message>` - Broadcast to all servers
- `!owners` - View bot owners

## Recent Changes
- Initial setup with full moderation suite
- Premium code system implemented
- Anti-raid and anti-spam protection added
- Database schema created for persistence
