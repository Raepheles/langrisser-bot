import { Events, Guild } from 'discord.js';
import logger from '../lib/logger';
import { Event } from '../types/Event';

export default class extends Event {
  constructor() {
    super({ name: Events.GuildDelete });
  }

  public override async execute(guild: Guild) {
    const guildInfo = {
      name: guild.name,
      owner: {
        name: guild.client.users.cache.get(guild.ownerId)?.tag ?? '-',
        id: guild.ownerId,
      },
      members: guild.memberCount,
    };
    logger.trace({ data: { guild: guildInfo } }, 'A guild has been deleted');
  }
}
