import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  time,
  TimestampStyles,
} from 'discord.js';
import { getStartDate } from '../lib/storage';
import { Command } from '../types/Command';

export default class extends Command {
  constructor() {
    super(
      new SlashCommandBuilder()
        .setName('about')
        .setDescription('About this bot')
    );
  }

  public override async execute(interaction: ChatInputCommandInteraction) {
    const { OWNER_ID } = process.env;
    if (!OWNER_ID) {
      throw new Error('OWNER_ID is not defined.');
    }
    const ephemeral = interaction.options.getBoolean('ephemeral') ?? true;
    const botOwner = await interaction.client.users.fetch(OWNER_ID);
    const guildCount = interaction.client.guilds.cache.size;
    // fetch all guild members to update cache
    await Promise.all(
      interaction.client.guilds.cache.map((guild) => guild.members.fetch())
    );
    const userCount = interaction.client.guilds.cache.reduce((acc, guild) => {
      const guildMembers = guild.members.cache.map((member) => member.user.id);
      guildMembers.forEach(acc.add, acc);
      return acc;
    }, new Set<string>()).size;
    await interaction.reply({
      ephemeral,
      embeds: [
        {
          color: 0xfeeacf,
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
