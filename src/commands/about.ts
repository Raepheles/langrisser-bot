import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  time,
  TimestampStyles,
} from 'discord.js';
import { getStartDate } from '../lib/storage';
import { Command } from '../types/Command';
import { EMBED_COLOR_DEFAULT, DefaultOptions } from '../utils/constants';
import { ephemeralOptionAdder } from '../utils/utils';

export default class extends Command {
  constructor() {
    super(
      new SlashCommandBuilder()
        .setName('about')
        .setDescription('About this bot')
        .addBooleanOption(ephemeralOptionAdder)
    );
  }

  public override async execute(interaction: ChatInputCommandInteraction) {
    const ephemeral =
      interaction.options.getBoolean(DefaultOptions.EPHEMERAL) ?? true;
    await interaction.deferReply({ ephemeral });
    const { OWNER_ID } = process.env;
    if (!OWNER_ID) {
      throw new Error('OWNER_ID is not defined.');
    }
    const botOwner = await interaction.client.users.fetch(OWNER_ID);
    const guildCount = interaction.client.guilds.cache.size;
    const userCount = interaction.client.guilds.cache.reduce(
      (acc, guild) => acc + guild.memberCount,
      0
    );
    await interaction.editReply({
      embeds: [
        {
          color: EMBED_COLOR_DEFAULT,
          title: interaction.client.user.username,
          description:
            'Lana is a bot I made for Langrisser Mobile. The data provided by the bot is taken \
            from [wikigrisser.com](https://wikigrisser-next.com). If you have any questions you can join \
            the [support server](https://discord.gg/hJdPnk8).',
          thumbnail: {
            url: interaction.client.user.displayAvatarURL(),
          },
          timestamp: new Date().toISOString(),
          footer: {
            text: `Made by ${botOwner.tag} with ❤️`,
            icon_url: botOwner.displayAvatarURL(),
          },
          fields: [
            {
              name: 'Number of servers',
              value: guildCount.toString(),
              inline: true,
            },
            {
              name: 'Number of users',
              value: userCount.toString(),
              inline: true,
            },
            {
              name: 'Uptime',
              value: time(getStartDate(), TimestampStyles.RelativeTime),
              inline: true,
            },
            {
              name: 'Version',
              value: process.env.npm_package_version ?? 'unknown',
              inline: true,
            },
            {
              name: '',
              value: '',
              inline: true,
            },
            {
              name: '',
              value: '',
              inline: true,
            },
          ],
        },
      ],
    });
  }
}
