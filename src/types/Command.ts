import {
  AutocompleteInteraction,
  CommandInteraction,
  SlashCommandBuilder,
  StringSelectMenuInteraction,
} from 'discord.js';

export class Command {
  data:
    | SlashCommandBuilder
    | Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>;

  admin: boolean;

  constructor(
    data:
      | SlashCommandBuilder
      | Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>,
    admin: boolean = false
  ) {
    this.data = data.addBooleanOption((option) =>
      option
        .setName('ephemeral')
        .setDescription(
          'Whether the bot reply should be visible only to you. Default: true'
        )
        .setRequired(false)
    );
    this.admin = admin;
  }

  async execute(_interaction: CommandInteraction) {}

  async autocomplete(_interaction: AutocompleteInteraction) {}

  async menuSelect(_interaction: StringSelectMenuInteraction) {}
}
