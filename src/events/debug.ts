import { Events } from 'discord.js';
import mainLogger from '../lib/logger';
import { Event } from '../types/Event';

const logger = mainLogger.child({ module: 'internal' });

export default class extends Event {
  constructor() {
    super({ name: Events.Debug });
  }

  public override async execute(msg: string) {
    logger.debug(msg);
  }
}
