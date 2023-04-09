import { Events } from 'discord.js';
import logger from '../lib/logger';
import { Event } from '../types/Event';

export default class extends Event {
  constructor() {
    super({ name: Events.ClientReady, once: true });
  }

  public override async execute() {
    logger.info('Client is ready!');
  }
}
