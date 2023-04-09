import {
  ActionRowBuilder,
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuInteraction,
} from 'discord.js';
import logger from '../lib/logger';
import { getHeroes } from '../lib/storage';
import { Command } from '../types/Command';
import { Hero } from '../types/Hero';
import { WIKI_HEROES_URL } from '../utils/constants';
import { findSimilarStrings } from '../utils/string';

export default class extends Command {
  selectedHero: Hero | undefined;

  constructor() {
    super(
      new SlashCommandBuilder()
        .setName('image')
        .setDescription('Sends the image of the hero or skin')
        .addStringOption((option) =>
          option
            .setRequired(true)
            .setName('name')
            .setDescription('Name of the hero you want to search for.')
            .setAutocomplete(true)
        )
    );
  }

  public override async menuSelect(interaction: StringSelectMenuInteraction) {
    await interaction.deferUpdate();
    await interaction.editReply({
      embeds: [
        {
          color: 0xd0c193,
          title: this.selectedHero!.name,
          url: `${WIKI_HEROES_URL}/heroes/${encodeURI(
            this.selectedHero!.code
          )}`,
          image: { url: interaction.values[0] },
          timestamp: new Date().toISOString(),
          footer: {
            text: `Requested by ${interaction.user.tag}`,
          },
        },
      ],
    });
  }

  public override async autocomplete(interaction: AutocompleteInteraction) {
    const focusedValue = interaction.options.getFocused().toLowerCase();
    const heroes = getHeroes();
    const heroCodes = heroes.map((hero) => hero.code);
    const similarHeroes = findSimilarStrings(focusedValue, heroCodes);
    await interaction.respond(
      similarHeroes.map((code) => ({
        name: heroes.get(code)!.name,
        value: code,
      }))
    );
  }

  public override async execute(interaction: ChatInputCommandInteraction) {
    const ephemeral = interaction.options.getBoolean('ephemeral') ?? true;
    const selectedHeroText = interaction.options
      .getString('name')!
      .toLowerCase();
    const selectedHero = getHeroes().get(selectedHeroText);
    if (!selectedHero) {
      await interaction.reply({
        content: `Hero with code ${selectedHeroText} not found!`,
        ephemeral: true,
      });
      return;
    }
    this.selectedHero = selectedHero;

    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('select')
        .setPlaceholder('Nothing selected')
        .addOptions(
          {
            label: 'Base',
            description: 'Base skin',
            value: `${WIKI_HEROES_URL}/${selectedHero.name}/${selectedHero.name}.png`,
          },
          ...(selectedHero.spHero
            ? [
                {
                  label: 'SP',
                  description: 'SP skin',
                  value: `${WIKI_HEROES_URL}/${selectedHero.name}/${encodeURI(
                    `${selectedHero.name} SP`
                  )}.png`,
                },
              ]
            : []),
          ...selectedHero.skins
            .filter((s) => s.name)
            .map((skin) => ({
              label: skin.name!,
              description: skin.name!,
              value: `${WIKI_HEROES_URL}/${selectedHero.name}/${encodeURI(
                `${selectedHero.name} Skin ${skin.index}`
              )}.png`,
            }))
        )
    );

    await interaction.reply({
      ephemeral,
      embeds: [
        {
          color: 0xd0c193,
          title: selectedHero.name,
          url: `${WIKI_HEROES_URL}/heroes/${encodeURI(selectedHero.code)}`,
          description: 'Select the skin you want to see',
          timestamp: new Date().toISOString(),
          footer: {
            text: `Requested by ${interaction.user.tag}`,
          },
        },
      ],
      components: [row],
    });
  }
}
