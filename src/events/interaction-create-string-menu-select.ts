import { Events, StringSelectMenuInteraction, Interaction } from 'discord.js';
import mainLogger from '../lib/logger';
import { getCommands } from '../lib/storage';
import { Event } from '../types/Event';

const logger = mainLogger.child({ module: 'commands' });

export default class extends Event {
  constructor() {
    super({ name: Events.InteractionCreate });
  }

  public override async execute(_interaction: Interaction) {
    if (!_interaction.isStringSelectMenu()) return;
    const interaction = _interaction as StringSelectMenuInteraction;
    if (!interaction.message.interaction) return;

    let commandName = interaction.message.interaction.commandName;
    const firstSpace = commandName.indexOf(' ');
    if (firstSpace !== -1) commandName = commandName.substring(0, firstSpace);

    const command = getCommands().get(commandName);

    if (!command) {
      logger.error(`No command matching ${commandName} was found`);
      return;
    }

    try {
      await command.menuSelect(interaction);
    } catch (error) {
      logger.error(
        error,
        `Error while executing menuSelect for command "${commandName}".`
      );
    }
  }
}
