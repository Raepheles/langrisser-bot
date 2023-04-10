import {
  AutocompleteInteraction,
  CommandInteraction,
  SlashCommandBuilder,
  StringSelectMenuInteraction,
  SlashCommandSubcommandsOnlyBuilder,
} from 'discord.js';

export abstract class Command {
  data:
    | SlashCommandBuilder
    | Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>
    | SlashCommandSubcommandsOnlyBuilder;

  admin: boolean;

  constructor(
    data:
      | SlashCommandBuilder
      | Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>
      | SlashCommandSubcommandsOnlyBuilder,
    admin = false
  ) {
    this.data = data;
    this.admin = admin;
  }

  async execute(_interaction: CommandInteraction) {
    throw new Error(
      `Command "${this.data.name}" doesn't have an execute() method implemented.`
    );
  }

  async autocomplete(_interaction: AutocompleteInteraction) {
    throw new Error(
      `Command "${this.data.name}" doesn't have an autocomplete() method implemented.`
    );
  }

  async menuSelect(_interaction: StringSelectMenuInteraction) {
    throw new Error(
      `Command "${this.data.name}" doesn't have a menuSelect() method implemented.`
    );
  }
}
