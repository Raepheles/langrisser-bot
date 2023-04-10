import { ClientEvents } from 'discord.js';

interface EventOptions {
  name: keyof ClientEvents;
  once?: boolean;
}

export class Event {
  name: keyof ClientEvents;
  once = false;

  constructor({ name, once }: EventOptions) {
    this.name = name;
    if (once !== undefined) this.once = once;
  }

  async execute(..._args: ClientEvents[typeof this.name]) {
    throw new Error(
      `Event "${this.name}" doesn't have an execute() method implemented.`
    );
  }
}
