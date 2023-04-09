import { AutocompleteInteraction, Events } from 'discord.js';
import mainLogger from '../lib/logger';
import { getCommands } from '../lib/storage';
import { Event } from '../types/Event';

const logger = mainLogger.child({ module: 'commands' });

export default class extends Event {
  constructor() {
    super({ name: Events.InteractionCreate });
  }

  public override async execute(interaction: AutocompleteInteraction) {
    if (!interaction.isAutocomplete()) return;

    const command = getCommands().get(interaction.commandName);

    if (!command) {
      logger.error(`No command matching ${interaction.commandName} was found`);
      return;
    }

    try {
      await command.autocomplete(interaction);
    } catch (error) {
      logger.error(
        error,
        `Error while executing autocomplete for command "${interaction.commandName}".`
      );
    }
  }
}
