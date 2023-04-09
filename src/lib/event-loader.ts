import { Client } from 'discord.js';
import { readdir } from 'fs/promises';
import { join } from 'path';
import { Event } from '../types/Event';

export async function loadEvents(client: Client) {
  const eventFilesPath = join(__dirname, '..', 'events');
  const eventFiles = await readdir(eventFilesPath);
  for (const file of eventFiles) {
    const module = await import(join(eventFilesPath, file));
    // eslint-disable-next-line new-cap
    const event = new module.default() as Event;
    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args));
    } else {
      client.on(event.name, (...args) => event.execute(...args));
    }
  }
}
