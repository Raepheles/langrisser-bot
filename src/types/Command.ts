import {
  AutocompleteInteraction,
  CommandInteraction,
  SlashCommandBuilder,
  StringSelectMenuInteraction,
  SlashCommandSubcommandsOnlyBuilder,
} from 'discord.js';

export class Command {
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
    admin: boolean = false
  ) {
    this.data = data;
    this.admin = admin;
  }

  async execute(_interaction: CommandInteraction) {}

  async autocomplete(_interaction: AutocompleteInteraction) {}

  async menuSelect(_interaction: StringSelectMenuInteraction) {}
}
