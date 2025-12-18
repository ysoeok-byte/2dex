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
- Role management
- Nickname changing
- Chat muting (slowmode)
- Moderation logs
- Server/user info

### Premium Features (requires server owner to have premium)
- **Advanced Anti-Raid:**
  - Mass join detection and auto-kick
  - Anti-spam system (rate limiting, duplicate detection, mention spam)
  - Server lockdown (lock/unlock all channels)
  - Mass ban
  - Mass kick
  - Mass mute/unmute
  - Channel nuke (delete all messages)
- Custom log channel
- Dedicated premium commands

### Bot Owner Commands
- Generate premium codes (customizable duration)
- View all codes with usage stats
- View premium users with expiration dates
- Revoke premium from users
- Bot statistics and metrics
- Server announcement system
- Code evaluation (dev command)

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
- `!role <add/remove> @user @role` - Add/remove roles
- `!nick @user <new_name>` - Change nickname
- `!mutechat <on/off> [slowmode]` - Mute chat for members

### Premium
- `!premium` - View premium info
- `!redeem <code>` - Activate premium code

### Anti-Raid (Premium)
- `!antiraid <on/off>` - Toggle anti-raid
- `!antispam <on/off>` - Toggle anti-spam
- `!lockdown [unlock]` - Lock/unlock all channels
- `!massban @users [reason]` - Mass ban users
- `!banall [except:@user] [reason]` - Ban ALL members (with confirmation)
- `!kickall [except:@user] [reason]` - Kick ALL members (with confirmation)
- `!muteall <minutes> [reason]` - Mute all members
- `!unmuteall` - Unmute all members
- `!nuke [#channel]` - Delete all messages in channel
- `!setlogchannel #channel` - Set log channel

### Owner Only
- `!gencode <days> [quantity]` - Generate premium codes
- `!codes [unused]` - List all codes
- `!premiumusers` - List premium users
- `!revokepremium @user` - Revoke premium
- `!botstats` - Bot statistics
- `!announce <message>` - Broadcast to all servers
- `!owners` - View bot owners
- `!eval <code>` - Execute JavaScript (dangerous!)

## Database Schema
The bot uses PostgreSQL with the following tables:
- `premium_codes` - Generated premium codes and redemption status
- `premium_users` - Users with active premium subscriptions
- `server_configs` - Per-server configuration (prefixes, logs, features)
- `warnings` - User warnings with history
- `moderation_logs` - Complete audit log of all moderation actions
- `bot_stats` - Bot-wide statistics

## Recent Changes
- Added 8 new commands: banall, kickall, muteall, unmuteall, nuke, role, nick, mutechat
- Expanded premium feature set with bulk operations
- Added safety confirmations for destructive operations
- Role and nickname management added
- Channel-level chat muting with slowmode
- Total of 38 commands now available
