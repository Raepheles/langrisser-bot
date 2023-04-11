# langrisser-bot

A discord bot for the mobile game Langrisser.

# Changelog

# 0.2.3
- Fixed a bug with `/about` command.
- `/about` command provides doesn't provide unique user count anymore.
- Added ephemeral option back to `/about` command.
# 0.2.2
- Fixed a bug that occured while using `/hero image` command if the hero name was too long.

# 0.2.1
- Bug fixes

## 0.2.0
- Removed `/image` and `/bond` commands and added them as subcommands to `/hero` command.
- Added `/hero skill` command to look up for hero skills.
- `/hero image` command's select menu doesn't disappear anymore after choosing an option.
- All menus are now only interactable by the user who initiated the command.
  - *Only matters if the user has used the command with `ephemeral=false` option.*
- All subcommands of `/hero` command now shows icons of the hero's factions on embed's title.
- Added `/skill` command.

## 0.1.0
- Initial version