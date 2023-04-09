import { ChatInputCommandInteraction, Events } from 'discord.js';
import logger from '../lib/logger';
import { getCommands } from '../lib/storage';
import { Event } from '../types/Event';

export default class extends Event {
  constructor() {
    super({ name: Events.InteractionCreate });
  }

  public override async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.isChatInputCommand()) return;

    const command = getCommands().get(interaction.commandName);

    if (!command) {
      logger.error(`No command matching ${interaction.commandName} was found`);
      return;
    }

    const commandInfo = {
      user: interaction.user.tag,
      guild: interaction.guild?.name,
    };

    try {
      logger.trace(
        { command: commandInfo },
        `Executing command "${interaction.commandName}".`
      );
      await command.execute(interaction);
      logger.trace(
        { command: commandInfo },
        `Successfully executed command "${interaction.commandName}".`
      );
    } catch (error) {
      logger.error(
        error,
        `Error while executing command "${interaction.commandName}".`
      );
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: 'There was an error while executing this command!',
          ephemeral: true,
        });
      } else {
        await interaction.reply({
          content: 'There was an error while executing this command!',
          ephemeral: true,
        });
      }
    }
  }
}
